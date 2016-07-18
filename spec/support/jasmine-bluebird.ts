/// <reference path="../../typings/index.d.ts" />
import { resolve, reject } from 'bluebird'

/**
 * helper function for proper termination of Bluebird promises
 * when calling jasmine's done()
 * @param  {DoneFn} done
 * @returns {(any?): Promise<void>} resolved
 * @see http://bluebirdjs.com/docs/warning-explanations.html#warning-a-promise-was-created-in-a-handler-but-was-not-returned-from-it
 */
export function pass (done: DoneFn) {
  return (val?: any) => resolve(done())
}

/**
 * helper function for proper termination of Bluebird promises
 * when calling jasmine's done.fail()
 * @param  {DoneFn} done
 * @param  {string?} msg optional, overrides input argument of returned function
 * @returns {(any?): Promise<void>} resolved
 * @see http://bluebirdjs.com/docs/warning-explanations.html#warning-a-promise-was-created-in-a-handler-but-was-not-returned-from-it
 */
export function fail (done: DoneFn, msg?: string) {
  return (val?: any) => resolve(done.fail(msg || val))
}