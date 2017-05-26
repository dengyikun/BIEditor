/**
 * Created by dyk on 2017/1/14.
 */
import React, {Component, PropTypes} from 'react'
import {Spin} from 'antd'
import ReactGridLayout, {WidthProvider} from 'react-grid-layout'
import ReactScrollbar from 'react-custom-scrollbars'
import {Echart, Image, Text} from './layouterItems';
import config from '../config';

const GridLayout = WidthProvider(ReactGridLayout)

class Player extends Component {
    static propTypes = {}

    constructor(props) {
        super(props)
        this.state = {
            loading: true,
            content: {
                layout: [],
                item: []
            }
        }
    }//初始化 state

    componentWillMount() {
        this.getPanel()
    }//插入 DOM 前

    getPanel = (callback) => {
        fetch(`${config.mgmtApiHost}/panel/chart/${config.request.token}/${config.request.id}`, {
            method: "GET",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (response.status >= 400) {
                    throw new Error("Bad response from server")
                }
                return response.json()
            })
            .then(data => {
                if (data.code === 200 && data.data) {
                    data.data.content = data.data.content ? JSON.parse(data.data.content) : {
                            layout: [],
                            items: []
                        }
                    data.data.background = data.data.background ? JSON.parse(data.data.background) : {}
                    this.setState({...data.data})
                    this.setState({loading: false})
                }
            })
    }

    getItems = () => {
        let items = []
        this.state.content.layout.map((layoutItem) => {
            const contentItem = this.state.content.items.find((item) => item.id === layoutItem.i)
            let content = ''
            const props = {
                key: contentItem.id,
                item: contentItem,
                onChange: this.onItemChange,
                onRemove: this.removeItem
            }
            switch (contentItem.type) {
                case 'chart':
                    content = (
                        <Echart {...props} theme={this.state.theme}/>
                    )
                    break
                case 'text':
                    content = (
                        <Text {...props}/>
                    )
                    break
                case 'image':
                    content = (
                        <Image {...props}/>
                    )
                    break
            }
            items.push(
                <div key={layoutItem.i} data-grid={{...layoutItem, static: true}}>
                    {content}
                </div>
            )
        })
        return items
    }

    render() {
        return (
            <Spin spinning={this.state.loading}>
                <ReactScrollbar className="layout-panel-scrollbar" style={{background: this.state.background ? this.state.background.color : ''}}>
                    <GridLayout cols={50} rowHeight={20} margin={[8, 8]}
                                verticalCompact={false} preventCollision={false}>
                        {this.getItems()}
                    </GridLayout>
                </ReactScrollbar>
            </Spin>
        )
    }
}

export default Player