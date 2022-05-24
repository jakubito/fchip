import { __AdaptedExports } from '../core/build/core'

export type CoreModule = typeof __AdaptedExports
export type CoreInstance = ReturnType<typeof __AdaptedExports.createInstance>
export type Color = [number, number, number]

export interface Game {
  name: string
  file: string
}

export interface ColorScheme {
  name: string
  colors: [Color, Color]
}
