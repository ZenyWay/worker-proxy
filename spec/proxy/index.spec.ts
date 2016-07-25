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
debugger
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
  describe('when given a {string} path to a worker script', () => {
    let service: any
    beforeEach((done) => {
      const worker = function () {
        this.onmessage = (event: MessageEvent) => {
          event.data.method = 'resolve'
          event.data.args = [ [ 'foo' ] ]
          this.postMessage(event.data)
        }
      }
      const script = `(${worker}())`
      const blob = new Blob([ script ], { type: 'text/javascript' })
      const url = URL.createObjectURL(blob) // requires "dom" lib declaration in tsconfig.json
      const proxy = newServiceProxy(url)
      proxy.service
      .then(_service => (service = _service))
      .then(setTimeout.bind(undefined, done))
    })
    it('should instantiate and proxy the corresponding worker', () => {
      expect(service).toEqual({ 'foo': jasmine.any(Function) })
    })
    it('should', () => {

    })
  })
})