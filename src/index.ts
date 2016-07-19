/// <reference path="../typings/index.d.ts" />

/**
 * Copyright 2016 Stephane M. Catala
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *  http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * Limitations under the License.
 */
;
import debug = require('debug')
const log = debug('worker-proxy')
// import assert = require('assert')
import Promise = require('bluebird')
import { newIndexedQueue, IndexedQueue } from './lib/indexed-queue'
import hookService from './worker'

export { hookService }

/**
 * @public
 * @factory ServiceProxyFactory
 * @param {string} path of `Worker` script
 * @param {ServiceProxyOpts} opts? {ServiceProxy} configuration options
 * @generic {S extends Object} service interface
 * @return {Promise<ServiceProxy<S>>}
 */
export interface ServiceProxyFactory {
  <S extends Object>(path: string, opts?: ServiceProxyOpts): ServiceProxy<S>
}
/**
 * @public
 * @interface ServiceProxyOpts {ServiceProxy} configuration options
 */
export interface ServiceProxyOpts {
  /**
   * @public
   * @prop {number} timeout? for calls to `Worker`
   */
  timeout?: number
}
/**
 * @public
 * @interface
 * service proxy interface
 */
export interface ServiceProxy<S extends Object> {
  /**
   * @public
   * @prop {Promise<S>} service resolves to proxied service object
   */
  service: Promise<S>
  /**
   * @public
   * @method terminate call `onterminate` handler in `Worker`
   * and terminate `Worker` on success,
   * or abort on error.
   * @return {Promise<void>} result from `onterminate` handler in `Worker`
   * @error {Error} from `onterminate` handler in `Worker`
   */
  terminate (): Promise<void>
  /**
   * @public
   * @method kill force terminate `Worker`
   */
  kill (): void
}

/**
 * @public
 * @interface
 */
export interface WorkerServiceEvent extends MessageEvent {
  data: WorkerServiceEventData
}

/**
 * @public
 * @interface
 * data content of {WorkerServiceEvent}
 */
export interface WorkerServiceEventData extends WorkerServiceMethodCall {
  uuid: number
  timeout?: number
}

export interface WorkerServiceMethodCall {
  target?: 'service'
  method: string
  args?: any[]
}

/**
 * @private
 * @interface Resolver
 * methods for resolving or rejecting a corresponding {Promise}
 */
interface Resolver {
  resolve: (res?: any|PromiseLike<any>) => void
  reject: (err?: Error) => void
}

/**
 * @private
 * @class
 */
class ServiceProxyClass<S extends Object> implements ServiceProxy<S> {
	/**
   * @public
   * @factory
	 * @param {string} path of `Worker` script
   * @generic {S extends Object} service interface
	 * @return {Promise<ServiceProxy<S>>}
	 */
	static newInstance <S extends Object>(path: string,
  opts?: ServiceProxyOpts): ServiceProxy<S> {
    ServiceProxyClass.timeout = opts && opts.timeout || ServiceProxyClass.timeout

  	const sp = new ServiceProxyClass(path)
    log('ServiceProxyClass.newInstance', sp)

  	return <ServiceProxy<S>>({ // revealing module
      service: sp.service,
      kill: sp.kill.bind(sp),
    	terminate: sp.terminate.bind(sp)
    })
  }
  /**
   * @public
   * @prop {Promise<S>} service resolves to the proxied service object
   */
  service: Promise<S>
  /**
   * @public
   * @method kill force terminate {Worker}
   */
  kill (): void {
    this.worker.terminate()
  }
	/**
   * @public
   * @method terminate attempt to terminate {Worker}.
   * abort on error from `onterminate` handler in `Worker`.
	 * @return {Promise<void>} result from `onterminate` handler in `Worker`
   * @error {Error} from `onterminate` handler in `Worker`
	 */
	terminate (): Promise<void> {
  	return this.call({ method: 'onterminate' })
    .then(() => this.kill())
  }
  /**
   * @private
   * @static
   * @prop {number} timeout default timeout for calls to `Worker`
   */
  static timeout = 3 * 60 * 1000 // ms
	/**
   * @private
   * @constructor
	 * @param {string} path of `Worker` string
	 */
	constructor (path: string) {
  	this.worker = new Worker(path)
    this.worker.onmessage = this.onmessage.bind(this)
    // TODO setup this.worker.onerror ?
    this.calls = newIndexedQueue<Resolver>()
    this.service = this.call({  method: 'getServiceMethods' })
    .then(methods => this.proxy(methods))
  }
  /**
   * @private
   * @method onmessage `message` event handler.
   * call method as specified in received `Event.data` {WorkerServiceMethodCall}
   * @param  {WorkerServiceEvent} event
   */
  onmessage (event: WorkerServiceEvent) {
    const { target, method, args } = event.data
    const targetMethod = (this[target]||this)[method]||this.unknown
    log('ServiceProxy.onmessage targetMethod =', targetMethod)
  	targetMethod.apply(this, args)
  }
  /**
   * @private
   * @method call place async method call to `Worker`
   * @param  {WorkerServiceMethodCall} spec of method call
   * @return {Promise<any>} result from call
   */
  call (spec: WorkerServiceMethodCall): Promise<any> {
    log('ServiceProxy.call spec =', spec)
    const data = <WorkerServiceEventData>spec
    return new Promise((resolve, reject) => {
      data.uuid = this.calls.push({
        resolve: resolve,
        reject: reject
      })
      this.worker.postMessage(spec)
    })
    .timeout(data.timeout || ServiceProxyClass.timeout)
    .catch(Promise.TimeoutError, err => {
    	log('ServiceProxy.call uuid =', data.uuid, err)
      this.calls.pop(data.uuid)
      return Promise.reject(err)
    })
  }
  /**
   * @private
   * @method resolve the {Promise} of a previously placed call,
   * identified by its `uuid`
   * @param {number} uuid
   * @param {any} res
   */
  resolve (uuid: number, res: any): void {
  	log('ServiceProxy.resolve', res)
    const call = this.calls.pop(uuid)
    call && call.resolve(res) // call has not timed out
  }
  /**
   * @private
   * @method reject the {Promise} of a previously placed call,
   * identified by its `uuid`
   * @param {number} uuid
   * @param {Error} err
   */
  reject (uuid: number, err: Error): void {
  	log('ServiceProxy.reject', err)
    const call = this.calls.pop(uuid)
    call && call.reject(err) // call has not timed out
  }
  /**
   * @private
   * @method proxy
   * @param  {string[]} methods
   * @returns {S} proxied service object from list of methods
   */
  proxy (methods: string[]): S {
  	const sp = this
  	return methods.reduce((service, method) => {
      service[method] = function () {
        return sp.call.call(sp, {
          target: 'service',
          method: method,
          args: Array.prototype.slice.call(arguments) // proper format for postMessage
        })
      }
      return service
    }, <S>{})
  }
  /**
   * @private
   * @method unknown
   * @error {Error} `unknown method`
   */
  unknown (): Promise<void> {
    return Promise.reject(new Error('unknown method'))
  }
  /**
   * @private
   * @prop {Worker} worker
   */
  worker: Worker
  /**
   * @private
   * @prop {IndexedQueue<Resolver>} calls queue of {Resolver} methods
   * of pending call Promises, indexed by their `uuid`
   */
  calls: IndexedQueue<Resolver>
}

export const newServiceProxy: ServiceProxyFactory =
ServiceProxyClass.newInstance