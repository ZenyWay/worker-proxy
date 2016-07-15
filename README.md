# worker-proxy
[![build status](https://travis-ci.org/ZenyWay/worker-proxy.svg?branch=master)](https://travis-ci.org/ZenyWay/worker-proxy)
[![Join the chat at https://gitter.im/ZenyWay/worker-proxy](https://badges.gitter.im/ZenyWay/worker-proxy.svg)](https://gitter.im/ZenyWay/worker-proxy?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

local proxy for web worker running a given service.

# <a name="api"></a> API v0.0.1 experimental
Typescript compatible.

## example
### worker.ts (WorkerGlobalScope)
```ts
import { extendWorker } from 'worker-proxy'
/**
 * example:
 * export interface newService {
 *   (spec?: Object): service
 * }
 * export interface service {
 *   process (text: string): string
 * }
 */
import newService from 'my-service'
const spec = { /* service configuration options */ }
const service = newService(spec)

extendWorker(self, service)
// service can now be accessed from parent process
```

### index.ts
```ts
import { newServiceProxy } from 'worker-proxy'

const proxy = newServiceProxy('worker.ts') // spawn the Worker
const text = 'Hello World!'

proxy
.then(service => service.process(text))
.then(console.log.bind(console)) // result from service.process(text) in Worker
```

# <a name="license"></a> LICENSE
Copyright 2016 Stéphane M. Catala

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the [License](./LICENSE) for the specific language governing permissions and
Limitations under the License.