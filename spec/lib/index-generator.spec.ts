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
import newIndexGenerator,
{ isIndexGenerator, IndexGenerator } from '../../src/lib/index-generator'

let index: IndexGenerator
beforeEach(() => {
  index = newIndexGenerator() // internal index value defaults to zero
})

describe('factory newIndexGenerator(start?: number): IndexGenerator', () => {
  it('should return a new instance of IndexGenerator', () => {
    // isIndexGenerator is validated separately
    expect(isIndexGenerator(index)).toBe(true)
  })
  it('should initialize the index to the given start value when defined', () => {
    index = newIndexGenerator(42)
    // index#value is validated separately
    expect(index.value()).toBe(42)
  })
  it('should initialize the index to zero when not given a start value', () => {
    // index#value is validated separately
    expect(index.value()).toBe(0)
  })
})

describe('interface IndexGenerator', () => {
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
  describe('value (): number', () => {
    it('should return a safe integer', () => {
      index = newIndexGenerator(Number.MAX_VALUE)
      expect(Number.isSafeInteger(index.value())).toBe(true)
      index = newIndexGenerator(-Number.MAX_VALUE)
      expect(Number.isSafeInteger(index.value())).toBe(true)
    })
    it('should not affect the index value', () => {
      expect(index.value()).toBe(index.value())
      expect(index.next()).toBe(newIndexGenerator().next())
    })
  })
})

describe('isIndexGenerator (val: any): val is IndexGenerator', () => {
  it('should return true when given a duck-type instance of {IndexGenerator}',
  () => {
    expect(isIndexGenerator(newIndexGenerator())).toBe(true)
    expect(isIndexGenerator({ next () { return 0 } })).toBe(true)
  })
  it('should return false when not given an instance of {IndexGenerator}',
  () => {
    expect(isIndexGenerator()).toBe(false)
    expect(isIndexGenerator('foo')).toBe(false)
    expect(isIndexGenerator({ next: 'foo' })).toBe(false)
    expect(isIndexGenerator([ function next () { return 0 } ])).toBe(false)
    expect(isIndexGenerator({ next () { return 'foo' } })).toBe(false)
  })
})