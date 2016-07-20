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
import { IndexGeneratorFactory, IndexGenerator } from './indexed-queue'
import debug = require('debug')
const log = debug('index-generator')

/**
 * @private
 * @class IndexGeneratorClass
 * @implements {IndexGenerator}
 * sequentially incrementing {IndexGenerator}.
 */
class IndexGeneratorClass implements IndexGenerator {
  /**
   * @see {IndexGeneratorFactory}
   */
  static newInstance (start?: number): IndexGenerator {
    return new IndexGeneratorClass(start || 0)
  }
  /**
   * @private
   * @constructor
   * @param {number} index start value
   */
  constructor (public index: number) {}
  /**
   * @public
   * @see {IndexGenerator#next}
   */
  next (): number {
    return (Number.isSafeInteger(++this.index)) ?
    this.index : this.index = Number.MIN_SAFE_INTEGER // wrap
  }
  /**
   * @public
   * @see {IndexGenerator#undo}
   */
  undo (): number {
    return (Number.isSafeInteger(--this.index)) ?
    this.index : this.index = Number.MAX_SAFE_INTEGER // wrap
  }
}

const newIndexGenerator: IndexGeneratorFactory = IndexGeneratorClass.newInstance
export default newIndexGenerator