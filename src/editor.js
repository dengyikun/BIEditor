import React from 'react'
import ReactDOM from 'react-dom'
import {createStore, applyMiddleware} from 'redux'
import editor from './reducers/editor'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import Editor from './components/Editor.jsx'
import './anssets/styles/editor.scss'

const store = createStore(
    editor,
    applyMiddleware(thunk)
)

ReactDOM.render(
    <Provider store={store}>
        <Editor/>
    </Provider>
    , document.getElementById('editor'))