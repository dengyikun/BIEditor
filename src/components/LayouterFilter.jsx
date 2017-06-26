/**
 * Created by DengYiKun on 2017/3/8.
 */
import React, {Component, PropTypes} from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import {Tabs, Icon, Modal, Row, Col, Radio, Input, message, Popover} from 'antd'
import Dropzone from 'react-dropzone'
import ReactScrollbar from 'react-custom-scrollbars'
import layouterAction from '../actions/layouterAction';
import selected from '../anssets/images/selected.png';
import config from '../config'

const TabPane = Tabs.TabPane
const RadioGroup = Radio.Group

const mapStateToProps = (state) => ({
    filter: state.filter,
    charts: state.charts,
})

const mapDispatchToProps = (dispatch) => (bindActionCreators(layouterAction, dispatch))

class LayouterFilterUI extends Component {
    static propTypes = {
        visible: PropTypes.bool.isRequired,
        onCancel: PropTypes.func.isRequired,
        filter: PropTypes.array,
        charts: PropTypes.array,
        setFilter: PropTypes.func,
    }//props 类型检查

    static defaultProps = {}//默认 props

    static contextTypes = {}//context 显式注册

    constructor(props) {
        super(props)
        this.state = {
            filterSelectedIndex: -1,
            codeChartSelectedId: '',
            codeChartSelectedFilter: [],
            type: 'code',
            filterContent: [],
        }
    }//初始化 state

    addFilter = () => {
        let newFilter = this.props.filter.slice()
        newFilter.push({
            name: `条件${this.props.filter.length + 1}`,
            dragTableList: [],
            codeTable: {}
        })
        this.props.setFilter(newFilter)
    }

    onFilterSelect = (filterIndex) => {
        const filter = this.props.filter[filterIndex]
        this.setState({
            filterSelectedIndex: filterIndex,
            codeChartSelectedId: filter.codeTable.chartId,
            codeChartSelectedFilter: this.getCodeFilter(filter.codeTable.chartId, filter)
        })
    }

    onCodeChartSelect = (e) => {
        let newFilter = this.props.filter.slice()

        const chartId = e.target.value
        const filter = newFilter[this.state.filterSelectedIndex]
        const newCodeValueList = this.getCodeFilter(chartId, filter)

        newFilter[this.state.filterSelectedIndex].codeTable.codeValueList = newCodeValueList
        newFilter[this.state.filterSelectedIndex].codeTable.chartId = chartId

        this.setState({
            codeChartSelectedId: chartId,
            codeChartSelectedFilter: newCodeValueList
        })
        this.props.setFilter(newFilter)
    }

    onFilterInput = (e) => {
        debugger
        let newFilter = this.props.filter.slice()
        const value = e.target.value
        const name = e.target.name

        newFilter[this.state.filterSelectedIndex].codeTable.codeValueList.map((item) => {
            if (item.name === name) {
                item.value = value
            }
        })

        this.setState({
            codeChartSelectedFilter: newFilter[this.state.filterSelectedIndex].codeTable.codeValueList
        })

        this.props.setFilter(newFilter)
    }

    getCodeFilter = (chartId, filter) => {
        let codeFilter = []
        const chart = this.props.charts.find((chart) => chart.chartId === chartId)
        debugger
        if (chart && chart.codeFilter) {
            codeFilter = JSON.parse(chart.codeFilter)
            if (filter.codeTable.codeValueList) {
                codeFilter.map((oldFilter) => {
                    let codeValue = filter.codeTable.codeValueList.find((item) => item.name === oldFilter.name)
                    if (codeValue) {
                        oldFilter.value = codeValue.value
                    }
                })
            }
        }
        return codeFilter
    }

    render() {
        return (
            <Modal title="全局筛选" maskClosable={false} {...this.props} width={1000}>
                <Row gutter={30}>
                    <Col span={4} style={{paddingLeft: 0}}>
                        <div style={{
                            fontSize: 16, paddingLeft: 20,
                            height: 37, lineHeight: '37px',
                        }}>
                            筛选项
                            <Icon type="plus" style={{
                                float: 'right',
                                lineHeight: '37px',
                            }} onClick={this.addFilter}/>
                        </div>
                        <ReactScrollbar style={{height: 400}}>
                            {
                                this.props.filter.map((item, index) => {
                                    return <div style={{
                                        height: 30,
                                        fontSize: 14,
                                        lineHeight: '30px',
                                        paddingLeft: 20,
                                        paddingRight: 20,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }} onClick={() => this.onFilterSelect(index)} key={index}>
                                        {
                                            index === this.state.filterSelectedIndex ?
                                                <div style={{
                                                    height: 30,
                                                    background: `url(${selected}) no-repeat left center`,
                                                    backgroundSize: 'auto 20%',
                                                    paddingLeft: 40,
                                                    marginLeft: -20,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                }}>{item.name}</div> : item.name
                                        }
                                    </div>
                                })
                            }
                        </ReactScrollbar>
                    </Col>
                    <Col span={this.state.filterSelectedIndex >= 0 ? 13 : 0}>
                        <Tabs defaultActiveKey="code" activeKey={this.state.type}
                              onChange={(value) => this.setState({type: value})}>
                            <TabPane tab={<span><Icon type="arrows-alt"/>拖拽模式</span>} key="drag">
                            </TabPane>
                            <TabPane tab={<span><Icon type="code-o"/>代码模式</span>} key="code">
                                <RadioGroup onChange={this.onCodeChartSelect}
                                            value={this.state.codeChartSelectedId}>
                                    {
                                        this.props.charts.map((chart, index) => {
                                            if (chart.model === 2) {
                                                return <Radio value={chart.chartId} key={index}>
                                                    {chart.title}
                                                </Radio>
                                            }
                                        })
                                    }
                                </RadioGroup>
                            </TabPane>
                        </Tabs>
                    </Col>
                    <Col span={this.state.filterSelectedIndex >= 0 ? 7 : 0}>
                        <div style={{
                            fontSize: 16, paddingLeft: 20,
                            height: 37, lineHeight: '37px',
                            background: '#e3e5ea'
                        }}>
                            筛选内容
                        </div>
                        <ReactScrollbar style={{height: 400}}>
                            {
                                this.state.codeChartSelectedFilter.map((filter, index) => {
                                    return <div style={{
                                        height: 30,
                                        fontSize: 14,
                                        lineHeight: '30px',
                                        paddingLeft: 20,
                                        paddingRight: 20,
                                        textAlign: 'center',
                                    }} key={(new Date()).getTime() + index}>
                                        <Row gutter={20}>
                                            <Col span={10}>
                                                <div style={{
                                                    borderBottom: '1px solid #cccccc',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                }}>{filter.name}</div>
                                            </Col>
                                            <Col span={14}>
                                                <Input style={{
                                                    borderRadius: 0,
                                                    border: 'none',
                                                    borderBottom: '1px solid #cccccc',
                                                    height: 30,
                                                }}
                                                       onChange={this.onFilterInput}
                                                       name={filter.name}
                                                       defaultValue={filter.value}/>
                                            </Col>
                                        </Row>
                                    </div>
                                })
                            }
                        </ReactScrollbar>
                    </Col>
                </Row>
            </Modal>
        )
    }//渲染
}

const LayouterFilter = connect(
    mapStateToProps,
    mapDispatchToProps
)(LayouterFilterUI)

export default LayouterFilter