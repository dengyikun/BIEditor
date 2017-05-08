/**
 * Created by dyk on 2017/1/14.
 */
import React, {Component, PropTypes} from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import {Input, Button, Icon, Modal, Spin, Row, Col, message, Popover} from 'antd'
import ReactGridLayout, {WidthProvider} from 'react-grid-layout'
import ReactScrollbar from 'react-custom-scrollbars'
import {ChromePicker} from 'react-color';
import layouterAction from '../actions/layouterAction';
import {Echart, Image, Text} from './layouterItems';
import Gallery from './Gallery.jsx'
import LayouterFilter from './LayouterFilter.jsx'
import config from  '../config'
import more from '../anssets/images/more.png'

const GridLayout = WidthProvider(ReactGridLayout)
const Search = Input.Search

const mapStateToProps = (state) => ({
    panelId: state.panelId,
    theme: state.theme,
    background: state.background,
    content: state.content,
    projectId: state.projectId,
    panelName: state.panelName,
    publicUrl: state.publicUrl,
    privateUrl: state.privateUrl
})

const mapDispatchToProps = (dispatch) => (bindActionCreators(layouterAction, dispatch))

class LayouterUI extends Component {
    static propTypes = {
        panelId: PropTypes.string,
        theme: PropTypes.string,
        background: PropTypes.object,
        content: PropTypes.object,
        projectId: PropTypes.string,
        panelName: PropTypes.string,
        publicUrl: PropTypes.string,
        privateUrl: PropTypes.string,
        getPanel: PropTypes.func,
        getCharts: PropTypes.func
    }

    constructor(props) {
        super(props)
        this.state = {
            loading: true,
            maxHeight: 0,
            projectId: '',
            charts: [],
            isGalleryShow: false,
            isDragging: false,
            isChartLoading: false,
            isShareShow: false,
            isLayouterFilterShow: false,
        }
    }//初始化 state

    componentWillMount() {
        this.init()
    }//插入 DOM 前

    componentWillReceiveProps(nextProps) {
        // console.log(nextProps)
    }//接收新 prop

    init = () => {
        this.setState({loading: true})
        this.props.getPanel(config.request.id, (projectId) => {
            this.props.getCharts(projectId, '', (charts) => {
                this.setState({loading: false, charts, projectId})
            })
        })
    }

