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
import newIndexGenerator from '../../src/lib/index-generator'
import { IndexGenerator } from '../../src/lib/indexed-queue'

let index: IndexGenerator
beforeEach(() => {
  index = newIndexGenerator() // internal index value defaults to zero
})

describe('factory newIndexGenerator(start?: number): IndexGenerator', () => {
  it('should return a new instance of IndexGenerator', () => {
    expect(index.next).toEqual(jasmine.any(Function))
    expect(index.undo).toEqual(jasmine.any(Function))
  })
  it('should initialize the index to the given start value when defined', () => {
    index = newIndexGenerator(42)
    index.next()
    expect(index.undo()).toBe(42)
  })
  it('should initialize the index to zero when not given a start value', () => {
    index.next()
    expect(index.undo()).toBe(0)
  })
})

describe('IndexGenerator', () => {
  describe('next (): number', () => {
    it('should return a safe integer', () => {
      index = newIndexGenerator(Number.MAX_VALUE)
      expect(Number.isSafeInteger(index.next())).toBe(true)
      index = newIndexGenerator(-Number.MAX_VALUE)
      expect(Number.isSafeInteger(index.next())).toBe(true)
    })
    it('should return a new index value', () => {
      expect(index.next()).not.toBe(0)
    })
  })
  describe('undo (): number', () => {
    it('should return a safe integer', () => {
      index = newIndexGenerator(Number.MAX_VALUE)
      expect(Number.isSafeInteger(index.undo())).toBe(true)
      index = newIndexGenerator(-Number.MAX_VALUE)
      expect(Number.isSafeInteger(index.undo())).toBe(true)
    })
    it('should undo the previous call to next', () => {
      index.next()
      expect(index.undo()).toBe(0)
    })
  })
})