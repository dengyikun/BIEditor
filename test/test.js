/**
 * Created by dyk on 2017/1/14.
 */
import React from 'react'
import { shallow, render, mount } from 'enzyme'
import App from '../src/components/App.jsx'
import { expect } from 'chai'

describe('加法的测试', function () {
    it('1 加 1 应该等于 2', function () {
        expect(1 + 1).to.be.equal(2)
    })
})

describe('组件 App 的测试（shallow）', function () {
    it('App 的 div 个数应为 0', function () {
        let app = shallow(<App/>)
        expect(app.find('div').length).to.equal(0)
    })
})

describe('组件 App 的测试（render）', function () {
    it('App 的 div 个数应为 0', function () {
        let app = render(<App/>)
        expect(app.find('div').length).to.equal(0)
    })
})

describe('组件 App 的测试（mount）', function () {
    it('App 的 div 个数应为 0', function () {
        let app = mount(<App/>)
        expect(app.find('div').length).to.equal(0)
    })
})