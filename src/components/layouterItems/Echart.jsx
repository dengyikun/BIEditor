/**
 * Created by DengYiKun on 2017/2/11.
 */
import React, {Component, PropTypes} from 'react'
import {Table, Icon, Menu, Dropdown, Modal} from 'antd'
import ReactScrollbar from 'react-custom-scrollbars'
import echarts from 'echarts'
import 'echarts/map/js/china'
import 'echarts/theme/dark'
import 'echarts/theme/infographic'
import 'echarts/theme/macarons'
import 'echarts/theme/roma'
import 'echarts/theme/shine'
import 'echarts/theme/vintage'
import '../../anssets/js/echart-theme/essos'
import '../../anssets/js/echart-theme/infographic'
import '../../anssets/js/echart-theme/macarons'
import '../../anssets/js/echart-theme/shine'
import '../../anssets/js/echart-theme/walden'
import config from '../../config'

class Echart extends Component {
    static propTypes = {
        item: PropTypes.object.isRequired
    }//props 类型检查

    static defaultProps = {}//默认 props

    constructor(props) {
        super(props)
        this.state = {
            type: 'chart',
            title: '',
            columns: [],
            dataSource: [],
            isDataShow: false,
            isDataLoading: false,
            data: {}
        }
    }//初始化 state

    componentWillMount() {
        this.refreshChart()
    }//插入 DOM 前

    componentDidUpdate(prevProps) {
        if (prevProps.item !== this.props.item || prevProps.theme !== this.props.theme) {
            this.refreshChart()
        }
    }//接收新 prop

    refreshChart = () => {
        fetch(`${config.dataApiHost}/data/panel/chart/${config.request.token}/${this.props.item.data.panelId}/${this.props.item.data.chartId}`, {
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
                if (data.code === 200) {
                    data.data.style = JSON.parse(data.data.style)
                    const set = data.data
                    const chart = data.data.data
                    if (chart) {
                        let option = {
                            type: set.type,
                            title: {
                                text: set.title,
                                left: '20xp',
                                top: '15px',
                                textStyle: {
                                    fontSize: '18',
                                    fontWeight: 'normal'
                                }
                            },
                            legend: {
                                data: chart.legend,
                                textStyle: {
                                    fontSize: '12'
                                },
                                top: '60px',
                                left: '20xp',
                                itemGap: 7,
                                formatter: ' {name}  ',
                                itemWidth: 20,
                                itemHeight: 10
                            },
                            grid: {
                                left: '25px',
                                right: '25px',
                                top: '110px',
                                bottom: '25x',
                                containLabel: true
                            },
                            series: chart.series,
                            tooltip: {
                                trigger: 'axis'
                            },
                            xAxis: [
                                {
                                    show: set.style.showX,
                                    data: chart.xAxis
                                }
                            ],
                            yAxis: [
                                {
                                    show: set.style.showY,
                                    type: 'value',
                                    nameLocation: 'middle',
                                    nameGap: 45,
                                    name: set.style.yName
                                }
                            ],
                        }
                        switch (set.type) {
                            case "table":
                                let columns = []
                                let dataSource = []
                                chart.titles.map((val) => {
                                    columns.push({
                                        title: val,
                                        dataIndex: val,
                                        width: 100 / chart.titles.length + '%',
                                    })
                                })
                                chart.rows.map((val) => {
                                    let obj = {}
                                    chart.titles.map((v, i) => {
                                        obj[v] = val[i]
                                    })
                                    dataSource.push(obj)
                                })
                                option = {
                                    ...option,
                                    columns: columns,
                                    dataSource: dataSource,
                                    title: set.title,
                                }
                                break
                            case "unit-value":
                                option = {
                                    ...option,
                                    ...chart
                                }
                                break
                            case "line-stack":
                                option = {
                                    ...option
                                }
                                break
                            case "area-stack":
                                option = {
                                    ...option
                                }
                                break
                            case "bar-tick-align":
                                option = {
                                    ...option
                                }
                                break
                            case "bar-y-category":
                                option = {
                                    ...option,
                                    xAxis: [
                                        {
                                            show: set.style.showY,
                                            type: 'value',
                                            nameLocation: 'middle',
                                            nameGap: 25,
                                            name: set.style.yName
                                        }
                                    ],
                                    yAxis: [
                                        {
                                            show: set.style.showX,
                                            data: chart.xAxis
                                        }
                                    ]
                                }
                                break
                            case "pie-simple":
                                option = {
                                    ...option,
                                    tooltip: {
                                        trigger: 'item',
                                        formatter: "{a} <br/>{b}: {c} ({d}%)"
                                    },
                                    xAxis: null,
                                    yAxis: null,
                                }
                                option.series.map((series) => {
                                    series.label.normal.formatter =
                                        set.style.pieShowName ? '{b}' : '{d}%'
                                })
                                break
                            case "pie-doughnut":
                                option = {
                                    ...option,
                                    tooltip: {
                                        trigger: 'item',
                                        formatter: "{a} <br/>{b}: {c} ({d}%)"
                                    },
                                    xAxis: null,
                                    yAxis: null,
                                }
                                option.series.map((series) => {
                                    series.label.normal.formatter =
                                        set.style.pieShowName ? '{b}' : '{d}%'
                                })
                                break
                            case "map-china-dataRange":
                                option = {
                                    ...option,
                                    tooltip: {
                                        trigger: 'item'
                                    },
                                    visualMap: {
                                        min: chart.min,
                                        max: chart.max,
                                        left: '20px',
                                        bottom: '20px',
                                        text: ['高', '低'],           // 文本，默认为数值文本
                                        calculable: true
                                    },
                                    xAxis: null,
                                    yAxis: null,
                                }
                                option.series[0].top = '90px'
                                option.series[0].bottom = '30px'
                                break
                            default:
                                break
                        }
                        this.setState({...option})
                        if (set.type !== 'table' && set.type !== 'unit-value') {
                            let echartSample = echarts.init(this.refs.chart, this.props.theme)
                            echartSample.setOption(option)
                            window.addEventListener('resize', echartSample.resize)
                        }
                    }
                }
            })
    }

