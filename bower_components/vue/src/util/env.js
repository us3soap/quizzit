<<<<<<< HEAD
/* global MutationObserver */
=======
/* globals MutationObserver */
>>>>>>> 0fb031e1fcec6e23b724b00c1061b1c1a1c5f583

// can we use __proto__?
export const hasProto = '__proto__' in {}

// Browser environment sniffing
export const inBrowser =
  typeof window !== 'undefined' &&
  Object.prototype.toString.call(window) !== '[object Object]'

// detect devtools
export const devtools = inBrowser && window.__VUE_DEVTOOLS_GLOBAL_HOOK__

// UA sniffing for working around browser-specific quirks
const UA = inBrowser && window.navigator.userAgent.toLowerCase()
export const isIE = UA && UA.indexOf('trident') > 0
export const isIE9 = UA && UA.indexOf('msie 9.0') > 0
export const isAndroid = UA && UA.indexOf('android') > 0
<<<<<<< HEAD
export const isIos = UA && /(iphone|ipad|ipod|ios)/i.test(UA)
export const iosVersionMatch = isIos && UA.match(/os ([\d_]+)/)
export const iosVersion = iosVersionMatch && iosVersionMatch[1].split('_')

// detecting iOS UIWebView by indexedDB
export const hasMutationObserverBug = iosVersion && Number(iosVersion[0]) >= 9 && Number(iosVersion[1]) >= 3 && !window.indexedDB
=======
export const isIOS = UA && /iphone|ipad|ipod|ios/.test(UA)
>>>>>>> 0fb031e1fcec6e23b724b00c1061b1c1a1c5f583

let transitionProp
let transitionEndEvent
let animationProp
let animationEndEvent

// Transition property/event sniffing
if (inBrowser && !isIE9) {
  const isWebkitTrans =
    window.ontransitionend === undefined &&
    window.onwebkittransitionend !== undefined
  const isWebkitAnim =
    window.onanimationend === undefined &&
    window.onwebkitanimationend !== undefined
  transitionProp = isWebkitTrans
    ? 'WebkitTransition'
    : 'transition'
  transitionEndEvent = isWebkitTrans
    ? 'webkitTransitionEnd'
    : 'transitionend'
  animationProp = isWebkitAnim
    ? 'WebkitAnimation'
    : 'animation'
  animationEndEvent = isWebkitAnim
    ? 'webkitAnimationEnd'
    : 'animationend'
}

export {
  transitionProp,
  transitionEndEvent,
  animationProp,
  animationEndEvent
}

<<<<<<< HEAD
=======
/* istanbul ignore next */
function isNative (Ctor) {
  return /native code/.test(Ctor.toString())
}

>>>>>>> 0fb031e1fcec6e23b724b00c1061b1c1a1c5f583
/**
 * Defer a task to execute it asynchronously. Ideally this
 * should be executed as a microtask, so we leverage
 * MutationObserver if it's available, and fallback to
 * setTimeout(0).
 *
 * @param {Function} cb
 * @param {Object} ctx
 */

export const nextTick = (function () {
<<<<<<< HEAD
  var callbacks = []
  var pending = false
  var timerFunc
  function nextTickHandler () {
    pending = false
    var copies = callbacks.slice(0)
    callbacks = []
    for (var i = 0; i < copies.length; i++) {
=======
  const callbacks = []
  let pending = false
  let timerFunc

  function nextTickHandler () {
    pending = false
    const copies = callbacks.slice(0)
    callbacks.length = 0
    for (let i = 0; i < copies.length; i++) {
>>>>>>> 0fb031e1fcec6e23b724b00c1061b1c1a1c5f583
      copies[i]()
    }
  }

<<<<<<< HEAD
  /* istanbul ignore if */
  if (typeof MutationObserver !== 'undefined' && !hasMutationObserverBug) {
    var counter = 1
    var observer = new MutationObserver(nextTickHandler)
    var textNode = document.createTextNode(counter)
    observer.observe(textNode, {
      characterData: true
    })
    timerFunc = function () {
      counter = (counter + 1) % 2
      textNode.data = counter
    }
  } else {
    // webpack attempts to inject a shim for setImmediate
    // if it is used as a global, so we have to work around that to
    // avoid bundling unnecessary code.
    const context = inBrowser
      ? window
      : typeof global !== 'undefined' ? global : {}
    timerFunc = context.setImmediate || setTimeout
  }
=======
  // the nextTick behavior leverages the microtask queue, which can be accessed
  // via either native Promise.then or MutationObserver.
  // MutationObserver has wider support, however it is seriously bugged in
  // UIWebView in iOS >= 9.3.3 when triggered in touch event handlers. It
  // completely stops working after triggering a few times... so, if native
  // Promise is available, we will use it:
  /* istanbul ignore if */
  if (typeof Promise !== 'undefined' && isNative(Promise)) {
    var p = Promise.resolve()
    var noop = function () {}
    timerFunc = () => {
      p.then(nextTickHandler)
      // in problematic UIWebViews, Promise.then doesn't completely break, but
      // it can get stuck in a weird state where callbacks are pushed into the
      // microtask queue but the queue isn't being flushed, until the browser
      // needs to do some other work, e.g. handle a timer. Therefore we can
      // "force" the microtask queue to be flushed by adding an empty timer.
      if (isIOS) setTimeout(noop)
    }
  } else if (typeof MutationObserver !== 'undefined') {
    // use MutationObserver where native Promise is not available,
    // e.g. IE11, iOS7, Android 4.4
    var counter = 1
    var observer = new MutationObserver(nextTickHandler)
    var textNode = document.createTextNode(String(counter))
    observer.observe(textNode, {
      characterData: true
    })
    timerFunc = () => {
      counter = (counter + 1) % 2
      textNode.data = String(counter)
    }
  } else {
    // fallback to setTimeout
    /* istanbul ignore next */
    timerFunc = setTimeout
  }

>>>>>>> 0fb031e1fcec6e23b724b00c1061b1c1a1c5f583
  return function (cb, ctx) {
    var func = ctx
      ? function () { cb.call(ctx) }
      : cb
    callbacks.push(func)
    if (pending) return
    pending = true
    timerFunc(nextTickHandler, 0)
  }
})()

let _Set
/* istanbul ignore if */
<<<<<<< HEAD
if (typeof Set !== 'undefined' && Set.toString().match(/native code/)) {
=======
if (typeof Set !== 'undefined' && isNative(Set)) {
>>>>>>> 0fb031e1fcec6e23b724b00c1061b1c1a1c5f583
  // use native Set when available.
  _Set = Set
} else {
  // a non-standard Set polyfill that only works with primitive keys.
  _Set = function () {
    this.set = Object.create(null)
  }
  _Set.prototype.has = function (key) {
    return this.set[key] !== undefined
  }
  _Set.prototype.add = function (key) {
    this.set[key] = 1
  }
  _Set.prototype.clear = function () {
    this.set = Object.create(null)
  }
}

export { _Set }
