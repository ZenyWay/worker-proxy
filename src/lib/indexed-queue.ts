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
import newIndexGenerator from './index-generator.ts'
import debug = require('debug')
const log = debug('indexed-queue')

/**
 * @public
 * @param {IndexedQueueOpts} opts?
 * @return {IndexedQueue} instance
 */
export interface IndexedQueueFactory {
  <T>(opts?: IndexedQueueOpts): IndexedQueue<T>
}

export interface IndexedQueueOpts {
  /**
   * @public
   * @prop {IndexGenerator} index?
   */
  index?: IndexGenerator
}

/**
 * @public
 * @param  {number} start? initial value.
 * {IndexGenerator#next} returns the next value after `start`.
 * @returns {IndexGenerator} instance
 */
export interface IndexGeneratorFactory {
  (start?: number): IndexGenerator
}

/**
 * @public
 * a generator of {number} index values
 * between `-Number.MIN_SAFE_INTEGER` and `Number.MAX_SAFE_INTEGER`.
 * a generated value is guaranteed not to collide
 * with the previous `Number.MAX_SAFE_INTEGER - Number.MAX_SAFE_INTEGER`.
 */
export interface IndexGenerator {
  /**
   * @public
   * @method next generate the next index value.
   * @return {number} new index value, guaranteed not to collide
   * with the previous `Number.MAX_SAFE_INTEGER - Number.MAX_SAFE_INTEGER`.
   */
  next (): number
  /**
   * @public
   * @method undo the previous call to `this.next()`.
   * @return {number} previously generated index value
   */
  undo (): number
}

/**
 * @public
 * @interface IndexedQueue
 * simple indexed queue that automatically generates indexes for pushed entries.
 * index values are any safe integer between `Number.MIN_SAFE_INTEGER`
 * and `Number.MAX_SAFE_INTEGER`.
 * a generated value is guaranteed not to collide
 * with the previous `Number.MAX_SAFE_INTEGER - Number.MAX_SAFE_INTEGER`.
 * @generic {T} type of queued values
 */
export interface IndexedQueue<T> {
  /**
   * @public
   * @method pop
   * extract and return the entry indexed by the given `index`.
   * the entry is definitively removed from this `IndexedQueue`.
   * @param  {number} index
   * @returns {T} indexed entry
   * @error {Reference Error} 'invalid reference' when no arguments,
   * or when `index` is not a number or not in the queue
   */
  pop (index: number): T
	/**
   * @public
   * @method push
   * queue the given `val` and return its `index` index.
	 * @param  {T} val
	 * @returns {number} index of queued `val`
   * @error {Reference Error} 'invalid reference' when no arguments
   * @error {Error} 'internal resource conflict for index ${index}'
   * when an entry is already queued at the generated index.
   * in this case, the value of the next index remains unaffected.
	 */
	push (val: T): number
  /**
   * @public
   * @method length
   * @return {number} length of queue
   */
  length (): number
  /**
   * @public
   * @method has
   * @param {number} index
   * @return {boolean} true when an entry is queued with the given `index`
   */
  has (index: number): boolean
}

/**
 * @private
 * @class IndexedQueueClass<T>
 * @implements implements IndexedQueue<T>
 * @generic {T} type of queued values
 */
class IndexedQueueClass<T> implements IndexedQueue<T> {
  /**
   * @public
   * @see {IndexedQueueFactory}
   */
  static getInstance <T>(opts?: IndexedQueueOpts): IndexedQueue<T> {
    assert(!opts || !opts.index || isIndexGenerator(opts.index),
    TypeError, 'invalid IndexGenerator')
    return new IndexedQueueClass<T>(opts && opts.index || newIndexGenerator())
  }

  constructor (public index: IndexGenerator) {}
  /**
   * @public
   * @see {IndexedQueue#pop}
   */
  pop (index: number): T {
    assert(this.has(index), ReferenceError, 'invalid reference')
  	const val = this._queue[index]
    delete this._queue[index]
    this._length--
    log('Queue.length', this._length)
    return val
  }
	/**
   * @public
   * @see {IndexedQueue#push}
	 */
	push (val: T): number {
    assert(!!arguments.length, ReferenceError, 'missing argument')

  	const index = this.index.next()
    assert(!this.has(index) || this.rollbackIndex(), Error,
    `internal resource conflict for index ${index}`)

  	this._queue[index] = val
    this._length++
    log('Queue.length', this._length)
    return index
  }
  /**
   * @public
   * @see {IndexedQueue#length}
   */
  length (): number {
    return this._length
  }
  /**
   * @public
   * @see {IndexedQueue#has}
   */
  has (index: number): boolean {
  	return (typeof index === 'number') && index in this._queue
  }
  /**
   * @private
   * @method rollbackIndex
   * rollback to previous index value
   * @return {boolean} false, always
   */
  rollbackIndex () {
    this.index.undo()
    return false
  }
  /**
   * @private
   */
  _length = 0
  /**
   * @private
   */
  _queue = {}
}

function isIndexGenerator(val: any): val is IndexGenerator {
  return val && isObject(val) && isFunction(val.next) && isFunction(val.undo) &&
  isNumber(val.next()) && isNumber(val.undo())
}

function isObject (val: any): val is Object {
  return typeof val === 'object'
}

function isFunction (val: any): val is Function {
  return typeof val === 'function'
}

function isNumber (val: any): val is number {
  return typeof val === 'number'
}

function assert (val: boolean, errType: typeof Error, message: string): void {
  if (val) return
  throw new errType(message)
}

export const newIndexedQueue: IndexedQueueFactory =
IndexedQueueClass.getInstance