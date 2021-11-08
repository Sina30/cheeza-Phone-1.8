import { NuiProvider } from 'fivem-nui-react-lib'
import React from 'react'
import ReactDOM from 'react-dom'
import { HashRouter } from 'react-router-dom'
import App from './App'

ReactDOM.render(
<HashRouter>
    <NuiProvider resource='phone' timeout={false}>
            <App />
    </NuiProvider>
</HashRouter>,
document.getElementById('root'))