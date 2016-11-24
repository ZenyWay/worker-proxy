(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
(function (factory) {
    var root = typeof global === "object" ? global : typeof self === "object" ? self : typeof this === "object" ? this : {};
    if (typeof System === "object" && typeof System.register === "function") {
        System.register("tslib", [], function (exporter) {
            factory(createExporter(root, exporter));
            return { setters: [], execute: function() { } };
        });
    }
    else if (typeof define === "function" && define.amd) {
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
    __extends = function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
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
        if (typeof Object.getOwnPropertySymbols === "function")
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
            step((generator = generator.apply(thisArg, _arguments)).next());
        });
    };

    __generator = function (thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
        return { next: verb(0), "throw": verb(1), "return": verb(2) };
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

    exporter("__extends", __extends);
    exporter("__assign", __assign);
    exporter("__rest", __rest);
    exporter("__decorate", __decorate);
    exporter("__param", __param);
    exporter("__metadata", __metadata);
    exporter("__awaiter", __awaiter);
    exporter("__generator", __generator);
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
"use strict";var index_generator_1=require("../../src/proxy/index-generator"),index;beforeEach(function(){index=index_generator_1.default()}),describe("factory newIndexGenerator(start?: number): IndexGenerator",function(){it("should return a new instance of IndexGenerator",function(){expect(index_generator_1.isIndexGenerator(index)).toBe(!0)}),it("should initialize the index to the given start value when defined",function(){index=index_generator_1.default(42),expect(index.value()).toBe(42)}),it("should initialize the index to zero when not given a start value",function(){expect(index.value()).toBe(0)})}),describe("interface IndexGenerator",function(){describe("next (): number",function(){it("should return a safe integer",function(){index=index_generator_1.default(Number.MAX_VALUE),expect(Number.isSafeInteger(index.next())).toBe(!0),index=index_generator_1.default(-Number.MAX_VALUE),expect(Number.isSafeInteger(index.next())).toBe(!0)}),it("should return a new index value",function(){expect(index.next()).not.toBe(0)})}),describe("value (): number",function(){it("should return a safe integer",function(){index=index_generator_1.default(Number.MAX_VALUE),expect(Number.isSafeInteger(index.value())).toBe(!0),index=index_generator_1.default(-Number.MAX_VALUE),expect(Number.isSafeInteger(index.value())).toBe(!0)}),it("should not affect the index value",function(){expect(index.value()).toBe(index.value()),expect(index.next()).toBe(index_generator_1.default().next())})})}),describe("isIndexGenerator (val: any): val is IndexGenerator",function(){it("should return true when given a duck-type instance of {IndexGenerator}",function(){expect(index_generator_1.isIndexGenerator(index_generator_1.default())).toBe(!0),expect(index_generator_1.isIndexGenerator({next:function(){return 0}})).toBe(!0)}),it("should return false when not given an instance of {IndexGenerator}",function(){expect(index_generator_1.isIndexGenerator()).toBe(!1),expect(index_generator_1.isIndexGenerator("foo")).toBe(!1),expect(index_generator_1.isIndexGenerator({next:"foo"})).toBe(!1),expect(index_generator_1.isIndexGenerator([function(){return 0}])).toBe(!1),expect(index_generator_1.isIndexGenerator({next:function(){return"foo"}})).toBe(!1)})});
},{"../../src/proxy/index-generator":8}],4:[function(require,module,exports){
"use strict";var proxy_1=require("../../src/proxy"),Promise=require("bluebird"),jasmine_bluebird_1=require("../support/jasmine-bluebird"),tslib_1=require("tslib"),workify,queue,workerFn,url,newMockWorker,expected;beforeEach(function(){expected={proxy:{service:jasmine.any(Promise),terminate:jasmine.any(Function),kill:jasmine.any(Function)},service:{foo:jasmine.any(Function),err:jasmine.any(Function),misbehaved:jasmine.any(Function)}}}),beforeEach(function(){var e=[];queue=jasmine.createSpyObj("queue",["pop","push","has","length"]),queue.push.and.callFake(e.push.bind(e)),queue.pop.and.callFake(e.pop.bind(e)),queue.has.and.callFake(function(t){return t<=e.length}),queue.length.and.callFake(function(){return e.length})}),beforeEach(function(){workerFn=function(e,t){var n={getServiceMethods:{method:"resolve",args:[["foo","err","misbehaved"]]},foo:{method:"resolve",args:["foo"]},err:{method:"reject",args:[new Error("boom")]},misbehaved:{method:"unknown"},onterminate:{method:t&&t.method||"resolve",args:t&&t.args}};e.onmessage=function(t){var r=n[t.data.method];r.uuid=t.data.uuid,e.postMessage(r)}};var e=new Blob(["("+workerFn+"(self))"],{type:"text/javascript"});url=URL.createObjectURL(e)}),beforeEach(function(){var e=0;newMockWorker=function(t,n){var r=jasmine.createSpyObj("worker_"+ ++e,["postMessage","terminate"]),o={postMessage:function(e){setTimeout(r.onmessage.bind(r,{data:e}))}};return t.call(o,o,n),r.postMessage.and.callFake(function(e){return setTimeout(o.onmessage.bind(o,{data:e}))}),r},workify=jasmine.createSpy("workify").and.returnValue(newMockWorker(workerFn))}),describe("factory newServiceProxy<S extends Object>(worker: string|Worker, opts?: ServiceProxyOpts): ServiceProxy<S>",function(){describe("when given a {string} path to a worker script",function(){var e,t;beforeEach(function(n){e=proxy_1.default(url),t=jasmine_bluebird_1.unwrap(e.service,n)}),afterEach(function(){e.kill()}),it("should return an instance of ServiceProxy",function(){expect(e).toEqual(expected.proxy)}),it("should instantiate and proxy the corresponding worker",function(){expect(t.err).not.toBeDefined(),expect(t.val).toEqual(expected.service)})}),describe("when given a worker {Function}",function(){var e,t;beforeEach(function(n){e=proxy_1.default(workerFn,{workify:workify}),t=jasmine_bluebird_1.unwrap(e.service,n)}),it("should return an instance of ServiceProxy",function(){expect(e).toEqual(expected.proxy)}),it("should instantiate a corresponding {Worker} instance with `webworkify`",function(){expect(workify).toHaveBeenCalledWith(workerFn)}),it("should proxy the resulting worker",function(){expect(t.err).not.toBeDefined(),expect(t.val).toEqual(expected.service)})}),describe("when given a {Worker} instance",function(){var e,t;beforeEach(function(n){e=proxy_1.default(newMockWorker(workerFn)),t=jasmine_bluebird_1.unwrap(e.service,n)}),it("should return an instance of ServiceProxy",function(){expect(e).toEqual(expected.proxy)}),it("should instantiate and proxy the corresponding worker",function(){expect(t.err).not.toBeDefined(),expect(t.val).toEqual(expected.service)})}),describe("when given anything else then a {string} path, a worker {Function}, or {Worker} instance",function(){var e;beforeEach(function(){var t=newMockWorker(workerFn);t.terminate="foo",e=[void 0,!0,42,t]}),it("should throw a TypeError",function(){e.forEach(function(e){return expect(proxy_1.default.bind(void 0,e)).toThrowError(TypeError)})})}),describe('when given an {IndexedQueue} instance in "opts.queue"',function(){var e,t;beforeEach(function(n){e=proxy_1.default(newMockWorker(workerFn),{queue:queue}),t=jasmine_bluebird_1.unwrap(e.service,n)}),it("should return an instance of ServiceProxy",function(){expect(e).toEqual(expected.proxy)}),it("should use that queue instead of the internal queue",function(){expect(t.err).not.toBeDefined(),expect(t.val).toEqual(expected.service),expect(queue.push).toHaveBeenCalled()})}),describe('when given anything else then an {IndexedQueue} instance in "opts.queue"',function(){var e,t;beforeEach(function(n){var r=tslib_1.__assign({},queue,{length:42}),o=[void 0,42,function(){return"foo"},r];e=o.map(function(e){return proxy_1.default(newMockWorker(workerFn),{queue:e})}),t=jasmine_bluebird_1.unwrap(Promise.all(e.map(function(e){return e.service})),n)}),it("should return an instance of ServiceProxy",function(){e.forEach(function(e){return expect(e).toEqual(expected.proxy)})}),it("should default to the internal queue",function(){expect(t.err).not.toBeDefined(),t.val.forEach(function(e){expect(e).toEqual(expected.service)})})}),describe('when given a timeout value in "opts.timeout"',function(){var e;beforeEach(function(t){var n=proxy_1.default(newMockWorker(workerFn),{timeout:0});e=jasmine_bluebird_1.unwrap(n.service,t)}),it("should timeout as specified",function(){expect(e.err.name).toBe("TimeoutError")})}),describe('when given anything else then a {number} "opts.timeout"',function(){var e,t;beforeEach(function(n){var r=[void 0,"42",function(){return 42},[42],{42:42}];e=r.map(function(e){return proxy_1.default(newMockWorker(workerFn),{timeout:e})}),t=jasmine_bluebird_1.unwrap(Promise.all(e.map(function(e){return e.service})),n)}),it("should return an instance of ServiceProxy",function(){e.forEach(function(e){return expect(e).toEqual(expected.proxy)})}),it("should maintain the default timeout",function(){expect(t.err).not.toBeDefined(),t.val.forEach(function(e){expect(e).toEqual(expected.service)})})}),it("should request the list of service method names from the worker",function(e){var t=newMockWorker(workerFn);proxy_1.default(t).service.then(function(){return expect(t.postMessage).toHaveBeenCalledWith({uuid:jasmine.any(Number),method:"getServiceMethods"})}).catch(function(e){return expect('unexpected "'+e+'"').not.toBeDefined()}).finally(jasmine_bluebird_1.schedule(e))})}),describe("ServiceProxy<S extends Object>",function(){var e,t,n;beforeEach(function(r){e=newMockWorker(workerFn),t=proxy_1.default(e),n=jasmine_bluebird_1.unwrap(t.service,r)}),describe("property service: Promise<S>",function(){it("should resolve to a proxied service object",function(){expect(n.val).toEqual(expected.service)}),it('should proxy the methods from the list of service method names queried during instantiation by the "newServiceProxy" factory',function(e){var t=[];t.push(n.val.foo().then(function(e){return expect(e).toBe("foo")}).catch(function(e){return expect('unexpected "'+e+'"').not.toBeDefined()})),t.push(n.val.err().then(function(e){return expect('unexpected value "'+e+'"').not.toBeDefined()}).catch(function(e){expect(e).toEqual(jasmine.any(Error)),expect(e.message).toBe("boom")})),Promise.all(t).finally(jasmine_bluebird_1.schedule(e))}),it("should silently ignore incorrect messages from the worker",function(t){proxy_1.default(e,{timeout:100}).service.then(function(e){return e.misbehaved()}).then(function(e){return expect('unexpected value "'+e+'"').not.toBeDefined()}).catch(function(e){expect(e).toEqual(jasmine.any(Error)),expect(e.name).toBe("TimeoutError")}).finally(jasmine_bluebird_1.schedule(t))})}),describe("method terminate (): Promise<void>",function(){it('should call the "onterminate" handler registered with the worker',function(n){e.postMessage.calls.reset(),t.terminate().then(function(){return expect(e.postMessage).toHaveBeenCalledWith({uuid:jasmine.any(Number),method:"onterminate"})}).catch(function(e){return expect('unexpected "'+e+'"').not.toBeDefined()}).finally(jasmine_bluebird_1.schedule(n))}),it('should resolve when the "onterminate" handler resolves',function(e){t.terminate().then(function(e){return expect(e).not.toBeDefined()}).catch(function(e){return expect('unexpected "'+e+'"').not.toBeDefined()}).finally(jasmine_bluebird_1.schedule(e))}),it('should reject with the error from the "onterminate" handler',function(e){var t=newMockWorker(workerFn,{method:"reject",args:[new Error("fail")]});proxy_1.default(t).terminate().then(function(e){return expect('unexpected value "'+e+'"').not.toBeDefined()}).catch(function(e){expect(e).toEqual(jasmine.any(Error)),expect(e.message).toBe("fail")}).finally(jasmine_bluebird_1.schedule(e))}),it('should terminate the worker when the "onterminate" handler resolves',function(n){e.terminate.calls.reset(),t.terminate().then(function(t){return expect(e.terminate).toHaveBeenCalled()}).catch(function(e){return expect('unexpected "'+e+'"').not.toBeDefined()}).finally(jasmine_bluebird_1.schedule(n))}),it('should not terminate the worker when the "onterminate" handler rejects',function(e){var t=newMockWorker(workerFn,{method:"reject",args:[new Error("fail")]});t.terminate.calls.reset(),proxy_1.default(t).terminate().then(function(e){return expect('unexpected value "'+e+'"').not.toBeDefined()}).catch(function(e){return expect(t.terminate).not.toHaveBeenCalled()}).finally(jasmine_bluebird_1.schedule(e))})}),describe("method kill (): void",function(){it("should force the worker to terminate",function(){e.terminate.calls.reset(),t.kill(),expect(e.terminate).toHaveBeenCalled()}),it('should not call the "onterminate" handler registered with the worker',function(){e.postMessage.calls.reset(),e.terminate.calls.reset(),t.kill(),expect(e.postMessage).not.toHaveBeenCalled(),expect(e.terminate).toHaveBeenCalled()})})});

},{"../../src/proxy":9,"../support/jasmine-bluebird":6,"bluebird":undefined,"tslib":1}],5:[function(require,module,exports){
"use strict";var indexed_queue_1=require("../../src/proxy/indexed-queue"),mockIndex,queue;beforeEach(function(){var e=0;mockIndex=jasmine.createSpyObj("mockIndex",["next","value"]),mockIndex.next.and.callFake(function(){return++e}),mockIndex.value.and.callFake(function(){return e})}),beforeEach(function(){queue=indexed_queue_1.default({index:mockIndex}),mockIndex.next.calls.reset(),mockIndex.value.calls.reset()}),describe("factory newIndexedQueue (opts?: { index?: IndexGenerator }): IndexedQueue",function(){it("should return an instance of IndexedQueue",function(){expect(indexed_queue_1.isIndexedQueue(queue)).toBe(!0)}),it("should override the internal IndexGenerator with opts.index when specified",function(){queue.push(42),expect(mockIndex.next).toHaveBeenCalled()}),it("should default to the internal IndexGenerator when opts.index is not specified",function(){var e=indexed_queue_1.default();expect(e.pop(e.push(42))).toBe(42)})}),describe("IndexedQueue",function(){describe("method has (index: number): boolean",function(){var e;beforeEach(function(){e=queue.push(42),mockIndex.next.calls.reset(),mockIndex.value.calls.reset()}),it("should return true when given an index that is queued",function(){expect(queue.has(e)).toBe(!0)}),it("should return false when given a number index not in the queue",function(){expect(queue.has(42)).toBe(!1)}),it("should return false when given an index that is not a number",function(){expect(queue.has("foo")).toBe(!1)}),it("should return false when not given an index",function(){expect(queue.has()).toBe(!1)}),it("should not affect the value of the next index",function(){queue.has(42),expect(mockIndex.next).not.toHaveBeenCalled(),queue.has(0),expect(mockIndex.next).not.toHaveBeenCalled()})}),describe("method push (val: T): number",function(){it("should return the number index of the pushed value",function(){expect(queue.has(queue.push(42))).toBe(!0)}),it("should add the given value to the queue",function(){expect(queue.pop(queue.push("foo"))).toBe("foo")}),it("should accept to add undefined to the queue",function(){expect(queue.pop(queue.push(void 0))).toBe(void 0)}),it("should throw a ReferenceError when given no argument",function(){expect(queue.push.bind(queue)).toThrowError(ReferenceError)}),it('should throw a "internal resource conflict for index ${index}" Error when an entry is already queued at the generated index',function(){mockIndex.next.and.returnValue(1),queue.push(42),expect(queue.has(1)).toBe(!0),expect(queue.push.bind(queue,"foo")).toThrowError(Error,"internal resource conflict for index 1")})}),describe("method pop (index: number): T",function(){var e;beforeEach(function(){e=queue.push(42),mockIndex.next.calls.reset(),mockIndex.value.calls.reset()}),it("should return the value from the queue at the given index",function(){expect(queue.pop(e)).toEqual(42)}),it("should throw a ReferenceError when given a number index not in the queue",function(){expect(queue.has(42)).toBe(!1),expect(queue.pop.bind(queue,42)).toThrowError(ReferenceError)}),it("should throw a ReferenceError when given an index that is not a number",function(){expect(queue.pop.bind(queue,"foo")).toThrowError(ReferenceError)}),it("should throw a ReferenceError when not given an index",function(){expect(queue.pop.bind(queue)).toThrowError(ReferenceError)}),it("should not affect the value of the next index",function(){expect(queue.has(e)).toBe(!0),queue.pop(e),expect(mockIndex.next).not.toHaveBeenCalled(),expect(queue.has(42)).toBe(!1);try{queue.pop(42)}catch(e){}expect(mockIndex.next).not.toHaveBeenCalled()})}),describe("method length (): number",function(){it("should start from zero for a new queue instance",function(){expect(queue.length()).toBe(0)}),it("should increase by one when a new entry is added (push)",function(){queue.push(""),expect(queue.length()).toBe(1),queue.push(""),expect(queue.length()).toBe(2)}),it("should decrease by one when an entry is removed (pop)",function(){var e=["a","b","c"].map(function(e){return queue.push(e)});queue.pop(e.pop()),expect(queue.length()).toBe(2),queue.pop(e.pop()),expect(queue.length()).toBe(1)})})}),describe("isIndexedQueue (val: any): val is isIndexedQueue",function(){var e;beforeEach(function(){e={pop:function(e){return"foo"},push:function(e){return 42},has:function(e){return!1},length:function(e){return 0}}}),it("should return true when given a duck-type instance of {IndexedQueue}",function(){expect(indexed_queue_1.isIndexedQueue(indexed_queue_1.default())).toBe(!0),expect(indexed_queue_1.isIndexedQueue(e)).toBe(!0)}),it("should return false when not given an instance of {IndexedQueue}",function(){expect(indexed_queue_1.isIndexedQueue()).toBe(!1),expect(indexed_queue_1.isIndexedQueue("foo")).toBe(!1),delete e.length,expect(indexed_queue_1.isIndexedQueue(e)).toBe(!1),e.length=42,expect(indexed_queue_1.isIndexedQueue(e)).toBe(!1)})});

},{"../../src/proxy/indexed-queue":10}],6:[function(require,module,exports){
"use strict";function schedule(n,e){return function(r){return setTimeout(n.bind(void 0,e||r))}}function unwrap(n,e){var r={};return n.then(function(n){return r.val=n}).catch(function(n){return r.err=n}).finally(schedule(e)),r}exports.schedule=schedule,exports.unwrap=unwrap;

},{}],7:[function(require,module,exports){
"use strict";function isObject(t){return!!t&&"object"==typeof t}function isArrayLike(t){return isObject(t)&&isNumber(t.length)}function isFunction(t){return"function"==typeof t}function isString(t){return"string"==typeof t}function isNumber(t){return"number"==typeof t}function assert(t,i,r){if(!t)throw new i(r)}exports.isObject=isObject,exports.isArrayLike=isArrayLike,exports.isFunction=isFunction,exports.isString=isString,exports.isNumber=isNumber,exports.assert=assert;
},{}],8:[function(require,module,exports){
"use strict";var utils_1=require("../common/utils"),debug=require("debug"),log=debug("index-generator"),IndexGeneratorClass=function(){function e(e){this.index=e}return e.newInstance=function(n){return new e(Number.isSafeInteger(n)?n:0)},e.isIndexGenerator=function(e){return utils_1.isObject(e)&&utils_1.isFunction(e.next)&&utils_1.isNumber(e.next())},e.prototype.next=function(){return Number.isSafeInteger(++this.index)?this.index:this.index=Number.MIN_SAFE_INTEGER},e.prototype.value=function(){return this.index},e}();exports.isIndexGenerator=IndexGeneratorClass.isIndexGenerator;var newIndexGenerator=IndexGeneratorClass.newInstance;Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=newIndexGenerator;

},{"../common/utils":7,"debug":undefined}],9:[function(require,module,exports){
"use strict";function toWorker(e,t){if(isWorker(e))return e;try{if(utils_1.isFunction(e))return(utils_1.isFunction(t)?t:require("webworkify"))(e);if(utils_1.isString(e))return new Worker(e)}catch(e){}throw new TypeError("invalid argument")}function isWorker(e){return utils_1.isObject(e)&&utils_1.isFunction(e.postMessage)&&utils_1.isFunction(e.terminate)}var indexed_queue_1=require("./indexed-queue"),utils_1=require("../common/utils"),Promise=require("bluebird"),tslib_1=require("tslib"),debug=require("debug"),log=debug("worker-proxy"),ServiceProxyClass=function(){function e(e){this.worker=e.worker,this.worker.onmessage=this.onmessage.bind(this),this.calls=e.queue,this.timeout=e.timeout,this.service=this.call({method:"getServiceMethods"}).call("reduce",this.proxyServiceMethod.bind(this),{})}return e.newInstance=function(t,i){var r={};r.timeout=i&&utils_1.isNumber(i.timeout)?i.timeout:e.timeout,r.worker=toWorker(t,i&&i.workify),r.queue=i&&indexed_queue_1.isIndexedQueue(i.queue)?i.queue:indexed_queue_1.default();var o=new e(r);return log("ServiceProxyClass.newInstance",o),{service:o.service,kill:o.kill.bind(o),terminate:o.terminate.bind(o)}},e.prototype.kill=function(){this.worker.terminate()},e.prototype.terminate=function(){var e=this;return this.call({method:"onterminate"}).then(function(){return e.kill()})},e.prototype.onmessage=function(e){if(this.calls.has(e.data.uuid)){var t=this.calls.pop(e.data.uuid);if(utils_1.isObject(t)&&utils_1.isFunction(t[e.data.method])){log("WorkerService.onmessage target method",e.data.method);var i=utils_1.isArrayLike(e.data.args)?e.data.args:[];t[e.data.method].apply(void 0,i)}}},e.prototype.call=function(e){var t=this;log("ServiceProxy.call",e);var i=tslib_1.__assign({},e),r=new Promise(function(e,r){i.uuid=t.calls.push({resolve:e,reject:r})}).timeout(this.timeout).catch(Promise.TimeoutError,function(e){return log("ServiceProxy.call uuid =",i.uuid,e),t.calls.has(i.uuid)&&t.calls.pop(i.uuid),Promise.reject(e)});return setTimeout(this.worker.postMessage.bind(this.worker,i)),r},e.prototype.proxyServiceMethod=function(e,t){return e[t]=function(){return this.call({target:"service",method:t,args:Array.prototype.slice.call(arguments)})}.bind(this),e},e}();ServiceProxyClass.timeout=18e4;var newServiceProxy=ServiceProxyClass.newInstance;Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=newServiceProxy;

},{"../common/utils":7,"./indexed-queue":10,"bluebird":undefined,"debug":undefined,"tslib":1,"webworkify":2}],10:[function(require,module,exports){
"use strict";var index_generator_1=require("./index-generator"),utils_1=require("../common/utils"),debug=require("debug"),log=debug("indexed-queue"),IndexedQueueClass=function(){function e(e){this.index=e,this._length=0,this._queue={}}return e.getInstance=function(t){var n=utils_1.isObject(t)&&index_generator_1.isIndexGenerator(t.index)?t.index:index_generator_1.default();return new e(n)},e.isIndexedQueue=function(e){return utils_1.isObject(e)&&[e.pop,e.push,e.length,e.has].every(utils_1.isFunction)},e.prototype.pop=function(e){utils_1.assert(this.has(e),ReferenceError,"invalid reference");var t=this._queue[e];return delete this._queue[e],this._length--,log("Queue.length",this._length),t},e.prototype.push=function(e){utils_1.assert(!!arguments.length,ReferenceError,"missing argument");var t=this.index.next();return utils_1.assert(!this.has(t),Error,"internal resource conflict for index "+t),this._queue[t]=e,this._length++,log("Queue.length",this._length),t},e.prototype.length=function(){return this._length},e.prototype.has=function(e){return"number"==typeof e&&e in this._queue},e}();exports.isIndexedQueue=IndexedQueueClass.isIndexedQueue;var newIndexedQueue=IndexedQueueClass.getInstance;Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=newIndexedQueue;
},{"../common/utils":7,"./index-generator":8,"debug":undefined}]},{},[3,4,5]);
