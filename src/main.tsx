import { render } from 'preact'
import moduleUrl from '../core/build/core.wasm?url'
import { instantiate } from '../core/build/core'
import Client from './client'
import { ClientContext } from './clientContext'
import App from './components/App'
import './style.css'

const compiledModule = await WebAssembly.compileStreaming(fetch(moduleUrl))
const module = await instantiate(compiledModule, { env: {} })
const client = new Client(module)

render(
  <ClientContext.Provider value={client}>
    <App />
  </ClientContext.Provider>,
  document.querySelector('#root')!
)
