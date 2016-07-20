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
import {
  newIndexedQueue,
  IndexedQueue,
  IndexGenerator
} from '../../src/lib/indexed-queue'

let mockIndex: any
let queue: IndexedQueue<any>

beforeEach(() => { // setup mockIndex
  let _index = 0
  mockIndex = jasmine.createSpyObj('mockIndex', [ 'next', 'undo'])
  mockIndex.next.and.callFake(() => ++_index)
  mockIndex.undo.and.callFake(() => --_index)
})

beforeEach(() => { // setup queue
  queue = newIndexedQueue({ index: <IndexGenerator>mockIndex })
  mockIndex.next.calls.reset()
  mockIndex.undo.calls.reset()
})

describe('factory newIndexedQueue <T>(opts?: { index?: IndexGenerator }): ' +
'IndexedQueue<T>', () => {
  it('should return an instance of IndexedQueue', () => {
    expect(queue.pop).toEqual(jasmine.any(Function))
    expect(queue.push).toEqual(jasmine.any(Function))
    expect(queue.has).toEqual(jasmine.any(Function))
    expect(queue.length).toEqual(jasmine.any(Function))
  })
  it('should override the internal IndexGenerator with opts.index', () => {
    queue.push(42)
    expect(mockIndex.next).toHaveBeenCalled()
    mockIndex.undo()
    mockIndex.undo.calls.reset()
    try { queue.push(42) } catch (e) {} // Error 'internal conflict ...'
    expect(mockIndex.undo).toHaveBeenCalled()
  })
  it('should default to the internal IndexGenerator ' +
  'when opts.index not specified', () => {
    const queue = newIndexedQueue()
    expect(queue.pop(queue.push(42))).toBe(42)
  })
})

describe('IndexedQueue<T>', () => {
  describe('method has (index: number): boolean', () => {
    let index: number
    beforeEach(() => {
      index = queue.push(42)
      mockIndex.next.calls.reset()
      mockIndex.undo.calls.reset()
    })
    it('should return true when given an index that is queued', () => {
      expect(queue.has(index)).toBe(true)
    })
    it('should return false when given a number index not in the queue', () => {
      expect(queue.has(42)).toBe(false)
    })
    it('should return false when given an index that is not a number', () => {
      expect((<Function>queue.has)('foo')).toBe(false)
    })
    it('should return false when not given an index', () => {
      expect((<Function>queue.has)()).toBe(false)
    })
    it('should not affect the value of the next index', () => {
      queue.has(42) // true
      expect(mockIndex.next).not.toHaveBeenCalled()
      expect(mockIndex.undo).not.toHaveBeenCalled()
      queue.has(0) // false
      expect(mockIndex.next).not.toHaveBeenCalled()
      expect(mockIndex.undo).not.toHaveBeenCalled()
    })
  })

  describe('method push (val: T): number', () => {
    it('should return the number index of the pushed value', () => {
      expect(queue.has(queue.push(42))).toBe(true)
    })
    it('should add the given value to the queue', () => {
      expect(queue.pop(queue.push('foo'))).toBe('foo')
    })
    it('should accept to add undefined to the queue', () => {
      expect(queue.pop(queue.push(undefined))).toBe(undefined)
    })
    it('should throw a ReferenceError when given no argument', () => {
      expect(queue.push.bind(queue)).toThrowError(ReferenceError)
    })
    it('should throw a "internal resource conflict for index ${index}" Error ' +
    'without affecting the value of the next index ' +
    'when an entry is already queued at the generated index', () => {
      const index = queue.push(42)
      mockIndex.undo()
      mockIndex.undo.calls.reset()
      expect(queue.push.bind(queue, 42))
      .toThrowError(Error, `internal resource conflict for index ${index}`)
      expect(mockIndex.undo).toHaveBeenCalled()
      expect(mockIndex.undo.calls.length).toBe(mockIndex.next.calls.length)
    })
  })

  describe('method pop (index: number): T', () => {
    let index: number
    beforeEach(() => {
      index = queue.push(42)
      mockIndex.next.calls.reset()
      mockIndex.undo.calls.reset()
    })
    it('should return the value from the queue at the given index', () => {
      expect(queue.pop(index)).toEqual(42)
    })
    it('should throw a ReferenceError when given a number index not in the queue',
    () => {
      expect(queue.pop.bind(queue, 42)).toThrowError(ReferenceError)
    })
    it('should throw a ReferenceError when given an index that is not a number',
    () => {
      expect(queue.pop.bind(queue, 'foo')).toThrowError(ReferenceError)
    })
    it('should throw a ReferenceError when not given an index', () => {
      expect(queue.pop.bind(queue)).toThrowError(ReferenceError)
    })
    it('should not affect the value of the next index', () => {
      queue.pop(index) // 42
      expect(mockIndex.next).not.toHaveBeenCalled()
      expect(mockIndex.undo).not.toHaveBeenCalled()
      try { queue.pop(42) } catch (e) {} // ReferenceError
      expect(mockIndex.next).not.toHaveBeenCalled()
      expect(mockIndex.undo).not.toHaveBeenCalled()
    })
  })

  describe('method length (): number', () => {
    it('should start from zero for a new queue instance', () => {
      expect(queue.length()).toBe(0)
    })
    it('should increase by one when a new entry is added (push)', () => {
      queue.push('')
      expect(queue.length()).toBe(1)
      queue.push('')
      expect(queue.length()).toBe(2)
    })
    it('should decrease by one when an entry is removed (pop)', () => {
      const indexes = [ 'a', 'b', 'c' ].map(val => queue.push(val))
      queue.pop(indexes.pop())
      expect(queue.length()).toBe(2)
      queue.pop(indexes.pop())
      expect(queue.length()).toBe(1)
    })
  })
})
