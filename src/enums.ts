import { ColorScheme, Game } from './types'

export enum Status {
  Ready,
  Stopped,
  Running,
}

export enum Keymap {
  Digit1 = 0x1,
  Digit2 = 0x2,
  Digit3 = 0x3,
  Digit4 = 0xc,
  KeyQ = 0x4,
  KeyW = 0x5,
  KeyE = 0x6,
  KeyR = 0xd,
  KeyA = 0x7,
  KeyS = 0x8,
  KeyD = 0x9,
  KeyF = 0xe,
  KeyZ = 0xa,
  KeyX = 0x0,
  KeyC = 0xb,
  KeyV = 0xf,
}

export const games: Game[] = [
  { name: '15PUZZLE', file: '/roms/15PUZZLE' },
  { name: 'BLINKY', file: '/roms/BLINKY' },
  { name: 'BLITZ', file: '/roms/BLITZ' },
  { name: 'BREAKOUT', file: '/roms/BREAKOUT' },
  { name: 'BRIX', file: '/roms/BRIX' },
  { name: 'CONNECT4', file: '/roms/CONNECT4' },
  { name: 'GUESS', file: '/roms/GUESS' },
  { name: 'HIDDEN', file: '/roms/HIDDEN' },
  { name: 'INVADERS', file: '/roms/INVADERS' },
  { name: 'KALEID', file: '/roms/KALEID' },
  { name: 'MAZE', file: '/roms/MAZE' },
  { name: 'MERLIN', file: '/roms/MERLIN' },
  { name: 'MISSILE', file: '/roms/MISSILE' },
  { name: 'PONG', file: '/roms/PONG' },
  { name: 'PONG2', file: '/roms/PONG2' },
  { name: 'PUZZLE', file: '/roms/PUZZLE' },
  { name: 'SQUASH', file: '/roms/SQUASH' },
  { name: 'SYZYGY', file: '/roms/SYZYGY' },
  { name: 'TANK', file: '/roms/TANK' },
  { name: 'TETRIS', file: '/roms/TETRIS' },
  { name: 'TICTAC', file: '/roms/TICTAC' },
  { name: 'UFO', file: '/roms/UFO' },
  { name: 'VBRIX', file: '/roms/VBRIX' },
  { name: 'VERS', file: '/roms/VERS' },
  { name: 'WALL', file: '/roms/WALL' },
  { name: 'WIPEOFF', file: '/roms/WIPEOFF' },
]

export const colorSchemes: Record<number, ColorScheme> = {
  1: {
    name: 'White on black',
    colors: [
      [32, 32, 32],
      [249, 249, 249],
    ],
  },
  2: {
    name: 'Black on white',
    colors: [
      [249, 249, 249],
      [32, 32, 32],
    ],
  },
  3: {
    name: 'LCD',
    colors: [
      [168, 192, 176],
      [20, 20, 20],
    ],
  },
  4: {
    name: 'HP-48G',
    colors: [
      [87, 120, 88],
      [0, 37, 108],
    ],
  },
}
