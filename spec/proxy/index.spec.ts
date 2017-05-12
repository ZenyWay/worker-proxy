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

interface PromiseResult<T> {
  val?: T
  err?: Error
}

interface WorkerMethodCall {
  method: string,
  args: any[]
}

let workify: Function
let queue: any
let workerFn: (self: Worker, onterminate?: WorkerMethodCall) => void
let url: string
let newMockWorker: (workerFn: (self: Worker, onterminate?: WorkerMethodCall) => void,
  onterminate?: WorkerMethodCall) => any
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
      'err': jasmine.any(Function),
      'misbehaved': jasmine.any(Function)
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
  workerFn = function (self: Worker, onterminate?: WorkerMethodCall): void {
    const returnValues = {
      getServiceMethods: {
        method: 'resolve',
        args: [ [ 'foo', 'err', 'misbehaved' ] ]
      },
      foo: {
        method: 'resolve',
        args: [ 'foo' ]
      },
      err: {
        method: 'reject',
        args: [ new Error('boom') ]
      },
      misbehaved: {
        method: 'unknown'
      },
      onterminate: {
        method: (onterminate && onterminate.method) || 'resolve',
        args: onterminate && onterminate.args
      }
    }
    self.onmessage = (event: MessageEvent) => {
      const data = returnValues[event.data.method]
      data.uuid = event.data.uuid
      self.postMessage(data)
    }
  }
  const blob = new Blob([ `(${workerFn}(self))` ], { type: 'text/javascript' })
  url = URL.createObjectURL(blob)
})
beforeEach(() => { // mock worker factory
  let id = 0
  newMockWorker = (workerFn: (self: Worker, onterminate?: WorkerMethodCall) => void,
  onterminate?: WorkerMethodCall) => {
    const worker =
    jasmine.createSpyObj(`worker_${++id}`, [ 'postMessage', 'terminate' ])
    const loopback: any = {
      postMessage (data: any) {
        setTimeout(worker.onmessage.bind(worker, { data: data }))
      }
    }
    workerFn.call(loopback, loopback, onterminate)
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
    let res: PromiseResult<any>
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
  describe('when given a worker {Function}', () => {
    let revokeObjectURL: any
    let proxy: any
    let res: PromiseResult<any>
    beforeEach(() => {
      const workifiedWorker = newMockWorker(workerFn)
      workifiedWorker.objectURL = 'objectURL'

      workify = jasmine.createSpy('workify')
      .and.returnValue(workifiedWorker)

      revokeObjectURL = jasmine.createSpy('revokeObjectURL')
    })
    beforeEach((done) => {
      proxy = newServiceProxy(workerFn, {
        workify: workify,
        revokeObjectURL: revokeObjectURL
      })
      res = unwrap(proxy.service, done)
    })
    it('should return an instance of ServiceProxy', () => {
      expect(proxy).toEqual(expected.proxy)
    })
    it('should instantiate a corresponding {Worker} instance with `webworkify`',
    () => {
      expect(workify).toHaveBeenCalledWith(workerFn)
    })
    it('should proxy the resulting worker', () => {
      expect(res.err).not.toBeDefined()
      expect(res.val).toEqual(expected.service)
    })
    describe('the instantiated {ServiceProxy}', () => {
      beforeEach((done) => {
        res.val.foo()
        .finally(done)
      })
      it('should revoke the object URL created from the worker {Function} ' +
      'upon reception of the first message from the worker', () => {
        expect(revokeObjectURL).toHaveBeenCalledTimes(1)
        expect(revokeObjectURL).toHaveBeenCalledWith('objectURL')
      })
    })
  })
  describe('when given a {Worker} instance', () => {
    let proxy: any
    let res: PromiseResult<any>
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
  describe('when given anything else then a {string} path, ' +
  'a worker {Function}, or {Worker} instance', () => {
    let args: any[]
    beforeEach(() => {
      const brokenWorker = newMockWorker(workerFn)
      brokenWorker.terminate = 'foo'
      args = [ undefined, true, 42, brokenWorker ]
    })
    it('should throw a TypeError', () => {
      args.forEach(arg =>
        expect(newServiceProxy.bind(undefined, arg)).toThrowError(TypeError))
    })
  })
  describe('when given an {IndexedQueue} instance in "opts.queue"', () => {
    let proxy: any
    let res: PromiseResult<any>
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
    let res: PromiseResult<any>
    beforeEach((done) => {
      const brokenQueue = { ...queue, length: 42 }
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
    let res: PromiseResult<any>
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
    let res: PromiseResult<any>
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
  it('should request the list of service method names from the worker',
  (done) => {
    const worker = newMockWorker(workerFn)
    newServiceProxy(worker).service
    .then(() =>
      expect(worker.postMessage).toHaveBeenCalledWith({
        uuid: jasmine.any(Number),
        method: 'getServiceMethods'
      }))
    .catch((err: Error) => expect(`unexpected "${err}"`).not.toBeDefined())
    .finally(schedule(done))
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
    it('should resolve to a proxied service object', () => {
      expect(res.val).toEqual(expected.service)
    })
    it('should proxy the methods from the list of service method names ' +
    'queried during instantiation by the "newServiceProxy" factory', (done) => {
      const results: Promise<any>[] = []

      results.push(res.val.foo()
      .then((res: any) => expect(res).toBe('foo'))
      .catch((err: Error) => expect(`unexpected "${err}"`).not.toBeDefined()))

      results.push(res.val.err()
      .then((res: any) => expect(`unexpected value "${res}"`).not.toBeDefined())
      .catch((err: Error) => {
        expect(err).toEqual(jasmine.any(Error))
        expect(err.message).toBe('boom')
      }))

      Promise.all(results)
      .finally(schedule(done))
    })
    it('should silently ignore incorrect messages from the worker', (done) => {
      debugger
      newServiceProxy(worker, { timeout: 100 /* ms */}).service
      .then((service: any) => service.misbehaved())
      .then((res: any) => expect(`unexpected value "${res}"`).not.toBeDefined())
      .catch((err: Error) => {
        expect(err).toEqual(jasmine.any(Error))
        expect(err.name).toBe('TimeoutError')
      })
      .finally(schedule(done))
    })
  })
  describe('method terminate (): Promise<void>', () => {
    it('should call the "onterminate" handler registered with the worker',
    (done) => {
      worker.postMessage.calls.reset()
      proxy.terminate()
      .then(() =>
        expect(worker.postMessage).toHaveBeenCalledWith({
          uuid: jasmine.any(Number),
          method: 'onterminate'
        }))
      .catch((err: Error) => expect(`unexpected "${err}"`).not.toBeDefined())
      .finally(schedule(done))
    })
    it('should resolve when the "onterminate" handler resolves', (done) => {
      proxy.terminate()
      .then((res: any) => expect(res).not.toBeDefined())
      .catch((err: Error) => expect(`unexpected "${err}"`).not.toBeDefined())
      .finally(schedule(done))
    })
    it('should reject with the error from the "onterminate" handler',
    (done) => {
      const worker = newMockWorker(workerFn, { // onterminate handler reply
        method: 'reject',
        args: [ new Error('fail') ]
      })
      newServiceProxy(worker).terminate()
      .then((res: any) => expect(`unexpected value "${res}"`).not.toBeDefined())
      .catch((err: Error) => {
        expect(err).toEqual(jasmine.any(Error))
        expect(err.message).toBe('fail')
      })
      .finally(schedule(done))
    })
    it('should terminate the worker when the "onterminate" handler resolves',
    (done) => {
      worker.terminate.calls.reset()
      proxy.terminate()
      .then((res: any) => expect(worker.terminate).toHaveBeenCalled())
      .catch((err: Error) => expect(`unexpected "${err}"`).not.toBeDefined())
      .finally(schedule(done))
    })
    it('should not terminate the worker when the "onterminate" handler rejects',
    (done) => {
      const worker = newMockWorker(workerFn, { // onterminate handler reply
        method: 'reject',
        args: [ new Error('fail') ]
      })
      worker.terminate.calls.reset()
      newServiceProxy(worker).terminate()
      .then((res: any) => expect(`unexpected value "${res}"`).not.toBeDefined())
      .catch((err: Error) => expect(worker.terminate).not.toHaveBeenCalled())
      .finally(schedule(done))
    })
  })
  describe('method kill (): void', () => {
    it('should force the worker to terminate', () => {
      worker.terminate.calls.reset()
      proxy.kill()
      expect(worker.terminate).toHaveBeenCalled()
    })
    it('should not call the "onterminate" handler registered with the worker',
    () => {
      worker.postMessage.calls.reset()
      worker.terminate.calls.reset()
      proxy.kill()
      expect(worker.postMessage).not.toHaveBeenCalled()
      expect(worker.terminate).toHaveBeenCalled()
    })
  })
})