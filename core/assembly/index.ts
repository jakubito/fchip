import Chip8 from './chip8'

export function createInstance(): Chip8 {
  return new Chip8()
}

export function runCycle(instance: Chip8): void {
  instance.runCycle()
}

export function reset(instance: Chip8): void {
  instance.reset()
}

export function getMemoryPointer(instance: Chip8): usize {
  return changetype<usize>(instance.memory.buffer) + instance.memory.byteOffset
}

export function getScreenPointer(instance: Chip8): usize {
  return changetype<usize>(instance.screen.buffer) + instance.screen.byteOffset
}

export function getKeysPointer(instance: Chip8): usize {
  return changetype<usize>(instance.keys.buffer) + instance.keys.byteOffset
}

export function getTimersPointer(instance: Chip8): usize {
  return changetype<usize>(instance.timers.buffer) + instance.timers.byteOffset
}
