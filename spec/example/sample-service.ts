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
import Promise = require('bluebird')

export interface ServiceFactory {
  (spec?: Object): Promise<Service> // let's pretend service initialization is async
}

export interface Service {
  toUpperCase (text: string): string
  stop (): Promise<void>
}

/**
 * @private
 * the mocked Service implementation
 */
class ServiceClass implements Service {
  static newInstance: ServiceFactory = function () {
    return Promise.resolve(new ServiceClass())
  }

  toUpperCase (text: string): string {
    return text.toUpperCase()
  }

  stop (): Promise<void> {
    return Promise.resolve()
  }
}

const newService: ServiceFactory = ServiceClass.newInstance
export default newService