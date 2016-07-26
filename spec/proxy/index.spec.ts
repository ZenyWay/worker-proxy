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
let newMockWorker: (workerFn: () => void) => any
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
  let unwrap: (promise: Promise<any>, done: DoneFn) => { res: any, err: Error }
  beforeEach(() => {
    unwrap = (promise: Promise<any>, done: DoneFn) => {
      const result = <{ res: any, err: Error }>{}
      promise
      .then(res => (result.res = res))
      .then(setTimeout.bind(undefined, done))
      .catch((err: Error) => setTimeout(() => {
        result.err = err
        done()
      }))
      return result
    }
  })
  describe('when given a {string} path to a worker script', () => {
    let proxy: any
    let result: any
    beforeEach((done) => {
      proxy = newServiceProxy(url) // spawn a worker thread
      result = unwrap(proxy.service, done)
    })
    afterEach(() => {
      proxy.kill() // terminate the worker thread
    })
    it('should instantiate and proxy the corresponding worker', () => {
      expect(result.err).toBe(undefined)
      expect(result.res).toEqual({ 'foo': jasmine.any(Function) })
    })
  })
  describe('when given a {Worker} instance', () => {
    let result: any
    beforeEach((done) => {
      const proxy = newServiceProxy(newMockWorker(workerFn))
      result = unwrap(proxy.service, done)
    })
    it('should instantiate and proxy the corresponding worker', () => {
      expect(result.err).toBe(undefined)
      expect(result.res).toEqual({ 'foo': jasmine.any(Function) })
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
    let result: any
    beforeEach((done) => {
      const proxy = newServiceProxy(newMockWorker(workerFn), { queue: queue })
      result = unwrap(proxy.service, done)
    })
    it('should use that queue instead of the internal queue', () => {
      expect(result.err).toBe(undefined)
      expect(result.res).toEqual({ 'foo': jasmine.any(Function) })
      expect(queue.push).toHaveBeenCalled()
    })
  })
  describe('when given anything else then an {IndexedQueue} instance ' +
  'in "opts.queue"', () => {
    let result: any
    beforeEach((done) => {
      queue.length = 42 // not an IndexedQueue anymore
      const args: any[] = [ undefined, 42, () => { return 'foo' }, queue ]
      const services = args.map(arg =>
        ((<Function>newServiceProxy)(newMockWorker(workerFn), { queue: arg }))
        .service)
      result = unwrap(Promise.all(services), done)
    })
    it('should default to the internal queue', () => {
      expect(result.err).toBe(undefined)
      result.res.forEach((service: any) => {
        expect(service).toEqual({ 'foo': jasmine.any(Function) })
      })
    })
  })
  describe('when given a timeout value in "opts.timeout"', () => {
    let result: any
    beforeEach((done) => {
      const proxy =
      newServiceProxy(newMockWorker(workerFn), { timeout: 0 /* ms */ })
      result = unwrap(proxy.service, done)
    })
    it('should timeout as specified', () => {
      expect(result.err.name).toBe('TimeoutError')
    })
  })
  describe('when given anything else then a {number} "opts.timeout"', () => {
    let result: any
    beforeEach((done) => {
      const args: any[] =
      [ undefined, 'foo', () => { return 'foo' }, { foo: 'foo'} ]
      const services = args.map(arg =>
        ((<Function>newServiceProxy)(newMockWorker(workerFn), { timeout: arg }))
        .service)
      result = unwrap(Promise.all(services), done)
    })
    it('should default to the internal queue', () => {
      expect(result.error).toBe(undefined)
      result.res.forEach((service: any) => {
        expect(service).toEqual({ 'foo': jasmine.any(Function) })
      })
    })
  })
})