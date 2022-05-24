import { useEffect, useRef } from 'preact/hooks'
import { useClient } from '../clientContext'

function Display() {
  const client = useClient()
  const display = useRef<HTMLDivElement>(null)

  useEffect(() => {
    client.appendCanvasTo(display.current!)
  }, [])

  return <div id="display" class="d-flex justify-content-center align-items-center" ref={display} />
}

export default Display
