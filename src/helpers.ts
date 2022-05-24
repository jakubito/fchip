export function setPreciseInterval(handler: Function, timeout: number, ...args: any[]) {
  const id = { value: 0 }
  let next = performance.now()

  const tick = () => {
    return setTimeout(() => {
      next += timeout
      handler(...args)
      id.value = tick()
    }, timeout - (performance.now() - next))
  }

  id.value = tick()

  return () => clearTimeout(id.value)
}
