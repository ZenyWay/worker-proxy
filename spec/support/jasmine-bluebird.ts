import * as Promise from 'bluebird'

/**
 * helper function for proper termination of Bluebird promises
 * when calling jasmine's done()
 * @param  {DoneFn} done
 * @returns {(any?): Promise<void>} resolved
 * @see http://bluebirdjs.com/docs/warning-explanations.html#warning-a-promise-was-created-in-a-handler-but-was-not-returned-from-it
 */
export function pass (done: DoneFn) {
  return (val?: any) => Promise.resolve(done())
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
  return (val?: any) => Promise.resolve(done.fail(msg || val))
}

/**
 * unwrap a value from a promise when it resolves,
 * or the error when the promise is rejected,
 * and then call `done` on the next tick.
 * intended for use in a jasmine `beforeEach` block:
 * ```
 * let result: { val?: any, err?: Error }
 * beforeEach((done) => {
 *   const p = Promise.resolve('foo')
 *   result = unwrap(p, done)
 * })
 * ```
 * @param {Promise<T>} promise
 * @param {DoneFn} done
 * @return {{ val?: T, err?: Error}} populated when `done` is called
 */
export function unwrap <T>(promise: Promise<T>, done: DoneFn): Result<T> {
  const res = <Result<T>>{}
  promise
  .then(val => (res.val = val))
  .then(setTimeout.bind(undefined, done))
  .catch((err: Error) => setTimeout(() => {
    res.err = err
    setTimeout(done)
  }))
  return res
}

interface Result<T> {
  val?: T,
  err?: Error
}

/**
 * from @types/jasmine
 */
interface DoneFn extends Function {
    (): void;

    /** fails the spec and indicates that it has completed. If the message is an Error, Error.message is used */
    fail: (message?: Error|string) => void;
}