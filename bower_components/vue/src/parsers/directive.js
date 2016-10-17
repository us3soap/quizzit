import { toNumber, stripQuotes } from '../util/index'
import Cache from '../cache'

const cache = new Cache(1000)
<<<<<<< HEAD
const filterTokenRE = /[^\s'"]+|'[^']*'|"[^"]*"/g
=======
>>>>>>> 0fb031e1fcec6e23b724b00c1061b1c1a1c5f583
const reservedArgRE = /^in$|^-?\d+/

/**
 * Parser state
 */

<<<<<<< HEAD
var str, dir
var c, prev, i, l, lastFilterIndex
var inSingle, inDouble, curly, square, paren

/**
 * Push a filter to the current directive object
 */

function pushFilter () {
  var exp = str.slice(lastFilterIndex, i).trim()
  var filter
  if (exp) {
    filter = {}
    var tokens = exp.match(filterTokenRE)
    filter.name = tokens[0]
    if (tokens.length > 1) {
      filter.args = tokens.slice(1).map(processFilterArg)
    }
  }
  if (filter) {
    (dir.filters = dir.filters || []).push(filter)
  }
  lastFilterIndex = i + 1
=======
var str, dir, len
var index
var chr
var state
var startState = 0
var filterState = 1
var filterNameState = 2
var filterArgState = 3

var doubleChr = 0x22
var singleChr = 0x27
var pipeChr = 0x7C
var escapeChr = 0x5C
var spaceChr = 0x20

var expStartChr = { 0x5B: 1, 0x7B: 1, 0x28: 1 }
var expChrPair = { 0x5B: 0x5D, 0x7B: 0x7D, 0x28: 0x29 }

function peek () {
  return str.charCodeAt(index + 1)
}

function next () {
  return str.charCodeAt(++index)
}

function eof () {
  return index >= len
}

function eatSpace () {
  while (peek() === spaceChr) {
    next()
  }
}

function isStringStart (chr) {
  return chr === doubleChr || chr === singleChr
}

function isExpStart (chr) {
  return expStartChr[chr]
}

function isExpEnd (start, chr) {
  return expChrPair[start] === chr
}

function parseString () {
  var stringQuote = next()
  var chr
  while (!eof()) {
    chr = next()
    // escape char
    if (chr === escapeChr) {
      next()
    } else if (chr === stringQuote) {
      break
    }
  }
}

function parseSpecialExp (chr) {
  var inExp = 0
  var startChr = chr

  while (!eof()) {
    chr = peek()
    if (isStringStart(chr)) {
      parseString()
      continue
    }

    if (startChr === chr) {
      inExp++
    }
    if (isExpEnd(startChr, chr)) {
      inExp--
    }

    next()

    if (inExp === 0) {
      break
    }
  }
}

/**
 * syntax:
 * expression | filterName  [arg  arg [| filterName arg arg]]
 */

function parseExpression () {
  var start = index
  while (!eof()) {
    chr = peek()
    if (isStringStart(chr)) {
      parseString()
    } else if (isExpStart(chr)) {
      parseSpecialExp(chr)
    } else if (chr === pipeChr) {
      next()
      chr = peek()
      if (chr === pipeChr) {
        next()
      } else {
        if (state === startState || state === filterArgState) {
          state = filterState
        }
        break
      }
    } else if (chr === spaceChr && (state === filterNameState || state === filterArgState)) {
      eatSpace()
      break
    } else {
      if (state === filterState) {
        state = filterNameState
      }
      next()
    }
  }

  return str.slice(start + 1, index) || null
}

function parseFilterList () {
  var filters = []
  while (!eof()) {
    filters.push(parseFilter())
  }
  return filters
}

function parseFilter () {
  var filter = {}
  var args

  state = filterState
  filter.name = parseExpression().trim()

  state = filterArgState
  args = parseFilterArguments()

  if (args.length) {
    filter.args = args
  }
  return filter
}

function parseFilterArguments () {
  var args = []
  while (!eof() && state !== filterState) {
    var arg = parseExpression()
    if (!arg) {
      break
    }
    args.push(processFilterArg(arg))
  }

  return args
>>>>>>> 0fb031e1fcec6e23b724b00c1061b1c1a1c5f583
}

/**
 * Check if an argument is dynamic and strip quotes.
 *
 * @param {String} arg
 * @return {Object}
 */

function processFilterArg (arg) {
  if (reservedArgRE.test(arg)) {
    return {
      value: toNumber(arg),
      dynamic: false
    }
  } else {
    var stripped = stripQuotes(arg)
    var dynamic = stripped === arg
    return {
      value: dynamic ? arg : stripped,
      dynamic: dynamic
    }
  }
}

/**
 * Parse a directive value and extract the expression
 * and its filters into a descriptor.
 *
 * Example:
 *
 * "a + 1 | uppercase" will yield:
 * {
 *   expression: 'a + 1',
 *   filters: [
 *     { name: 'uppercase', args: null }
 *   ]
 * }
 *
 * @param {String} s
 * @return {Object}
 */

export function parseDirective (s) {
  var hit = cache.get(s)
  if (hit) {
    return hit
  }

  // reset parser state
  str = s
<<<<<<< HEAD
  inSingle = inDouble = false
  curly = square = paren = 0
  lastFilterIndex = 0
  dir = {}

  for (i = 0, l = str.length; i < l; i++) {
    prev = c
    c = str.charCodeAt(i)
    if (inSingle) {
      // check single quote
      if (c === 0x27 && prev !== 0x5C) inSingle = !inSingle
    } else if (inDouble) {
      // check double quote
      if (c === 0x22 && prev !== 0x5C) inDouble = !inDouble
    } else if (
      c === 0x7C && // pipe
      str.charCodeAt(i + 1) !== 0x7C &&
      str.charCodeAt(i - 1) !== 0x7C
    ) {
      if (dir.expression == null) {
        // first filter, end of expression
        lastFilterIndex = i + 1
        dir.expression = str.slice(0, i).trim()
      } else {
        // already has filter
        pushFilter()
      }
    } else {
      switch (c) {
        case 0x22: inDouble = true; break // "
        case 0x27: inSingle = true; break // '
        case 0x28: paren++; break         // (
        case 0x29: paren--; break         // )
        case 0x5B: square++; break        // [
        case 0x5D: square--; break        // ]
        case 0x7B: curly++; break         // {
        case 0x7D: curly--; break         // }
      }
    }
  }

  if (dir.expression == null) {
    dir.expression = str.slice(0, i).trim()
  } else if (lastFilterIndex !== 0) {
    pushFilter()
=======
  dir = {}
  len = str.length
  index = -1
  chr = ''
  state = startState

  var filters

  if (str.indexOf('|') < 0) {
    dir.expression = str.trim()
  } else {
    dir.expression = parseExpression().trim()
    filters = parseFilterList()
    if (filters.length) {
      dir.filters = filters
    }
>>>>>>> 0fb031e1fcec6e23b724b00c1061b1c1a1c5f583
  }

  cache.put(s, dir)
  return dir
}
