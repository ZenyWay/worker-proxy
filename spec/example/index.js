(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
;
function isObject(val) {
    return !!val && (typeof val === 'object');
}
exports.isObject = isObject;
function isArrayLike(val) {
    return isObject(val) && isNumber(val.length);
}
exports.isArrayLike = isArrayLike;
function isFunction(val) {
    return typeof val === 'function';
}
exports.isFunction = isFunction;
function isString(val) {
    return typeof val === 'string';
}
exports.isString = isString;
function isNumber(val) {
    return typeof val === 'number';
}
exports.isNumber = isNumber;
function assert(val, errorConstructor, message) {
    if (val)
        return;
    throw new errorConstructor(message);
}
exports.assert = assert;

},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
;
var utils_1 = require("../common/utils");
var debug = require("debug");
var log = debug('index-generator');
var IndexGeneratorClass = (function () {
    function IndexGeneratorClass(index) {
        this.index = index;
    }
    IndexGeneratorClass.newInstance = function (start) {
        return new IndexGeneratorClass(Number.isSafeInteger(start) ? start : 0);
    };
    IndexGeneratorClass.isIndexGenerator = function (val) {
        return utils_1.isObject(val) && utils_1.isFunction(val.next) && utils_1.isNumber(val.next());
    };
    IndexGeneratorClass.prototype.next = function () {
        return (Number.isSafeInteger(++this.index)) ?
            this.index : this.index = Number.MIN_SAFE_INTEGER;
    };
    IndexGeneratorClass.prototype.value = function () {
        return this.index;
    };
    return IndexGeneratorClass;
}());
exports.isIndexGenerator = IndexGeneratorClass.isIndexGenerator;
var newIndexGenerator = IndexGeneratorClass.newInstance;
exports.default = newIndexGenerator;

},{"../common/utils":1,"debug":undefined}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
;
var indexed_queue_1 = require("./indexed-queue");
var utils_1 = require("../common/utils");
var Promise = require("bluebird");
var debug = require("debug");
var log = debug('worker-proxy');
var ServiceProxyClass = (function () {
    function ServiceProxyClass(spec) {
        this.worker = spec.worker;
        this.hasObjectUrl = utils_1.isString(getObjectUrl(this.worker));
        this.revokeObjectURL = spec.revokeObjectURL;
        this.worker.onmessage = this.onmessage.bind(this);
        this.calls = spec.queue;
        this.timeout = spec.timeout;
        this.service = this.call({ method: 'getServiceMethods' })
            .call('reduce', this.proxyServiceMethod.bind(this), {});
    }
    ServiceProxyClass.newInstance = function (worker, opts) {
        var specs = {};
        specs.timeout =
            opts && utils_1.isNumber(opts.timeout) ? opts.timeout : ServiceProxyClass.timeout;
        specs.worker = toWorker(worker, opts && opts.workify);
        specs.queue =
            opts && indexed_queue_1.isIndexedQueue(opts.queue) ? opts.queue : indexed_queue_1.default();
        specs.revokeObjectURL =
            opts && opts.revokeObjectURL || URL.revokeObjectURL.bind(URL);
        var proxy = new ServiceProxyClass(specs);
        log('ServiceProxyClass.newInstance', proxy);
        return ({
            service: proxy.service,
            kill: proxy.kill.bind(proxy),
            terminate: proxy.terminate.bind(proxy)
        });
    };
    ServiceProxyClass.prototype.kill = function () {
        this.worker.terminate();
    };
    ServiceProxyClass.prototype.terminate = function () {
        var _this = this;
        return this.call({ method: 'onterminate' })
            .then(function () { return _this.kill(); });
    };
    ServiceProxyClass.prototype.onmessage = function (event) {
        if (this.hasObjectUrl) {
            this.revokeObjectUrl();
        }
        if (!this.calls.has(event.data.uuid)) {
            return;
        }
        var call = this.calls.pop(event.data.uuid);
        if (!utils_1.isObject(call) || !utils_1.isFunction(call[event.data.method])) {
            return;
        }
        log('WorkerService.onmessage target method', event.data.method);
        var args = utils_1.isArrayLike(event.data.args) ? event.data.args : [];
        call[event.data.method].apply(undefined, args);
    };
    ServiceProxyClass.prototype.call = function (spec) {
        var _this = this;
        log('ServiceProxy.call', spec);
        var data = tslib_1.__assign({}, spec);
        var result = new Promise(function (resolve, reject) {
            data.uuid = _this.calls.push({
                resolve: resolve,
                reject: reject
            });
        })
            .timeout(this.timeout)
            .catch(Promise.TimeoutError, function (err) {
            log('ServiceProxy.call uuid =', data.uuid, err);
            _this.calls.has(data.uuid) && _this.calls.pop(data.uuid);
            return Promise.reject(err);
        });
        setTimeout(this.worker.postMessage.bind(this.worker, data));
        return result;
    };
    ServiceProxyClass.prototype.proxyServiceMethod = function (service, method) {
        service[method] = (function () {
            return this.call({
                target: 'service',
                method: method,
                args: Array.prototype.slice.call(arguments)
            });
        }).bind(this);
        return service;
    };
    ServiceProxyClass.prototype.revokeObjectUrl = function () {
        this.hasObjectUrl = false;
        this.revokeObjectURL(getObjectUrl(this.worker));
    };
    return ServiceProxyClass;
}());
ServiceProxyClass.timeout = 3 * 60 * 1000;
function toWorker(val, workify) {
    if (isWorker(val)) {
        return val;
    }
    try {
        if (utils_1.isFunction(val)) {
            return (utils_1.isFunction(workify) ? workify : require('webworkify'))(val);
        }
        if (utils_1.isString(val)) {
            return new Worker(val);
        }
    }
    catch (err) { }
    throw new TypeError('invalid argument');
}
function getObjectUrl(worker) {
    return worker.objectURL;
}
function isWorker(val) {
    return utils_1.isObject(val) && utils_1.isFunction(val.postMessage)
        && utils_1.isFunction(val.terminate);
}
var newServiceProxy = ServiceProxyClass.newInstance;
exports.default = newServiceProxy;

},{"../common/utils":1,"./indexed-queue":4,"bluebird":undefined,"debug":undefined,"tslib":5,"webworkify":6}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
;
var index_generator_1 = require("./index-generator");
var utils_1 = require("../common/utils");
var debug = require("debug");
var log = debug('indexed-queue');
var IndexedQueueClass = (function () {
    function IndexedQueueClass(index) {
        this.index = index;
        this._length = 0;
        this._queue = {};
    }
    IndexedQueueClass.getInstance = function (opts) {
        var index = utils_1.isObject(opts) && index_generator_1.isIndexGenerator(opts.index) ?
            opts.index : index_generator_1.default();
        return new IndexedQueueClass(index);
    };
    IndexedQueueClass.isIndexedQueue = function (val) {
        return utils_1.isObject(val) &&
            [val.pop, val.push, val.length, val.has].every(utils_1.isFunction);
    };
    IndexedQueueClass.prototype.pop = function (index) {
        utils_1.assert(this.has(index), ReferenceError, 'invalid reference');
        var val = this._queue[index];
        delete this._queue[index];
        this._length--;
        log('Queue.length', this._length);
        return val;
    };
    IndexedQueueClass.prototype.push = function (val) {
        utils_1.assert(!!arguments.length, ReferenceError, 'missing argument');
        var index = this.index.next();
        utils_1.assert(!this.has(index), Error, "internal resource conflict for index " + index);
        this._queue[index] = val;
        this._length++;
        log('Queue.length', this._length);
        return index;
    };
    IndexedQueueClass.prototype.length = function () {
        return this._length;
    };
    IndexedQueueClass.prototype.has = function (index) {
        return (typeof index === 'number') && index in this._queue;
    };
    return IndexedQueueClass;
}());
exports.isIndexedQueue = IndexedQueueClass.isIndexedQueue;
var newIndexedQueue = IndexedQueueClass.getInstance;
exports.default = newIndexedQueue;

},{"../common/utils":1,"./index-generator":2,"debug":undefined}],5:[function(require,module,exports){
(function (global){
/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global global, define, System, Reflect, Promise */
var __extends;
var __assign;
var __rest;
var __decorate;
var __param;
var __metadata;
var __awaiter;
var __generator;
var __exportStar;
var __values;
var __read;
var __spread;
var __await;
var __asyncGenerator;
var __asyncDelegator;
var __asyncValues;
(function (factory) {
    var root = typeof global === "object" ? global : typeof self === "object" ? self : typeof this === "object" ? this : {};
    if (typeof define === "function" && define.amd) {
        define("tslib", ["exports"], function (exports) { factory(createExporter(root, createExporter(exports))); });
    }
    else if (typeof module === "object" && typeof module.exports === "object") {
        factory(createExporter(root, createExporter(module.exports)));
    }
    else {
        factory(createExporter(root));
    }
    function createExporter(exports, previous) {
        return function (id, v) { return exports[id] = previous ? previous(id, v) : v; };
    }
})
(function (exporter) {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };

    __extends = function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };

    __assign = Object.assign || function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };

    __rest = function (s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
                t[p[i]] = s[p[i]];
        return t;
    };

    __decorate = function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };

    __param = function (paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); }
    };

    __metadata = function (metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
    };

    __awaiter = function (thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };

    __generator = function (thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [0, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    };

    __exportStar = function (m, exports) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    };

    __values = function (o) {
        var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
        if (m) return m.call(o);
        return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
    };

    __read = function (o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    };

    __spread = function () {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    };

    __await = function (v) {
        return this instanceof __await ? (this.v = v, this) : new __await(v);
    };

    __asyncGenerator = function (thisArg, _arguments, generator) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var g = generator.apply(thisArg, _arguments || []), i, q = [];
        return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
        function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
        function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
        function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);  }
        function fulfill(value) { resume("next", value); }
        function reject(value) { resume("throw", value); }
        function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
    };

    __asyncDelegator = function (o) {
        var i, p;
        return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
        function verb(n) { if (o[n]) i[n] = function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : v; }; }
    };

    __asyncValues = function (o) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var m = o[Symbol.asyncIterator];
        return m ? m.call(o) : typeof __values === "function" ? __values(o) : o[Symbol.iterator]();
    };

    exporter("__extends", __extends);
    exporter("__assign", __assign);
    exporter("__rest", __rest);
    exporter("__decorate", __decorate);
    exporter("__param", __param);
    exporter("__metadata", __metadata);
    exporter("__awaiter", __awaiter);
    exporter("__generator", __generator);
    exporter("__exportStar", __exportStar);
    exporter("__values", __values);
    exporter("__read", __read);
    exporter("__spread", __spread);
    exporter("__await", __await);
    exporter("__asyncGenerator", __asyncGenerator);
    exporter("__asyncDelegator", __asyncDelegator);
    exporter("__asyncValues", __asyncValues);
});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],6:[function(require,module,exports){
var bundleFn = arguments[3];
var sources = arguments[4];
var cache = arguments[5];

var stringify = JSON.stringify;

module.exports = function (fn, options) {
    var wkey;
    var cacheKeys = Object.keys(cache);

    for (var i = 0, l = cacheKeys.length; i < l; i++) {
        var key = cacheKeys[i];
        var exp = cache[key].exports;
        // Using babel as a transpiler to use esmodule, the export will always
        // be an object with the default export as a property of it. To ensure
        // the existing api and babel esmodule exports are both supported we
        // check for both
        if (exp === fn || exp && exp.default === fn) {
            wkey = key;
            break;
        }
    }

    if (!wkey) {
        wkey = Math.floor(Math.pow(16, 8) * Math.random()).toString(16);
        var wcache = {};
        for (var i = 0, l = cacheKeys.length; i < l; i++) {
            var key = cacheKeys[i];
            wcache[key] = key;
        }
        sources[wkey] = [
            Function(['require','module','exports'], '(' + fn + ')(self)'),
            wcache
        ];
    }
    var skey = Math.floor(Math.pow(16, 8) * Math.random()).toString(16);

    var scache = {}; scache[wkey] = wkey;
    sources[skey] = [
        Function(['require'], (
            // try to call default if defined to also support babel esmodule
            // exports
            'var f = require(' + stringify(wkey) + ');' +
            '(f.default ? f.default : f)(self);'
        )),
        scache
    ];

    var workerSources = {};
    resolveSources(skey);

    function resolveSources(key) {
        workerSources[key] = true;

        for (var depPath in sources[key][1]) {
            var depKey = sources[key][1][depPath];
            if (!workerSources[depKey]) {
                resolveSources(depKey);
            }
        }
    }

    var src = '(' + bundleFn + ')({'
        + Object.keys(workerSources).map(function (key) {
            return stringify(key) + ':['
                + sources[key][0]
                + ',' + stringify(sources[key][1]) + ']'
            ;
        }).join(',')
        + '},{},[' + stringify(skey) + '])'
    ;

    var URL = window.URL || window.webkitURL || window.mozURL || window.msURL;

    var blob = new Blob([src], { type: 'text/javascript' });
    if (options && options.bare) { return blob; }
    var workerUrl = URL.createObjectURL(blob);
    var worker = new Worker(workerUrl);
    worker.objectURL = workerUrl;
    return worker;
};

},{}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
;
var proxy_1 = require("../../dist/proxy");
var debug = require("debug");
var log = debug('example');
debug.enable('*');
var proxy = proxy_1.default('./worker.js');
var terminate = proxy.terminate.bind(proxy);
log(proxy);
proxy.service
    .call('toUpperCase', 'Rob says wow!')
    .tap(log)
    .then(terminate)
    .catch(function (err) { return log(err) || proxy.kill(); });

},{"../../dist/proxy":3,"debug":undefined}]},{},[7]);
