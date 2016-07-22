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
import { isObject, isFunction, isString, isNumber } from './utils'
import debug = require('debug')
const log = debug('index-generator')

/**
 * @public
 * @factory IndexGeneratorFactory
 * @param {number} start? initial value.
 * {IndexGenerator#next} returns the next value after `start`.
 * @return {IndexGenerator} instance
 */
export interface IndexGeneratorFactory {
  (start?: number): IndexGenerator
}

/**
 * @public
 * a generator of integer index values
 * between `-Number.MAX_SAFE_INTEGER` and `Number.MAX_SAFE_INTEGER`.
 * a value generated with the {IndexGenerator#next} method
 * is guaranteed not to collide with the values from the previous
 * `2 * Number.MAX_SAFE_INTEGER` calls to that method.
 */
export interface IndexGenerator {
  /**
   * @public
   * @method next generate the next index value.
   * @return {number} new index value, guaranteed not to collide
   * with the values from the previous `2 * Number.MAX_SAFE_INTEGER`
   * calls to this method.
   */
  next (): number
  /**
   * @public
   * @method value
   * @return {number} the current index value
   */
  value (): number
}

/**
 * @public
 * @function IndexGeneratorDuckTypable
 * note that if val is an {Object} with a `next` and a `value` method,
 * the `next` method might be called once
 * to validate that its output is a {number}.
 * @param {any} val
 * @return {val is IndexGenerator}
 */
export interface IndexGeneratorDuckTypable {
  (val?: any): val is IndexGenerator
}

/**
 * @private
 * @class IndexGeneratorClass
 * @implements {IndexGenerator}
 * sequentially incrementing {IndexGenerator}.
 */
class IndexGeneratorClass implements IndexGenerator {
  /**
   * @public
   * @see {IndexGeneratorFactory}
   */
  static newInstance (start?: number): IndexGenerator {
    return new IndexGeneratorClass(Number.isSafeInteger(start) ? start : 0)
  }
  /**
   * @public
   * @see {IndexGeneratorDuckTypable}
   */
  static isIndexGenerator(val?: any): val is IndexGenerator {
    return isObject(val) && isFunction(val.next) && isNumber(val.next())
  }
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
   * @see {IndexGenerator#value}
   */
  value (): number {
    return this.index
  }
  /**
   * @private
   * @constructor
   * @param {number} index start value
   */
  constructor (public index: number) {}
}

export const isIndexGenerator: IndexGeneratorDuckTypable =
IndexGeneratorClass.isIndexGenerator

const newIndexGenerator: IndexGeneratorFactory = IndexGeneratorClass.newInstance
export default newIndexGenerator