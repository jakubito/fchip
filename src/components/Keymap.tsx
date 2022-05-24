import keymapImage from '../assets/keymap.svg'

function KeysLayout() {
  return (
    <div class="d-flex justify-content-center align-items-center mb-5">
      <div class="d-flex align-items-center flex-column gap-4">
        <div>Keyboard mapping (original layout on the left)</div>
        <img src={keymapImage} style={{ maxHeight: 140 }} />
      </div>
    </div>
  )
}

export default KeysLayout
