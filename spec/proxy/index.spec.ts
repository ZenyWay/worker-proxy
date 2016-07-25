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
interface Service {
  syncwork: (foo: string, bar: string) => number
  asyncwork: (foo: string, bar: string) => Promise<number>
  stop: () => void
}

let worker: any
let queue: any
let proxy: ServiceProxy<Service>

beforeEach(() => { // mocks
  worker = jasmine.createSpyObj('worker', [ 'postMessage', 'terminate' ])
  queue = jasmine.createSpyObj('queue', [ 'pop', 'push', 'length', 'has' ])
})

beforeEach(() => {
  newServiceProxy<Service>(worker, { queue: queue })
})

describe('factory newServiceProxy<S extends Object>(worker: string|Worker, opts?: ' +
'ServiceProxyOpts): ServiceProxy<S>', () => {
  let workerFn: () => void
  let script: string
  let worker: any
  let queue: any
  let getService: (proxy: ServiceProxy<any>, done: DoneFn) => void
  let service: any // proxied service object
  let error: Error
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
    script = URL.createObjectURL(blob)
  })
  beforeEach(() => { // mock worker from script
    worker = jasmine.createSpyObj('worker', [ 'postMessage', 'terminate' ])
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
  })
  beforeEach(() => { // mock queue
    const _queue: any[] = []
    queue = jasmine.createSpyObj('queue', [ 'pop', 'push', 'has', 'length'])
    queue.push.and.callFake(_queue.push.bind(_queue))
    queue.pop.and.callFake(_queue.pop.bind(_queue))
    queue.has.and.callFake((index: number) => index <= _queue.length)
    queue.length.and.callFake(() => _queue.length)
  })
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
    beforeEach((done) => {
      const proxy = newServiceProxy(script)
      getService(proxy, done)
    })
    it('should instantiate and proxy the corresponding worker', () => {
      expect(service).toEqual({ 'foo': jasmine.any(Function) })
    })
  })
  describe('when given a {Worker} instance', () => {
    beforeEach((done) => {
      const proxy = newServiceProxy(new Worker(script))
      getService(proxy, done)
    })
    it('should instantiate and proxy the corresponding worker', () => {
      expect(service).toEqual({ 'foo': jasmine.any(Function) })
    })
  })
  describe('when given an {IndexedQueue} instance in "opts"', () => {
    beforeEach((done) => {
      const proxy = newServiceProxy(worker, { queue: queue })
      getService(proxy, done)
    })
    it('should use that queue instead of the internal queue', () => {
      expect(queue.push).toHaveBeenCalled()
    })
  })
  describe('when given a timeout value in "opts"', () => {
    beforeEach((done) => {
      const proxy = newServiceProxy(worker, { timeout: 0 /* ms */ })
      getService(proxy, done)
    })
    it('should timeout as specified', () => {
      expect(error.name).toBe('TimeoutError')
    })
  })
})