import { useEffect, useRef, useState } from 'preact/hooks'
import { useClient } from '../clientContext'

function Display() {
  const client = useClient()
  const display = useRef<HTMLDivElement>(null)
  const [fullscreen, setFullscreen] = useState(false)

  useEffect(() => {
    const onFullscreenChange = () => {
      setFullscreen(document.fullscreenElement === display.current)
    }

    client.appendCanvasTo(display.current!)
    document.addEventListener('fullscreenchange', onFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange)
    }
  }, [])

  return (
    <div class="d-flex flex-column align-items-center mb-4">
      <div
        id="display"
        class={`d-flex justify-content-center align-items-center ${fullscreen ? 'fullscreen' : ''}`}
        ref={display}
      />
      <button
        type="button"
        class="btn btn-light"
        onClick={() => display.current?.requestFullscreen({ navigationUI: 'hide' })}
      >
        <i class="bi bi-fullscreen" /> Full screen
      </button>
    </div>
  )
}

export default Display
