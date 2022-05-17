export function setPreciseInterval(handler: Function, timeout: number, ...args: any[]) {
  const id = { value: 0 }
  let next = performance.now()

  function tick() {
    return setTimeout(() => {
      next += timeout
      handler(...args)
      id.value = tick()
    }, timeout - (performance.now() - next))
  }

  function clearInterval() {
    clearTimeout(id.value)
  }

  id.value = tick()

  return clearInterval
}
