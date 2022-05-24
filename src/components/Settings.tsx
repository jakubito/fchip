import { useState } from 'preact/hooks'
import { useClient } from '../clientContext'
import { colorSchemes } from '../enums'

function Settings() {
  const client = useClient()
  const [scale, setScale] = useState(String(client.screenScale))
  const [volume, setVolume] = useState(String(client.volume))
  const [cycles, setCycles] = useState(String(client.cyclesPerSecond))

  function onSchemeInput(event: JSX.TargetedEvent<HTMLSelectElement>) {
    const { value } = event.currentTarget
    event.currentTarget.blur()
    client.colors = colorSchemes[Number(value)].colors
  }

  function onScaleInput(event: JSX.TargetedEvent<HTMLInputElement>) {
    const { value } = event.currentTarget
    client.screenScale = Number(value)
    setScale(value)
  }

  function onVolumeInput(event: JSX.TargetedEvent<HTMLInputElement>) {
    const { value } = event.currentTarget
    client.volume = Number(value)
    setVolume(value)
  }

  function onCyclesInput(event: JSX.TargetedEvent<HTMLInputElement>) {
    const { value } = event.currentTarget
    client.cyclesPerSecond = Number(value)
    setCycles(value)
  }

  return (
    <div class="card shadow-sm">
      <div class="card-body">
        <div class="d-flex gap-3 flex-wrap">
          <div>
            <label for="scheme" class="form-label">
              Color scheme
            </label>
            <select id="scheme" class="form-select form-select-sm" onInput={onSchemeInput}>
              {Object.entries(colorSchemes).map(([id, scheme]) => (
                <option value={id} key={id}>
                  {scheme.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label for="scale" class="form-label">
              Screen scale: {scale}x
            </label>
            <input
              id="scale"
              type="range"
              class="form-range"
              min="1"
              max="30"
              step="1"
              value={scale}
              onInput={onScaleInput}
            />
          </div>
          <div>
            <label for="volume" class="form-label">
              Volume: {volume}%
            </label>
            <input
              id="volume"
              type="range"
              class="form-range"
              min="0"
              max="100"
              step="1"
              value={volume}
              onInput={onVolumeInput}
            />
          </div>
          <div>
            <label for="cycles" class="form-label">
              Speed: {cycles} cycles/s
            </label>
            <input
              id="cycles"
              type="range"
              class="form-range"
              min="200"
              max="2000"
              step="50"
              value={cycles}
              onInput={onCyclesInput}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
