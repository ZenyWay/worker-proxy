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
"use strict";var worker_1=require("../../src/worker"),Promise=require("bluebird"),worker,service,onterminate;beforeEach(function(){worker=jasmine.createSpyObj("worker",["postMessage"]),service=Object.create(jasmine.createSpyObj("service",["asyncwork","syncwork","stop"])),service.syncwork.and.returnValue("foo"),service.asyncwork.and.returnValue(Promise.resolve("foo")),onterminate=service.stop.bind(service)}),beforeEach(function(){worker_1.default({worker:worker,service:service,onterminate:onterminate})}),describe("function hookService <S extends Object>({ worker: WorkerGlobalScope, service: S, onterminate?: () => Promise<void>, methods?: string[] }): void",function(){it('should add an "onmessage" handler to the given worker',function(){expect(worker.onmessage).toEqual(jasmine.any(Function))}),describe("when the supplied argument is not an object",function(){it('should throw an "invalid argument" TypeError',function(){expect(function(){return worker_1.default(42)}).toThrowError(TypeError,"invalid argument")})}),describe('when "worker" is not defined or not a WorkerGlobalScope object',function(){it('should throw an "invalid argument" TypeError',function(){expect(function(){return worker_1.default({service:service,onterminate:onterminate})}).toThrowError(TypeError,"invalid argument"),expect(function(){return worker_1.default({worker:{},service:service,onterminate:onterminate})}).toThrowError(TypeError,"invalid argument")})}),describe('when "service" is not defined or not an object',function(){it('should throw an "invalid argument" TypeError',function(){expect(function(){return worker_1.default({worker:worker,onterminate:onterminate})}).toThrowError(TypeError,"invalid argument"),expect(function(){return worker_1.default({worker:worker,service:42,onterminate:onterminate})}).toThrowError(TypeError,"invalid argument")})}),describe('when "onterminate" is defined but not a method',function(){it('should throw an "invalid argument" TypeError',function(){expect(function(){return worker_1.default({worker:worker,service:service})}).not.toThrow(),expect(function(){return worker_1.default({worker:worker,service:service,onterminate:42})}).toThrowError(TypeError,"invalid argument")})}),describe('when "methods" is defined but not a an array of strings',function(){it('should throw an "invalid argument" TypeError',function(){expect(function(){return worker_1.default({worker:worker,service:service})}).not.toThrow(),expect(function(){return worker_1.default({worker:worker,service:service,methods:["foo",42]})}).toThrowError(TypeError,"invalid argument")})}),describe('when "methods" is an array of strings',function(){beforeEach(function(){var e=[{uuid:42,target:"service",method:"syncwork",args:["foo","bar"]},{uuid:42,target:"service",method:"asyncwork",args:["foo","bar"]}];worker_1.default({worker:worker,service:service,methods:["syncwork"]}),e.forEach(function(e){return worker.onmessage({data:e})})}),it('should expose only the service methods listed in the "methods" array',function(){expect(service.syncwork).toHaveBeenCalledTimes(1),expect(service.asyncwork).not.toHaveBeenCalled(),expect(service.stop).not.toHaveBeenCalled()})}),describe("handler onmessage (event: WorkerServiceEvent): void",function(){var e,r;beforeEach(function(){e={uuid:42,target:"service",method:"syncwork",args:["foo","bar"]},r=function(e,r){r&&worker.postMessage.and.callFake(function(){return setTimeout(r)}),worker.onmessage({data:e})}}),it('should call the target method as specified in "event.data"',function(){r(e);var t=expect(service.syncwork);t.toHaveBeenCalledWith.apply(t,e.args),expect(service.syncwork).toHaveBeenCalledTimes(1),expect(service.asyncwork).not.toHaveBeenCalled(),expect(service.stop).not.toHaveBeenCalled()}),describe('when "event.data.args" is falsy',function(){beforeEach(function(t){delete e.args,r(e,t)}),it('should call the target method as specified in "event.data" with no arguments',function(){expect(service.syncwork).toHaveBeenCalledTimes(1),expect(service.syncwork).toHaveBeenCalledWith()})}),describe('when "event.data.args" is truthy but not Array-like',function(){beforeEach(function(t){e.args={foo:42},r(e,t)}),it('should post a request back to reject with an "invalid argument" TypeError',function(){expect(worker.postMessage).toHaveBeenCalledTimes(1),expect(worker.postMessage).toHaveBeenCalledWith({uuid:42,method:"reject",args:[{name:"TypeError",message:"invalid argument",stack:jasmine.anything()}]})})}),describe('when "event.data.uuid" is not a safe integer',function(){beforeEach(function(t){e.uuid=Number.MAX_VALUE,r(e,t)}),it('should post a request back to reject with an "invalid argument" TypeError',function(){expect(worker.postMessage).toHaveBeenCalledTimes(1),expect(worker.postMessage).toHaveBeenCalledWith({uuid:Number.MAX_VALUE,method:"reject",args:[{name:"TypeError",message:"invalid argument",stack:jasmine.anything()}]})})}),describe('when "event.data.target" is not a string',function(){beforeEach(function(t){e.target=64,r(e,t)}),it('should post a request back to reject with an "invalid argument" TypeError',function(){expect(worker.postMessage).toHaveBeenCalledTimes(1),expect(worker.postMessage).toHaveBeenCalledWith({uuid:42,method:"reject",args:[{name:"TypeError",message:"invalid argument",stack:jasmine.anything()}]})})}),describe('when "event.data.method" is not a string',function(){beforeEach(function(t){e.method=64,r(e,t)}),it('should post a request back to reject with an "invalid argument" TypeError',function(){expect(worker.postMessage).toHaveBeenCalledTimes(1),expect(worker.postMessage).toHaveBeenCalledWith({uuid:42,method:"reject",args:[{name:"TypeError",message:"invalid argument",stack:jasmine.anything()}]})})}),describe('when "event.data.target" is unknown',function(){beforeEach(function(t){e.target="shazam",r(e,t)}),it('should post a request back to reject with an "unknown method" Error',function(){expect(worker.postMessage).toHaveBeenCalledTimes(1),expect(worker.postMessage).toHaveBeenCalledWith({uuid:42,method:"reject",args:[{name:"Error",message:"unknown method",stack:jasmine.anything()}]})})}),describe("when the specified target method is unknown",function(){beforeEach(function(t){e.method="shazam",r(e,t)}),it('should post a request back to reject with an "unknown method" Error',function(){expect(worker.postMessage).toHaveBeenCalledTimes(1),expect(worker.postMessage).toHaveBeenCalledWith({uuid:42,method:"reject",args:[{name:"Error",message:"unknown method",stack:jasmine.anything()}]})})}),describe("when the target method successfully returns",function(){beforeEach(function(t){r(e,t)}),it("should post a request back to resolve to the returned value",function(){expect(worker.postMessage).toHaveBeenCalledTimes(1),expect(worker.postMessage).toHaveBeenCalledWith({uuid:42,method:"resolve",args:["foo"]})})}),describe("when the target method successfully resolves",function(){beforeEach(function(t){e.method="asyncwork",r(e,t)}),it("should post a request back to resolve to the resolved value",function(){expect(worker.postMessage).toHaveBeenCalledTimes(1),expect(worker.postMessage).toHaveBeenCalledWith({uuid:42,method:"resolve",args:["foo"]})})}),describe("when the target method throws",function(){beforeEach(function(t){e.method="syncwork",service.syncwork.and.callFake(function(){throw new Error("boom")}),r(e,t)}),it("should post a request back to reject with the corresponding error",function(){expect(worker.postMessage).toHaveBeenCalledTimes(1),expect(worker.postMessage).toHaveBeenCalledWith({uuid:42,method:"reject",args:[{name:"Error",message:"boom",stack:jasmine.anything()}]})})}),describe("when the target method rejects",function(){beforeEach(function(t){e.method="asyncwork",service.asyncwork.and.returnValue(Promise.reject(new Error("boom"))),r(e,t)}),it("should post a request back to reject with the corresponding error",function(){expect(worker.postMessage).toHaveBeenCalledTimes(1),expect(worker.postMessage).toHaveBeenCalledWith({uuid:42,method:"reject",args:[{name:"Error",message:"boom",stack:jasmine.anything()}]})})}),describe('when the target method specification is { method: "getServiceMethods" }',function(){beforeEach(function(t){delete e.target,e.method="getServiceMethods",r(e,t)}),it("should post a request back to resolve to the list of service methods",function(){expect(worker.postMessage).toHaveBeenCalledTimes(1),expect(worker.postMessage).toHaveBeenCalledWith({uuid:42,method:"resolve",args:[["asyncwork","syncwork","stop"]]})})})})});
},{"../../src/worker":4,"bluebird":undefined}],3:[function(require,module,exports){
"use strict";function isObject(t){return!!t&&"object"==typeof t}function isArrayLike(t){return isObject(t)&&isNumber(t.length)}function isFunction(t){return"function"==typeof t}function isString(t){return"string"==typeof t}function isNumber(t){return"number"==typeof t}function assert(t,i,r){if(!t)throw new i(r)}exports.isObject=isObject,exports.isArrayLike=isArrayLike,exports.isFunction=isFunction,exports.isString=isString,exports.isNumber=isNumber,exports.assert=assert;
},{}],4:[function(require,module,exports){
"use strict";function getPropertyNames(e){var t=Object.getOwnPropertyNames(e).filter(function(e){return"constructor"!==e}).reduce(function(e,t){return(e[t]=!0)&&e},this||{}),r=Object.getPrototypeOf(e);return isObjectPrototype(r)?Object.getOwnPropertyNames(t):getPropertyNames.call(t,r)}function isValidServiceBinderSpec(e){return utils_1.isObject(e)&&isWorkerGlobalScope(e.worker)&&utils_1.isObject(e.service)&&(!e.onterminate||utils_1.isFunction(e.onterminate))&&isValidMethodsOption(e.methods)}function isValidMethodsOption(e){return!e||Array.isArray(e)&&e.every(function(e){return utils_1.isString(e)})}function isWorkerGlobalScope(e){return utils_1.isObject(e)&&utils_1.isFunction(e.postMessage)}function isValidWorkerServiceMethodCall(e){return utils_1.isObject(e)&&(!e.target||utils_1.isString(e.target))&&utils_1.isString(e.method)&&(!e.args||utils_1.isArrayLike(e.args))}function isObjectPrototype(e){return utils_1.isObject(e)&&!utils_1.isObject(Object.getPrototypeOf(e))}var utils_1=require("../common/utils"),Promise=require("bluebird"),tslib_1=require("tslib"),debug=require("debug"),log=debug("worker-proxy"),WorkerServiceClass=function(){function e(e){var t=e.worker,r=e.service,i=e.onterminate,s=e.methods;this.worker=t,t.onmessage=this.onmessage.bind(this),log("worker.onmessage","hooked"),this.onterminate=i,this.service=r,this.methods=s,log("WorkerService.methods",this.methods)}return e.prototype.onmessage=function(e){var t=this;Promise.try(function(){return t.callTargetMethod(e.data)}).then(this.resolve.bind(this,e.data.uuid)).catch(this.reject.bind(this,e.data.uuid))},e.prototype.callTargetMethod=function(e){utils_1.assert(Number.isSafeInteger(e.uuid),TypeError,"invalid argument"),utils_1.assert(isValidWorkerServiceMethodCall(e),TypeError,"invalid argument");var t=utils_1.isObject(this[e.target])?this[e.target]:this,r=t!==this.service?utils_1.isFunction(t[e.method]):this.methods.indexOf(e.method)>=0,i=r?t[e.method]:this.unknown;return i.apply(t,e.args||[])},e.prototype.getServiceMethods=function(){return log("WorkerService.getServiceProxy",this.methods),this.methods},e.prototype.resolve=function(e,t){log("WorkerService.resolve",t),this.worker.postMessage({uuid:e,method:"resolve",args:[t]})},e.prototype.reject=function(e,t){log("WorkerService.reject",t),this.worker.postMessage({uuid:e,method:"reject",args:[{name:t.name,message:t.message,stack:t.stack}]})},e.prototype.unknown=function(){return Promise.reject(new Error("unknown method"))},e}();WorkerServiceClass.hookService=function(e){utils_1.assert(isValidServiceBinderSpec(e),TypeError,"invalid argument");var t=tslib_1.__assign({},e);t.methods=getPropertyNames(e.service).filter(function(t){return utils_1.isFunction(e.service[t])}).filter(function(t){return!e.methods||e.methods.indexOf(t)>=0});new WorkerServiceClass(t)};var hookService=WorkerServiceClass.hookService;Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=hookService;
},{"../common/utils":3,"bluebird":undefined,"debug":undefined,"tslib":1}]},{},[2]);
