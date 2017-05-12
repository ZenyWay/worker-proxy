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
import newIndexedQueue, { IndexedQueue, isIndexedQueue } from './indexed-queue'

import { isObject, isArrayLike, isFunction, isString, isNumber }
from '../common/utils'

import Promise = require('bluebird')

import debug = require('debug')
const log = debug('worker-proxy')

/**
 * @public
 * @factory ServiceProxyFactory
 * @param {string|Worker} worker path of {Worker} script, or {Worker} instance
 * @param {ServiceProxyOpts} opts? {ServiceProxy} configuration options
 * @generic {S extends Object} service interface
 * @return {Promise<ServiceProxy<S>>}
 */
export interface ServiceProxyFactory {
  <S extends Object>(worker: string|Function|Worker, opts?: ServiceProxyOpts): ServiceProxy<S>
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
  /**
   * @public
   * @prop {IndexedQueue} queue
   */
  queue?: IndexedQueue
  /**
   *
   * @public
   * @prop {Function} workify?
   */
  workify?: Function
  /**
   * @public
   * @prop {Function} revokeObjectURL?
   * override URL#revokeObjectURL in unit tests
   */
  revokeObjectURL?: Function
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
  data: IndexedMethodCallSpec
}

/**
 * @public
 * @interface
 * data content of {WorkerServiceEvent}
 */
export interface ProxyCallSpec extends MethodCallSpec {
  timeout?: number
}

export interface IndexedMethodCallSpec extends MethodCallSpec {
  uuid: number
}

export interface MethodCallSpec {
  target?: 'service'
  method: string
  args?: any[]
}

