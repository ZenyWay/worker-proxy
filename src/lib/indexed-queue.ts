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
 * note: `uuid` indexes start at zero, are generated in unit increments
 * and wrap to Number.MIN_SAFE_INTEGER when reaching
 * `!Number.isSafeInteger(uuid)`.
 * this implementation does not test uuid conflicts.
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
   * extract and return the entry indexed by the given `uuid`.
   * the entry is definitively removed from this `IndexedQueue`.
   * @param  {number} uuid index
   * @returns {T} indexed entry
   */
  pop (uuid: number): T
	/**
   * @public
   * @method
   * queue the given `val` and return its `uuid` index
	 * @param  {T} val
	 * @returns {number} uuid of queued `val`
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
   * @param  {number} uuid index
   * @returns {boolean} true if an entry is queued under the given `uuid`
   */
  has (uuid: number): boolean
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
  pop (uuid: number): T {
  	const val = this._queue[uuid]
    delete this._queue[uuid]
    this._length--
    log('Queue.length', this._length)
    return val
  }
	/**
   * @see {IndexedQueue#push}
	 */
	push (val: T): number {
  	const uuid = this._uuid.next()
  	this._queue[uuid] = val
    this._length++
    log('Queue.length', this._length)
    return uuid
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
  has (uuid: number): boolean {
  	return uuid in this._queue
  }
  /**
   * @private
   */
  _length = 0
  /**
   * @private
   */
  _uuid = new Uuid()
  /**
   * @private
   */
  _queue = {}
}

export const newIndexedQueue: IndexedQueueFactory =
IndexedQueueClass.getInstance

/**
 * @private
 * sequentially incrementing uuid
 */
class Uuid {
  next (): number {
    return (Number.isSafeInteger(++this.uuid)) ?
    this.uuid : this.uuid = Number.MIN_SAFE_INTEGER // wrap
  }
  uuid = 0
}