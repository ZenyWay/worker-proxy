# worker-proxy
[![build status](https://travis-ci.org/ZenyWay/worker-proxy.svg?branch=master)](https://travis-ci.org/ZenyWay/worker-proxy)
[![Join the chat at https://gitter.im/ZenyWay/worker-proxy](https://badges.gitter.im/ZenyWay/worker-proxy.svg)](https://gitter.im/ZenyWay/worker-proxy?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

thread-local proxy for a given service spawned in dedicated Worker thread.

the proxy resolves to a service object with the same interface
as that of the original service running in the Worker thread.
however, in its current implementation, only enumerable methods of the service
are proxied.

the proxy exposes a `terminate` method that allows to properly
shut down the service in the Worker thread, and terminate the Worker.

# <a name="api"></a> API v1.0.0 experimental
Typescript compatible.

## example
### module: `my-service`
example of a third-party service module that we want to spawn
in a dedicated Worker thread and proxy in the main thread.
(this service module is not part of the `worker-proxy` module)

```ts
/**
 * this is the service that will be spawned in a Worker thread
 * and that will be proxied in the main thread.
 * in this example, the service is created by a factory,
 * and it exposes an async interface (async service methods).
 * it also expects to be shut down by calling its `stop` method, async as well.
 */
export interface Service {
  process (text: string): Promise<string>
  stop (): Promise<void> // say this must be called to shut down the service
}

export interface ServiceFactory {
  (spec?: Object): Promise<Service>
}

export const newService: ServiceFactory
```

### file: `worker.ts` (`WorkerGlobalScope`)
this script will be spawned from the main thread in a dedicated Worker thread.
it creates and initializes the service from the `my-service` module,
then hooks it up so that it can be proxied from the main thread,
and waits until the proxy's terminate method is called in the main thread,
then properly shuts down the service
before allowing this Worker thread to be terminated from the main thread.

```ts
import { extendWorker } from 'worker-proxy'
import { newService, Service } from 'my-service'

// create and initialize the service
const spec = { /* service configuration options */ }
const service = newService(spec)

// hook up the service so it can be proxied from the main thread
// and wait until the proxy's terminate method is called in the main thread
extendWorker(self, service)
.then((terminate) => {
  service.stop() // shut service down if necessary
  .then(terminate) // then terminate this Worker from the main thread
})
```

### file: index.ts
this script runs in the main thread.
it spawns the `worker.ts` script in a dedicated Worker thread
and proxies it in the main thread.

the resulting proxy resolves to a service object with the same interface
as that of the original service running in the Worker thread.
note that in its current implementation, only enumerable methods of the service
are proxied.

to shut down the service and terminate the Worker,
the proxy's `terminate` method can be called as in this example.

```ts
import { newServiceProxy } from 'worker-proxy'
import { Service } from 'my-service' // only import the interface for casting

// proxy and spawn the Worker
const proxy: Promise<Service> = newServiceProxy('./worker.ts')

// unwrap the Promise to access the proxied service
proxy
.then(service => service.process('Hello World!'))
.then(console.log.bind(console)) // result from service.process('Hello World!') in Worker
.then(() => proxy.terminate()) // shut down service and terminate Worker
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