    viewData = () => {
        this.setState({isDataShow: true, isDataLoading: true})
        fetch(`${config.dataApiHost}/data/table/${config.request.token}/${this.props.item.data.panelId}/${this.props.item.data.chartId}`, {
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
                if (data.code === 200) {
                    this.setState({data: data.data, isDataLoading: false})
                }
            })
    }

    downloadIamge = () => {
        let echart = echarts.getInstanceByDom(this.refs.chart)
        let a = document.createElement("a")
        a.href = echart.getDataURL()
        a.download = this.state.title.text + '.png'
        a.click()
    }

    exportExcel = () => {
        let a = document.createElement("a")
        a.href = `${config.dataApiHost}/data/export/${config.request.token}/${this.props.item.data.panelId}/${this.props.item.data.chartId}?sheetTitle=${this.state.title.text}`
        a.click()
    }

    render() {
        let columns = []
        if (this.state.data.titles) {
            this.state.data.titles.map((title, index) => columns.push({
                title: title,
                key: index,
                render: (text, record) => record[index]
            }))
        }
        return (
            <div style={{width: '100%', height: '100%'}}>
                <Modal visible={this.state.isDataShow} title={'查看数据'}
                       onCancel={() => this.setState({isDataShow: false})}
                       footer={null}>
                    <ReactScrollbar style={{height: 440}} autoHide>
                        <Table columns={columns} size="middle"
                               dataSource={this.state.data.rows} bordered
                               pagination={false} loading={this.state.isDataLoading}
                               style={{textAlign: 'right'}}/>
                    </ReactScrollbar>
                </Modal>
                <div className="toolbar">
                    <Dropdown overlay={
                        <Menu selectedKeys={[]}>
                            <Menu.Item key="0">
                                <div onClick={this.viewData}>
                                    <Icon type="search"/> 查看数据
                                </div>
                            </Menu.Item>
                            {
                                this.state.type !== 'table' &&
                                this.state.type !== 'unit-value' &&
                                <Menu.Item key="1">
                                    <div onClick={this.downloadIamge}>
                                        <Icon type="download"/> 下载图片
                                    </div>
                                </Menu.Item>
                            }
                            <Menu.Item key="2">
                                <div onClick={this.exportExcel}>
                                    <Icon type="export"/> 导出图表
                                </div>
                            </Menu.Item>
                        </Menu>
                    } placement={'bottomRight'}>
                        <Icon type="down"/>
                    </Dropdown>
                    {
                        this.props.edit &&
                        <Icon type="delete" onClick={() => this.props.onRemove(this.props.item.id)}/>
                    }
                    {
                        this.props.edit &&
                        <Icon type="edit"
                              onClick={() => window.open('/editor.html?id=' + this.props.item.data.chartId, '_blank')}/>
                    }
                    <Icon type="sync" onClick={this.refreshChart}/>
                </div>
                <div style={{width: '100%', height: '100%'}} className={this.props.theme}>
                    {
                        this.state.type !== 'table' &&
                        this.state.type !== 'unit-value' &&
                        <div style={{width: '100%', height: '100%'}} ref="chart">
                        </div>
                    }
                    {
                        this.state.type === 'table' &&
                        <ReactScrollbar>
                            <Table columns={this.state.columns} size="middle"
                                   dataSource={this.state.dataSource} bordered
                                   title={() => <p style={{fontSize: 18}}>{this.state.title}</p>}/>
                        </ReactScrollbar>
                    }
                    {
                        this.state.type === 'unit-value' &&
                        <div className="unit-value">
                            <div className="unit-value-name">
                                {this.state.name || ''}
                            </div>
                            <div className="unit-value-value">
                                {this.state.value || this.state.value === 0 ?
                                    this.state.value : '暂无数据'}
                            </div>
                        </div>
                    }
                </div>
            </div>
        )
    }//渲染
}

export default Echart