    getItems = () => {
        let items = []
        if (!this.state.loading) {
            this.props.content.layout.map((layoutItem) => {
                const contentItem = this.props.content.items.find((item) => item.id === layoutItem.i)
                let content = ''
                const props = {
                    key: contentItem.id,
                    item: contentItem,
                    edit: true,
                    onChange: this.onItemChange,
                    onRemove: this.removeItem
                }
                switch (contentItem.type) {
                    case 'chart':
                        content = (
                            <Echart {...props} theme={this.props.theme}/>
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
                    <div key={layoutItem.i} data-grid={layoutItem}>
                        {content}
                    </div>
                )
            })
        }
        return items
    }

    addItem = (type, data) => {
        let newLayout = this.props.content.layout.slice();
        let newItems = this.props.content.items.slice();
        const id = 'item' + new Date().getTime();
        newLayout.push({
            i: id,
            x: 0,
            y: this.state.maxHeight, // puts it at the bottom
            w: 20,
            h: 10,
            minW: 10,
            minH: 10
        })
        newItems.push({
            id: id,
            type: type,
            data: data
        })
        this.props.setContent({layout: newLayout, items: newItems})
    }

    addTextItem = () => {
        this.addItem('text', {html: '<p>编辑内容</p>'})
    }

    addImageItem = (images) => {
        this.setState({isGalleryShow: false})
        images.map((image, index) =>
            setTimeout(() => this.addItem('image', {src: image}), 100 * (index)))
    }

    addChartItem = (chart) => {
        debugger
        const findIndex = this.props.content.items.findIndex((item) => item.data.chartId === chart.chartId)
        if (findIndex === -1) {
            this.addItem('chart', {panelId: this.props.panelId, chartId: chart.chartId})
        } else {
            message.error('已经添加过该图表！')
        }
    }

    removeItem = (i) => {
        let newLayout = this.props.content.layout.slice();
        let newItems = this.props.content.items.slice();
        let index
        index = newLayout.findIndex((item) => item.i === i)
        if (index !== -1) {
            newLayout.splice(index, 1)
        }
        index = newItems.findIndex((item) => item.id === i)
        if (index !== -1) {
            newItems.splice(index, 1)
        }
        this.props.setContent({layout: newLayout, items: newItems})
    }

    onItemChange = (newItem) => {
        let newItems = this.props.content.items.slice();
        newItems = newItems.map((item) => {
            if (item.id === newItem.id) {
                return newItem
            } else {
                return item
            }
        })
        this.props.setContent({layout: this.props.content.layout, items: newItems})
    }

    showFilter = () => {
        Modal.confirm({
            title: '保存面板并设置全局过滤？',
            onOk: () => {
                this.props.savePanel(() => {
                    message.success('保存成功！')
                    this.setState({isLayouterFilterShow: true})
                })
            }
        })
    }

    savePanel = () => {
        this.props.savePanel(() => {
            message.success('保存成功！')
        })
    }

    sharePanel = () => this.setState({isShareShow: true})

    getShareUrl = () => window.location.origin + '/player.html?id=' + this.props.panelId

    refreshPanel = () => {
        Modal.confirm({
            title: '刷新面板',
            content: '确认放弃未保存得内容并刷新整个面板吗？',
            okText: '确认',
            cancelText: '取消',
            onOk: this.init
        })
    }

    setMaxHeight = (layout) => {
        let maxHeight = 0
        layout.map((item) => {
            const newHeight = item.y + item.h
            if (newHeight > maxHeight) {
                maxHeight = newHeight
            }
        })
        this.setState({maxHeight: maxHeight})
        this.props.setContent({layout: layout, items: this.props.content.items})
    }

    searchCharts = (value) => {
        this.setState({isChartLoading: true})
        this.props.getCharts(this.state.projectId, value, (charts) => {
            this.setState({isChartLoading: false, charts})
        })
    }

    render() {
        return (
            <Spin spinning={this.state.loading}>
                <div className='wrapper'>
                    <header>
                        <div className="logo"/>
                    </header>
                    <aside className="left-aside">
                        <div className="control-panel">
                            <div className="control-panel-title">
                                面板控件
                            </div>
                            <Button className="control-panel-text"
                                    icon="code-o" size="small"
                                    onClick={this.addTextItem}>文字</Button>
                            <Button className="control-panel-image"
                                    icon="picture" size="small"
                                    onClick={() => {
                                        this.setState({isGalleryShow: true})
                                    }}>图片</Button>
                            <Gallery visible={this.state.isGalleryShow} onOk={this.addImageItem}
                                     onCancel={() => {
                                         this.setState({isGalleryShow: false})
                                     }}
                                     projectId={this.props.projectId}/>

                            <Search placeholder="请输入图表名称" size="large"
                                    onSearch={value => this.searchCharts(value)}/>
                        </div>
                        <div className="chart-panel">
                            <ReactScrollbar>
                                <Spin spinning={this.state.isChartLoading} style={{minHeight: 38}}>
                                    <ul>
                                        {
                                            this.state.charts.map((chart) => {
                                                let icon = "appstore"
                                                switch (chart.type) {
                                                    case "table":
                                                        icon = "appstore"
                                                        break
                                                    case "line-stack":
                                                        icon = "line-chart"
                                                        break
                                                    case "area-stack":
                                                        icon = "line-chart"
                                                        break
                                                    case "bar-tick-align":
                                                        icon = "bar-chart"
                                                        break
                                                    case "bar-y-category":
                                                        icon = "bar-chart"
                                                        break
                                                    case "pie-simple":
                                                        icon = "pie-chart"
                                                        break
                                                    case "pie-doughnut":
                                                        icon = "pie-chart"
                                                        break
                                                    case "map-china-dataRange":
                                                        icon = "environment"
                                                        break
                                                    default:
                                                        break
                                                }
                                                return (
                                                    <li key={chart.chartId}
                                                        onClick={() => this.addChartItem(chart)}>
                                                        <p><Icon type={icon}/>{chart.title}</p>
                                                    </li>
                                                )
                                            })
                                        }
                                    </ul>
                                </Spin>
                            </ReactScrollbar>
                        </div>
                    </aside>
                    <div className="content-wrapper">
                        <Row className="title-panel">
                            <Col span={6}>
                                <h2>{this.props.panelName}</h2>
                            </Col>
                            <Col span={18} className="title-panel-btns">
                                <SetCard onBgChange={(color) => this.props.setBackground({color})}
                                         onStyleChange={(theme) => this.props.setTheme(theme)}
                                         BackgroundColor={this.props.background.color}
                                />
                                <Icon type="filter" onClick={this.showFilter}/>
                                <a className="title-panel-btn" onClick={this.savePanel}>保存</a>
                                <a className="title-panel-btn" onClick={this.sharePanel}>分享</a>
                                <a className="title-panel-btn" onClick={this.refreshPanel}>更新</a>
                                <Modal title="分享" visible={this.state.isShareShow}
                                       onOk={() => this.setState({isShareShow: false})}
                                       onCancel={() => this.setState({isShareShow: false})}
                                       width={620}
                                >
                                    <Row style={{padding: '80px 110px', background: '#f1f0f6', marginTop: 40}}>
                                        <Col span={6} style={{textAlign: 'right', paddingTop: 5}}>
                                            分享链接：
                                        </Col>
                                        <Col span={18}>
                                            <Input type={'textarea'} rows="5"
                                                   value={this.getShareUrl()}/>
                                        </Col>
                                    </Row>
                                </Modal>
                                <LayouterFilter visible={this.state.isLayouterFilterShow}
                                                onCancel={() => {
                                                    this.setState({isLayouterFilterShow: false})
                                                    this.init()
                                                }}
                                                onOk={() => {
                                                    this.setState({isLayouterFilterShow: false})
                                                    this.props.savePanel(() => {
                                                        message.success('保存成功！')
                                                        this.init()
                                                    })
                                                }}/>
                            </Col>
                        </Row>
                        <div className="layout-panel">
                            <ReactScrollbar className="layout-panel-scrollbar"
                                            style={{background: this.props.background.color}}>
                                <GridLayout cols={50} rowHeight={20} margin={[8, 8]}
                                            verticalCompact={false} preventCollision={false}
                                            onLayoutChange={this.setMaxHeight}
                                            onResize={() => {
                                                let e = document.createEvent("Event")
                                                e.initEvent("resize", true, false)
                                                window.dispatchEvent(e)
                                            }}
                                            onDragStart={() => this.setState({isDragging: true})}
                                            onDragStop={() => this.setState({isDragging: false})}
                                            style={this.state.isDragging ? {
                                                    background: '-webkit-linear-gradient(top, transparent 9px, rgba(0, 0, 0, 0.05) 9.5px, transparent 10px), ' +
                                                    '-webkit-linear-gradient(left, transparent 9px, rgba(0, 0, 0, 0.05) 9.5px, transparent 10px)',
                                                    backgroundSize: 'calc((100% - 490px) / 50 + 10px) 30px'
                                                } : {}}>
                                    {this.getItems()}
                                </GridLayout>
                            </ReactScrollbar>
                        </div>
                    </div>
                </div>
            </Spin>
        )
    }
}

class SetCard extends Component {
    static propTypes = {
        onBgChange: PropTypes.func.isRequired,
        onStyleChange: PropTypes.func.isRequired,
        BackgroundColor: PropTypes.string
    }

