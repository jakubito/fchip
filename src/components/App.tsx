import Header from './Header'
import Controls from './Controls'
import Settings from './Settings'
import Display from './Display'
import KeysLayout from './Keymap'

function App() {
  return (
    <div class="container-fluid">
      <div class="row">
        <Header />
      </div>
      <div class="row row-cols-auto g-2">
        <div class="col">
          <Controls />
        </div>
        <div class="col">
          <Settings />
        </div>
      </div>
      <div class="row">
        <Display />
      </div>
      <div class="row">
        <KeysLayout />
      </div>
    </div>
  )
}

export default App
