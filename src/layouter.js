import React from 'react'
import ReactDOM from 'react-dom'
import {createStore, applyMiddleware} from 'redux'
import layouter from './reducers/layouter'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import Layouter from './components/Layouter.jsx'
import './anssets/styles/layouter.scss'

const store = createStore(
    layouter,
    applyMiddleware(thunk)
)

ReactDOM.render(
    <Provider store={store}>
        <Layouter/>
    </Provider>
    , document.getElementById('layouter'))