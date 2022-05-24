function Header() {
  return (
    <div class="d-flex align-items-center flex-wrap gap-2 gap-sm-4 my-2">
      <h1 class="mb-0">FCHIP</h1>
      <div>
        a CHIP-8 interpreter by{' '}
        <a href="https://github.com/jakubito" target="_blank" rel="noopener noreferrer">
          Jakub Dobes
        </a>
      </div>
      <a
        href="https://github.com/jakubito/fchip"
        target="_blank"
        rel="noopener noreferrer"
        class="d-flex gap-1"
      >
        <i class="bi bi-github" /> GitHub
      </a>
    </div>
  )
}

export default Header
