export function call<T extends any[]>(func: Function, ...args: T): void {
  return func(...args)
}
