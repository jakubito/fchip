import { useState } from 'preact/hooks'
import { useClient } from '../clientContext'
import { games, Status } from '../enums'

function Controls() {
  const client = useClient()
  const [status, setStatus] = useState(client.status)

  async function onGameInput(event: JSX.TargetedEvent<HTMLSelectElement>) {
    const { value } = event.currentTarget
    event.currentTarget.blur()
    const response = await fetch(value)
    const buffer = await response.arrayBuffer()

    client.load(buffer)
    setStatus(client.status)
  }

  async function onFileInput(event: JSX.TargetedEvent<HTMLInputElement>) {
    const { files } = event.currentTarget
    if (!files?.length) return
    event.currentTarget.blur()
    const buffer = await files[0].arrayBuffer()

    client.load(buffer)
    setStatus(client.status)
  }

  function start() {
    client.start()
    setStatus(client.status)
  }

  function stop() {
    client.stop()
    setStatus(client.status)
  }

  function reset() {
    client.reset()
    setStatus(client.status)
  }

  return (
    <div class="card shadow-sm">
      <div class="card-body">
        <div class="d-flex gap-3 flex-wrap">
          <div>
            <label for="game" class="form-label">
              Games library
            </label>
            <select id="game" class="form-select form-select-sm" onInput={onGameInput}>
              <option selected disabled>
                Choose game
              </option>
              {games.map((game) => (
                <option value={game.file} key={game.name}>
                  {game.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label for="file" class="form-label">
              Load custom ROM
            </label>
            <input
              id="file"
              type="file"
              class="form-control form-control-sm"
              onInput={onFileInput}
            />
          </div>
          <div class="d-flex gap-3 align-self-end">
            <button
              type="button"
              id="load"
              class="btn btn-sm btn-success"
              disabled={[Status.Ready, Status.Running].includes(status)}
              onClick={start}
            >
              <i class="bi bi-play-fill" /> Start
            </button>
            <button
              type="button"
              id="load"
              class="btn btn-sm btn-secondary"
              disabled={[Status.Ready, Status.Stopped].includes(status)}
              onClick={stop}
            >
              <i class="bi bi-pause-fill" /> Pause
            </button>
            <button
              type="button"
              id="load"
              class="btn btn-sm btn-danger"
              disabled={status === Status.Ready}
              onClick={reset}
            >
              <i class="bi bi-arrow-counterclockwise" /> Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Controls
