/// <reference path="../../../typings/index.d.ts" />

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
import { hookService } from '../../../src'
import newService from './sample-service'
import debug = require('debug')
const log = debug('example')
debug.enable('*')

// create and initialize the service
const spec = { /* service configuration options */ }
const service = newService(spec) // Promise<Service>

// define an `onterminate` handler to properly shut down the service
// before this Worker is terminated.
// the return value will be sent back to the main thread.
function onterminate () {
  return service
  .then(service => service.stop()) // resolve or reject back to main thread
}

// hook up the service so it can be proxied from the main thread
// and wait until the proxy's terminate method is called in the main thread
service
.tap(service => console.log('worker service', service))
.then(service => hookService({
  worker: self,
  service: service,
  onterminate: onterminate
}))