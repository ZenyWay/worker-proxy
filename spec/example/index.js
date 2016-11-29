(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = newIndexGenerator;

},{"../common/utils":1,"debug":undefined}],3:[function(require,module,exports){
"use strict";
;
var indexed_queue_1 = require("./indexed-queue");
var utils_1 = require("../common/utils");
var Promise = require("bluebird");
var tslib_1 = require("tslib");
var debug = require("debug");
var log = debug('worker-proxy');
var ServiceProxyClass = (function () {
    function ServiceProxyClass(spec) {
        this.worker = spec.worker;
        this.hasObjectUrl = utils_1.isString(getObjectUrl(this.worker));
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
        if (!this.hasObjectUrl) {
            return;
        }
        this.hasObjectUrl = false;
        URL.revokeObjectURL(getObjectUrl(this.worker));
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = newServiceProxy;

},{"../common/utils":1,"./indexed-queue":4,"bluebird":undefined,"debug":undefined,"tslib":undefined,"webworkify":5}],4:[function(require,module,exports){
"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = newIndexedQueue;

},{"../common/utils":1,"./index-generator":2,"debug":undefined}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
"use strict";
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

},{"../../dist/proxy":3,"debug":undefined}]},{},[6]);
