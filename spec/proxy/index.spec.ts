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
import { schedule, unwrap } from '../support/jasmine-bluebird'

interface Result<T> {
  val?: T
  err?: Error
}

let queue: any
let workerFn: () => void // decorate `this`
let url: string
let newMockWorker: (workerFn: () => void) => any
let expected: any

beforeEach(() => { // predefined expectations
  expected = {
    proxy: { // expected ServiceProxy instance
      service: jasmine.any(Promise),
      terminate: jasmine.any(Function),
      kill: jasmine.any(Function)
    },
    service: { // expected proxied service object
      'foo': jasmine.any(Function),
      'err': jasmine.any(Function)
    }
  }
})
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
        args: [ [ 'foo', 'err' ] ]
      },
      foo: {
        method: 'resolve',
        args: [ 'foo' ]
      },
      err: {
        method: 'reject',
        args: [ new Error('boom') ]
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
beforeEach(() => { // mock worker factory
  let id = 0
  newMockWorker = (workerFn: () => void) => {
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
  describe('when given a {string} path to a worker script', () => {
    let proxy: any
    let res: Result<any>
    beforeEach((done) => {
      proxy = newServiceProxy(url) // spawn a worker thread
      res = unwrap(proxy.service, done)
    })
    afterEach(() => {
      proxy.kill() // terminate the worker thread
    })
    it('should return an instance of ServiceProxy', () => {
      expect(proxy).toEqual(expected.proxy)
    })
    it('should instantiate and proxy the corresponding worker', () => {
      expect(res.err).not.toBeDefined()
      expect(res.val).toEqual(expected.service)
    })
  })
  describe('when given a {Worker} instance', () => {
    let proxy: any
    let res: Result<any>
    beforeEach((done) => {
      proxy = newServiceProxy(newMockWorker(workerFn))
      res = unwrap(proxy.service, done)
    })
    it('should return an instance of ServiceProxy', () => {
      expect(proxy).toEqual(expected.proxy)
    })
    it('should instantiate and proxy the corresponding worker', () => {
      expect(res.err).not.toBeDefined()
      expect(res.val).toEqual(expected.service)
    })
  })
  describe('when given anything else then a {string} path ' +
  'or {Worker} instance', () => {
    let args: any[]
    beforeEach(() => {
      const brokenWorker = newMockWorker(workerFn)
      brokenWorker.terminate = 'foo'
      args = [ undefined, 42, () => { return 'foo' }, brokenWorker ]
    })
    it('should throw a TypeError', () => {
      args.forEach(arg =>
        expect(newServiceProxy.bind(undefined, arg)).toThrowError(TypeError))
    })
  })
  describe('when given an {IndexedQueue} instance in "opts.queue"', () => {
    let proxy: any
    let res: Result<any>
    beforeEach((done) => {
      proxy = newServiceProxy(newMockWorker(workerFn), { queue: queue })
      res = unwrap(proxy.service, done)
    })
    it('should return an instance of ServiceProxy', () => {
      expect(proxy).toEqual(expected.proxy)
    })
    it('should use that queue instead of the internal queue', () => {
      expect(res.err).not.toBeDefined()
      expect(res.val).toEqual(expected.service)
      expect(queue.push).toHaveBeenCalled()
    })
  })
  describe('when given anything else then an {IndexedQueue} instance ' +
  'in "opts.queue"', () => {
    let proxies: any[]
    let res: Result<any>
    beforeEach((done) => {
      const brokenQueue = Object.assign({}, queue, { length: 42 })
      const values = [ undefined, 42, () => { return 'foo' }, brokenQueue ]
      proxies = values.map(val =>
        ((<Function>newServiceProxy)(newMockWorker(workerFn), { queue: val })))
      res = unwrap(Promise.all(proxies.map(proxy => proxy.service)), done)
    })
    it('should return an instance of ServiceProxy', () => {
      proxies.forEach(proxy => expect(proxy).toEqual(expected.proxy))
    })
    it('should default to the internal queue', () => {
      expect(res.err).not.toBeDefined()
      res.val.forEach((service: any) => {
        expect(service).toEqual(expected.service)
      })
    })
  })
  describe('when given a timeout value in "opts.timeout"', () => {
    let res: Result<any>
    beforeEach((done) => {
      const proxy =
      newServiceProxy(newMockWorker(workerFn), { timeout: 0 /* ms */ })
      res = unwrap(proxy.service, done)
    })
    it('should timeout as specified', () => {
      expect(res.err.name).toBe('TimeoutError')
    })
  })
  describe('when given anything else then a {number} "opts.timeout"', () => {
    let proxies: any[]
    let res: Result<any>
    beforeEach((done) => {
      const values: any[] =
      [ undefined, '42', () => { return 42 }, [ 42 ], { '42': 42 } ]
      proxies = values.map(val =>
        ((<Function>newServiceProxy)(newMockWorker(workerFn), { timeout: val })))
      res = unwrap(Promise.all(proxies.map(proxy => proxy.service)), done)
    })
    it('should return an instance of ServiceProxy', () => {
      proxies.forEach(proxy => expect(proxy).toEqual(expected.proxy))
    })
    it('should maintain the default timeout', () => {
      expect(res.err).not.toBeDefined()
      res.val.forEach((service: any) => {
        expect(service).toEqual(expected.service)
      })
    })
  })
  it('should request the list of service method names from the worker', () => {
    const worker = newMockWorker(workerFn)
    newServiceProxy(worker)
    expect(worker.postMessage).toHaveBeenCalledWith(jasmine.objectContaining({
      method: 'getServiceMethods'
    }))
  })
})

describe('ServiceProxy<S extends Object>', () => {
  let worker: any
  let proxy: ServiceProxy<any>
  let res: any
  beforeEach((done) => {
    worker = newMockWorker(workerFn)
    proxy = newServiceProxy(worker)
    res = unwrap(proxy.service, done)
  })
  describe('property service: Promise<S>', () => {
    it('should proxy the methods from the list of service method names ' +
    'queried during instantiation by the "newServiceProxy" factory', (done) => {
      expect(res.val).toEqual(expected.service)
      res.val.foo()
      .catch(schedule(done.fail))
      .then((res: any) => expect(res).toBe('foo'))
      .finally(schedule(done))
    })
  })
  describe('method terminate (): Promise<void>', () => {

  })
  describe('method kill (): void', () => {

  })
})