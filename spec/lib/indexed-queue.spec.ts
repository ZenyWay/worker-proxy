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
import { newIndexedQueue, IndexedQueue } from '../../src/lib/indexed-queue'

describe('IndexedQueue', () => {
  let queue: IndexedQueue<any>

    beforeEach(() => {
    queue = newIndexedQueue()
  })

  describe('has method', () => {
    it('should return false if no index is given', () => {
      expect((<Function>queue.has)()).toBe(false)
    })
    it('should return false if given index is not in queue', () => {
      expect(queue.has(Infinity)).toBe(false)
    })
    it('should return true if given index is in queue', () => {
      const index = queue.push('foo')
      expect(queue.has(index)).toBe(true)
    })
  })

  describe('push method', () => {
    it('should return the number index of the pushed value', () => {
      expect(queue.push('foo')).toEqual(jasmine.any(Number))
    })
    it('should add the given value to the queue', () => {
      const index = queue.push('foo')
      expect(queue.has(index)).toBe(true)
      expect(queue.pop(index)).toBe('foo')
    })
    it('should add undefined to the queue if not given an argument', () => {
      const index = (<Function>queue.push)()
      expect(queue.pop(index)).toBe(undefined)
    })
  })

  describe('pop method', () => {
    let val: any, index: number
    beforeEach(() => {
      val = 'foo'
      index = queue.push(val)
    })
    it('should return the value from the queue at the given index', () => {
      expect(queue.pop(index)).toEqual(val)
    })
    it('should throw an Error if given an index not in the queue', () => {
      expect(queue.pop).toThrow()
    })
  })
})
