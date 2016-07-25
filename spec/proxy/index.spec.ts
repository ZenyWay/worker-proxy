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
import newServiceProxy, { ServiceProxy } from '../../src/proxy'
import Promise = require('bluebird')

interface Service {
  syncwork: (foo: string, bar: string) => number
  asyncwork: (foo: string, bar: string) => Promise<number>
  stop: () => void
}

let queue: any
let workerFn: () => void
let url: string
let newWorker: (workerFn: () => void) => any
let proxy: ServiceProxy<Service>

beforeEach(() => { // mock queue
  const _queue: any[] = []
  queue = jasmine.createSpyObj('queue', [ 'pop', 'push', 'has', 'length'])
  queue.push.and.callFake(_queue.push.bind(_queue))
  queue.pop.and.callFake(_queue.pop.bind(_queue))
  queue.has.and.callFake((index: number) => index <= _queue.length)
  queue.length.and.callFake(() => _queue.length)
})
beforeEach(() => { // mock worker script
  // resolve/reject calls as predefined, ignoring data.target property
  workerFn = function () {
    const returnValues = {
      getServiceMethods: {
        method: 'resolve',
        args: [ [ 'foo' ] ]
      },
      foo: {
        method: 'resolve',
        args: [ 'foo' ]
      }
    }
    this.onmessage = (event: MessageEvent) => {
      const data = returnValues[event.data.method]
      data.uuid = event.data.uuid
      this.postMessage(data)
    }
  }
  const blob = new Blob([ `(${workerFn}())` ], { type: 'text/javascript' })
  url = URL.createObjectURL(blob)
})
beforeEach(() => { // mock worker
  let id = 0
  newWorker = (workerFn: () => void) => {
    const worker =
    jasmine.createSpyObj(`worker_${++id}`, [ 'postMessage', 'terminate' ])
    const loopback: any = {
      postMessage (data: any) {
        setTimeout(worker.onmessage.bind(worker, { data: data }))
      }
    }
    workerFn.call(loopback)
    worker.postMessage
    .and.callFake((data: any) =>
      setTimeout(loopback.onmessage.bind(loopback, { data: data}))
    )
    return worker
  }
})

describe('factory newServiceProxy<S extends Object>(worker: string|Worker, opts?: ' +
'ServiceProxyOpts): ServiceProxy<S>', () => {
  let getService: (proxy: ServiceProxy<any>, done: DoneFn) => void
  let service: any // proxied service object
  let error: Error
  beforeEach(() => {
    getService = (proxy: ServiceProxy<any>, done: DoneFn): void => {
      proxy.service
      .then(_service => (service = _service))
      .then(setTimeout.bind(undefined, done))
      .catch((err: Error) => setTimeout(() => {
        error = err
        done()
      }))
    }
  })
  describe('when given a {string} path to a worker script', () => {
    let proxy: any
    beforeEach((done) => {
      proxy = newServiceProxy(url) // spawn a worker thread
      getService(proxy, done)
    })
    afterEach(() => {
      proxy.kill() // terminate the worker thread
    })
    it('should instantiate and proxy the corresponding worker', () => {
      expect(service).toEqual({ 'foo': jasmine.any(Function) })
    })
  })
  describe('when given a {Worker} instance', () => {
    beforeEach((done) => {
      const proxy = newServiceProxy(newWorker(workerFn))
      getService(proxy, done)
    })
    it('should instantiate and proxy the corresponding worker', () => {
      expect(service).toEqual({ 'foo': jasmine.any(Function) })
    })
  })
  describe('when given anything else then a {string} path ' +
  'or {Worker} instance', () => {
    let args: any[]
    beforeEach(() => {
      const broken = newWorker(workerFn)
      broken.terminate = 'foo'
      args = [ undefined, 42, () => { return 'foo' }, broken ]
    })
    it('should throw a TypeError', () => {
      args.forEach(arg =>
        expect(newServiceProxy.bind(undefined, arg)).toThrowError(TypeError))
    })
  })
  describe('when given an {IndexedQueue} instance in "opts.queue"', () => {
    beforeEach((done) => {
      const proxy = newServiceProxy(newWorker(workerFn), { queue: queue })
      getService(proxy, done)
    })
    it('should use that queue instead of the internal queue', () => {
      expect(queue.push).toHaveBeenCalled()
    })
  })
  describe('when given anything else then an {IndexedQueue} instance ' +
  'in "opts.queue"', () => {
    let services: any[]
    beforeEach((done) => {
      queue.length = 42 // not an IndexedQueue anymore
      const args: any[] = [ undefined, 42, () => { return 'foo' }, queue ]
      const _services = args.map(arg =>
        ((<Function>newServiceProxy)(newWorker(workerFn), { queue: arg }))
        .service)
      Promise.all(_services)
      .then(_services =>
        services = _services)
      .then(() => setTimeout(done))
    })
    it('should default to the internal queue', () => {
      services.forEach(service =>
        expect(service).toEqual({ 'foo': jasmine.any(Function) }))
    })
  })
  describe('when given a timeout value in "opts.timeout"', () => {
    beforeEach((done) => {
      const proxy = newServiceProxy(newWorker(workerFn), { timeout: 0 /* ms */ })
      getService(proxy, done)
    })
    it('should timeout as specified', () => {
      expect(error.name).toBe('TimeoutError')
    })
  })
})