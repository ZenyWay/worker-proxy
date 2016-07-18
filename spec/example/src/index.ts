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

import { newServiceProxy } from '../../../src'
import { Service } from './sample-service'
import debug = require('debug')
const log = debug('example')
debug.enable('*')

log('start')
// proxy and spawn the Worker
const proxy = newServiceProxy<Service>('./worker.js')
const terminate = proxy.terminate.bind(proxy)
log(proxy)
// unwrap the Promise to access the proxied service
proxy.service
.tap(service => log(service))
.then(service => service.toUpperCase('Rob says wow!'))
.tap(log) // result from service.process('Hello World!') in Worker
.then(terminate) // shut down service and terminate Worker
.catch(err => proxy.kill()) // force Worker termination, even if service shut-down fails