    constructor(props) {
        super(props)
        this.state = {}
    }//初始化 state

    componentWillMount() {
    }//插入 DOM 前

    getTitle = () => (
        <div style={{textAlign: 'center', fontSize: 18}}>背景设置</div>
    )

    getContent = () => (
        <div>
            <Button onClick={() => this.props.onBgChange('rgb(255, 255, 255)')}
                    style={{width: 30, height: 40, padding: 0, background: 'rgb(255, 255, 255)'}}/>
            <Button onClick={() => this.props.onBgChange('rgb(184, 0, 0)')}
                    style={{
                        width: 30,
                        height: 40,
                        padding: 0,
                        background: 'rgb(184, 0, 0)',
                        margin: '0 10px 10px 10px'
                    }}/>
            <Button onClick={() => this.props.onBgChange('rgb(219, 62, 0)')}
                    style={{width: 30, height: 40, padding: 0, background: 'rgb(219, 62, 0)'}}/>
            <Button onClick={() => this.props.onBgChange('rgb(252, 203, 0)')}
                    style={{
                        width: 30,
                        height: 40,
                        padding: 0,
                        background: 'rgb(252, 203, 0)',
                        margin: '0 10px 10px 10px'
                    }}/>
            <Button onClick={() => this.props.onBgChange('rgb(0, 139, 2)')}
                    style={{width: 30, height: 40, padding: 0, background: 'rgb(0, 139, 2)'}}/>
            <Button onClick={() => this.props.onBgChange('rgb(18, 115, 222)')}
                    style={{
                        width: 30,
                        height: 40,
                        padding: 0,
                        background: 'rgb(18, 115, 222)',
                        margin: '0 10px 10px 10px'
                    }}/>
            <Button onClick={() => this.props.onBgChange('rgb(0, 77, 207)')}
                    style={{width: 30, height: 40, padding: 0, background: 'rgb(0, 77, 207)'}}/>
            <Button onClick={() => this.props.onBgChange('rgb(83, 0, 235)')}
                    style={{
                        width: 30,
                        height: 40,
                        padding: 0,
                        background: 'rgb(83, 0, 235)',
                        margin: '0 10px 10px 10px'
                    }}/>
            <Button onClick={() => this.props.onBgChange('rgb(0, 0, 0)')}
                    style={{width: 30, height: 40, padding: 0, background: 'rgb(0, 0, 0)'}}/>
            <Popover content={<ChromePicker color={this.props.BackgroundColor}
                                            onChangeComplete={(color) =>
                                                this.props.onBgChange(`rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})`)}/>}
                     placement="bottomLeft">
                <Button style={{
                    width: 30,
                    height: 40,
                    padding: 0,
                    background: 'url(' + more + ') center',
                    margin: '0 0 10px 10px'
                }}/>
            </Popover>
            <hr/>
            <Button onClick={() => this.props.onStyleChange('dark')} className="echart-style-dark"/>
            <Button onClick={() => this.props.onStyleChange('infographic')} className="echart-style-infographic"/>
            <br/>
            <Button onClick={() => this.props.onStyleChange('macarons')} className="echart-style-macarons"/>
            <Button onClick={() => this.props.onStyleChange('roma')} className="echart-style-roma"/>
            <br/>
            <Button onClick={() => this.props.onStyleChange('shine')} className="echart-style-shine"/>
            <Button onClick={() => this.props.onStyleChange('vintage')} className="echart-style-vintage"/>
        </div>
    )

    render() {
        return (
            <Popover title={this.getTitle()} content={this.getContent()}
                     placement="bottomRight" trigger="click" arrowPointAtCenter>
                <Icon type="setting"/>
            </Popover>
        )
    }

}

const Layouter = connect(
    mapStateToProps,
    mapDispatchToProps
)(LayouterUI)

export default Layouter