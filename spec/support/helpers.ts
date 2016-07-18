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
/**
 * @param  {Object} obj
 * @param  {string} key
 * @param  {any} val
 * @return {Object} obj with (key, val) property,
 * or without the key property, if val is not supplied,
 * or as is, if key is not a property in obj
 */
export function setProperty (obj: Object, key: string, val?: any): Object {
	if (!(key in obj)) return obj
  arguments.length > 2 ? obj[key] = val : delete obj[key]
  return obj
}

/**
 * @param  {Array<T>} arr
 * @param  {(x: T) => Array<U>} fn map function that outputs an array
 * for each input value
 * @returns {Array<U>} concatenated array of all output arrays
 */
export function flatMap<T, U>(arr: T[], fn: (x: T) => U[]) : U[] {
  return Array.prototype.concat.apply([], arr.map(fn))
//  return array.reduce((map: U[], val: T) => [...map, ...fn(val)], <U[]> [])
}

/**
 * @param  {Object} obj
 * @returns Object shallow clone of {obj}, restricted to enumerable properties.
 */
export function clone<S extends T, T>(obj: S): T {
  return Object.keys(obj).reduce((clone, key) => {
    clone[key] = obj[key]
    return clone
  }, {}) as T
}