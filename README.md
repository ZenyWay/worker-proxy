# worker-proxy
[![build status](https://travis-ci.org/ZenyWay/worker-proxy.svg?branch=master)](https://travis-ci.org/ZenyWay/worker-proxy)
[![Join the chat at https://gitter.im/ZenyWay/worker-proxy](https://badges.gitter.im/ZenyWay/worker-proxy.svg)](https://gitter.im/ZenyWay/worker-proxy?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

local proxy for web worker running a given service.

# <a name="api"></a> API v1.0.0 experimental
Typescript compatible.

## example
### module: `my-service`
example of a service module.

```ts
/**
 * this is the service that will be spawned in a Worker thread
 * and that will be proxied in the main thread.
 * in this example, the service is created by a factory.
 */
export interface Service {
  process (text: string): string
}

export interface ServiceFactory {
  (spec?: Object): Promise<Service>
}

export const newService: ServiceFactory
```

### file: `worker.ts` (`WorkerGlobalScope`)
this script will be spawned from the main thread in a dedicated Worker thread.
it creates and initializes the service from the `my-service` module,
then hooks it up so that it can be proxied from the main thread.

```ts
import { extendWorker } from 'worker-proxy'
import { newService, Service } from 'my-service'

// create and initialize the service
const spec = { /* service configuration options */ }
const service = newService(spec)

// hook up the service so it can be proxied from the main thread
extendWorker(self, service)
```

### index.ts
this script proxies and spawns the `worker.ts` script
in a dedicated Worker thread.
the proxy resolves to a service object with the same interface
as that of the original service running in the Worker thread.

```ts
import { newServiceProxy } from 'worker-proxy'
import { Service } from 'my-service' // only import the interface for casting

// proxy and spawn the Worker
const proxy: Promise<Service> = newServiceProxy('./worker.ts')

// unwrap the Promise to access the service
proxy
.then(service => service.process('Hello World!'))
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