interface ServiceProxySpecs {
  /**
   * @public
   * @prop {number} timeout for calls to `Worker`
   */
  timeout: number
  /**
   * @public
   * @prop {Worker} worker
   */
  worker: Worker
  /**
   * @public
   * @prop {IndexedQueue} queue
   */
  queue: IndexedQueue
  /**
   *
   * @public
   * @prop {Function} revokeObjectURL?
   */
  revokeObjectURL?: Function
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
	static newInstance <S extends Object>(worker: string|Function|Worker,
  opts?: ServiceProxyOpts): ServiceProxy<S> {
    const specs = <ServiceProxySpecs>{}
    specs.timeout =
    opts && isNumber(opts.timeout) ? opts.timeout : ServiceProxyClass.timeout
    specs.worker = toWorker(worker, opts && opts.workify)
    specs.queue =
    opts && isIndexedQueue(opts.queue) ? opts.queue : newIndexedQueue()
    specs.revokeObjectURL =
    opts && opts.revokeObjectURL || URL.revokeObjectURL.bind(URL)

  	const proxy = new ServiceProxyClass(specs)
    log('ServiceProxyClass.newInstance', proxy)

  	return <ServiceProxy<S>>({ // revealing module
      service: proxy.service,
      kill: proxy.kill.bind(proxy),
    	terminate: proxy.terminate.bind(proxy)
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
   * @constructor {ServiceProxyClass}
	 * @param {Worker} instance
   * @param {ServiceProxyOpts}
	 */
	constructor (spec: ServiceProxySpecs) {
  	this.worker = spec.worker
    this.hasObjectUrl = isString(getObjectUrl(this.worker))
    this.revokeObjectURL = spec.revokeObjectURL
    this.worker.onmessage = this.onmessage.bind(this)
    // TODO setup this.worker.onerror ?
    this.calls = spec.queue
    this.timeout = spec.timeout
    this.service = this.call({  method: 'getServiceMethods' })
    .call('reduce', this.proxyServiceMethod.bind(this), <S>{})
  }
  /**
   * @private
   * @method onmessage `message` event handler.
   * call method as specified in `event.data` {WorkerServiceMethodCall}
   * ignoring `event.data.target`,
   * or do nothing if `event.data.uuid` is not queued,
   * or if `event.data.method` is neither one of `resolve` or `reject`.
   * @param  {WorkerServiceEvent} event
   */
  onmessage (event: WorkerServiceEvent) {
    if (this.hasObjectUrl) { this.revokeObjectUrl() }
    if (!this.calls.has(event.data.uuid)) { return } // ignore invalid uuid
    const call = this.calls.pop(event.data.uuid)
    // ignore unknown method (Promise may timeout)
    if (!isObject(call) || !isFunction(call[event.data.method])) { return }
    log('WorkerService.onmessage target method', event.data.method)
    // Function#apply needs array like object
    const args = isArrayLike(event.data.args) ? event.data.args : []
    call[event.data.method].apply(undefined, args) // resolve or reject Promise
  }
  /**
   * @private
   * @method call place async method call to `Worker`.
   * the call will timeout as defined by `spec.timeout` or
   * by the value specified at instantiation.
   * @param  {ProxyCallSpec} spec of method call
   * @return {Promise<any>} result from call
   */
  call (spec: ProxyCallSpec): Promise<any> {
    log('ServiceProxy.call', spec)
    const data = <IndexedMethodCallSpec>{ ...spec }
    const result = new Promise((resolve, reject) => {
      data.uuid = this.calls.push({
        resolve: resolve,
        reject: reject
      })
    })
    .timeout(this.timeout)
    .catch(Promise.TimeoutError, err => {
    	log('ServiceProxy.call uuid =', data.uuid, err)
      this.calls.has(data.uuid) && this.calls.pop(data.uuid)
      return Promise.reject(err)
    })
    setTimeout(this.worker.postMessage.bind(this.worker, data)) // delay for Safari
    return result
  }
  /**
   * @private
   * @method proxy
   * proxy the named method on the given service proxy object
   * @param {S} service
   * @param {string} method
   * @returns {S} service proxy object with added proxied method
   */
  proxyServiceMethod (service: S, method: string) {
    service[method] = (function (/* arguments */) {
      return this.call({
        target: 'service',
        method: method,
        // postMessage can't handle arguments type (note: slice known to be slow)
        args: Array.prototype.slice.call(arguments)
      })
    }).bind(this)
    return service
  }
  /**
   * @private
   * @method revokeObjectUrl
   *
   * @description
   * if the given {Worker} has a `objectURL` {string} property,
   * revoke the corresponding {Blob} and delete the property.
   * see [webworkify#objectURL](https://github.com/substack/webworkify#workerobjecturl).
   *
   * @param {Worker} worker
   */
  revokeObjectUrl (): void {
    this.hasObjectUrl = false
    this.revokeObjectURL(getObjectUrl(this.worker))
  }
  /**
   * @private
   * @prop {Worker} worker
   */
  worker: Worker
  /**
   * @private
   * @prop {IndexedQueue} calls queue of {Resolver} methods
   * of pending call Promises, indexed by their `uuid`
   */
  calls: IndexedQueue
  /**
   * @private
   * @prop {number} timeout
   */
  timeout: number
  /**
   * @private
   * @prop {boolean} hasObjectUrl
   * @see ServiceProxyClass#revokeObjectUrl
   */
  hasObjectUrl: boolean
  /**
   * @private
   * @prop {Function} revokeObjectURL
   * @see ServiceProxyClass#revokeObjectUrl
   */
  revokeObjectURL: Function
}
/**
 * @private
 * @function toWorker
 *
 * @param {any} val?
 *
 * @param {any} workify?
 * only required when `val` is a worker {Function}.
 *
 * @return {Worker} from `val` if a valid {string} path to a worker script
 *
 * @error {TypeError} 'invalid argument'
 * * when `val` is not a valid URL {string},
 * * or, in _some_ user agents, when the URL violates the same-origin policy,
 * * or when `val` is not a valid worker {Function} or {Worker} instance,
 * * or when `val` is a valid worker {Function} and `workify` is not a {Function}.
 */
function toWorker (val?: any, workify?: any): Worker {
  if (isWorker(val)) { return val }
  try {
    if (isFunction(val)) {
      return (isFunction(workify) ? workify : require('webworkify'))(val)
    }
    if (isString(val)) { return new Worker(val) }
  } catch (err) { /* DOMException in some user agents */ }
  throw new TypeError('invalid argument')
}

/**
 * @private
 * @function getObjectUrl
 *
 * @param {Worker} worker
 *
 * @returns {string} [worker#objectURL](https://github.com/substack/webworkify#workerobjecturl)
 */
function getObjectUrl (worker: Worker): string {
  return (<any>worker).objectURL
}
/**
 * @private
 * @function isWorker
 * @param {any} val?
 * @return {val is Worker} true if `val` is an {Object}
 * with `postMessage` and `terminate` methods
 */
function isWorker (val?: any): val is Worker {
  return isObject(val) && isFunction(val.postMessage)
  && isFunction(val.terminate)
}

const newServiceProxy: ServiceProxyFactory = ServiceProxyClass.newInstance
export default newServiceProxy