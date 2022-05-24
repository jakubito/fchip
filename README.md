# FCHIP

FCHIP is a [CHIP-8](https://en.wikipedia.org/wiki/CHIP-8) interpreter (aka emulator) written in [AssemblyScript](https://www.assemblyscript.org). It comes with a web client optimized for speed and accuracy.

**<https://fchip.netlify.app>**

[![Netlify Status](https://api.netlify.com/api/v1/badges/9116e281-20c3-4c20-a13b-5b8c9b18ac82/deploy-status)](https://app.netlify.com/sites/fchip/deploys)

![screenshot.png](https://raw.githubusercontent.com/jakubito/fchip/master/screenshot.png)

## Features

- Accurate cycle speed, independent of the screen framerate
- Real-time adjustments of speed, screen size, volume and colors

## What is CHIP-8?

[From Wikipedia:](https://en.wikipedia.org/wiki/CHIP-8)

> CHIP-8 is an interpreted programming language, developed by Joseph Weisbecker. It was initially used on the COSMAC VIP and Telmac 1800 8-bit microcomputers in the mid-1970s. CHIP-8 programs are run on a CHIP-8 virtual machine. It was made to allow video games to be more easily programmed for these computers, but CHIP 8 is still used today, due to its simplicity, and consequently on any platform and its teaching of programming Binary numbers.

## Why?

I've been interested in emulators for as long as I can remember, and I always wanted to create my own one. Writing a CHIP-8 interpreter is considered to be a great introduction into emulators development, because of its simplicity and a lot of resources available.

## Implementation overview

My main goal has been to write the most efficient and accurate interpreter running in a browser. This is achieved by running the interpreter core in WebAssembly, with a thin javascript layer handling input and output. They both share a memory buffer storing all the interpreter data. User interface is powered by a small Preact app.

### Animation frame

Many existing browser-based interpreters execute a fixed number of cycles per animation frame. This makes their emulation speed being dependent on the current framerate. In FCHIP, a time difference is calculated between the current and previous frames. Based on the cycles per second setting, a specific number of cycles is then executed to maintain the target speed, regardless of the screen framerate.

At the end of each animation frame callback, the screen buffer is painted directly onto canvas in its original resolution. It is then scaled up to the full size of canvas, with `imageSmoothingEnabled` turned off to avoid blurry pixels.

### Timers

For the delay and sound timers running at 60 Hz, a self-correcting recursive `setTimeout` implementation is being used instead of using `setInterval`. This is to achieve the most precise intervals possible.

## Planned features

- Improve roms compatibility
- Add support for various CHIP-8 extensions (SCHIP, GCHIP, XO-CHIP...)
- Customizable controls

## Useful resources

- [CHIP-8 Research Facility](https://chip-8.github.io)
- [High-level guide to making a CHIP-8 emulator](https://tobiasvl.github.io/blog/write-a-chip-8-emulator)

## Credits

Included games were downloaded from [David Winter's CHIP-8 emulation page](https://www.pong-story.com/chip8/)

## Bug reporting

If you find a bug, please send me an e-mail to dobes.jakub@gmail.com or open an issue here on github.

## License

ISC
