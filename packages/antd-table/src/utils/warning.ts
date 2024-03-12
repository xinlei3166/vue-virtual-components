import pkg from '../../package.json'

let warned = {}

export function _warning(valid, message) {
  if (
    process.env.NODE_ENV !== 'production' &&
    !valid &&
    console !== undefined
  ) {
    console.error(`Warning: ${message}`)
  }
}

export function _note(valid, message) {
  if (
    process.env.NODE_ENV !== 'production' &&
    !valid &&
    console !== undefined
  ) {
    console.warn(`Note: ${message}`)
  }
}

function call(method, valid, message) {
  if (!valid && !warned[message]) {
    method(false, message)
    warned[message] = true
  }
}

export function warningOnce(valid, message) {
  call(_warning, valid, message)
}

export function noteOnce(valid, message) {
  call(_note, valid, message)
}

export function resetWarned() {
  warned = {}
}

export function warning(valid, component, message = '') {
  warningOnce(valid, `[${pkg.name}: ${component}] ${message}`)
}
