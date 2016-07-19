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
import debug = require('debug')
const log = debug('indexed-queue')

export interface IndexedQueueFactory {
  <T>(): IndexedQueue<T>
}

/**
 * @public
 * simple indexed queue.
 *
 * note: `index` indexes start at zero, are generated in unit increments
 * and wrap to Number.MIN_SAFE_INTEGER when reaching
 * `!Number.isSafeInteger(index)`.
 * this implementation does not test index conflicts.
 * (very) old entries hence theoretically risk being overridden.
 * use of this queue hence assumes that entries are only temporarily queued
 * and removed before the time it takes to wrap all safe integers
 * (which should practically always be true).
 * @generic {T} type of queued values
 */
export interface IndexedQueue<T> {
  /**
   * @public
   * @method
   * extract and return the entry indexed by the given `index`.
   * the entry is definitively removed from this `IndexedQueue`.
   * @param  {number} index index
   * @returns {T} indexed entry
   * @error {Reference Error} 'invalid reference'
   */
  pop (index: number): T
	/**
   * @public
   * @method
   * queue the given `val` and return its `index` index.
   * note that index values are incrementally generated and
   * wrap every `2*MAX_SAFE_INTEGER + 1`.
   * this method does not check if an entry already exists
   * for the generated index.
   * it is hence theoretically possible for this method
   * to overwrite a queued value, although in practice highly unlikely.
	 * @param  {T} val
	 * @returns {number} index of queued `val`
	 */
	push (val: T): number
  /**
   * @public
   * @method
   * @returns {number} length of queue
   */
  length (): number
  /**
   * @public
   * @method
   * @param  {number} index index
   * @returns {boolean} true if an entry is queued with the given `index`
   */
  has (index: number): boolean
}

/**
 * @public
 * indexed queue
 * @generic {T} type of queued values
 */
class IndexedQueueClass<T> implements IndexedQueue<T> {
  static getInstance <T>(): IndexedQueue<T> {
    return new IndexedQueueClass<T>()
  }
  /**
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
   * @see {IndexedQueue#push}
	 */
	push (val: T): number {
  	const index = this._index.next()
  	this._queue[index] = val
    this._length++
    log('Queue.length', this._length)
    return index
  }
  /**
   * @see {IndexedQueue#length}
   */
  length (): number {
    return this._length
  }
  /**
   * @see {IndexedQueue#has}
   */
  has (index: number): boolean {
  	return index in this._queue
  }
  /**
   * @private
   */
  _length = 0
  /**
   * @private
   */
  _index = new Index()
  /**
   * @private
   */
  _queue = {}
}

export const newIndexedQueue: IndexedQueueFactory =
IndexedQueueClass.getInstance

/**
 * @private
 * sequentially incrementing index
 */
class Index {
  next (): number {
    return (Number.isSafeInteger(++this._index)) ?
    this._index : this._index = Number.MIN_SAFE_INTEGER // wrap
  }
  _index = 0
}

function assert (val: boolean, errType: typeof Error, message: string): void {
  if (val) return
  throw new errType(message)
}