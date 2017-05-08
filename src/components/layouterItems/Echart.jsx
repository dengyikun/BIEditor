/**
 * Created by DengYiKun on 2017/2/11.
 */
import React, {Component, PropTypes} from 'react'
import {Table, Icon} from 'antd'
import ReactScrollbar from 'react-custom-scrollbars'
import echarts from 'echarts'
import 'echarts/map/js/china'
import 'echarts/theme/dark'
import 'echarts/theme/infographic'
import 'echarts/theme/macarons'
import 'echarts/theme/roma'
import 'echarts/theme/shine'
import 'echarts/theme/vintage'
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
            dataSource: []
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
        fetch(`${config.dataApiHost}/data/panel/chart/${config.request.token}/
        ${this.props.item.data.panelId}/${this.props.item.data.chartId}`, {
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
                debugger
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
                        if (set.type === 'table') {
                            this.setState({
                                type: option.type,
                                columns: option.columns,
                                dataSource: option.dataSource,
                                title: option.title
                            })
                        } else {
                            this.setState({type: option.type})
                            let echartSample = echarts.init(this.refs.chart, this.props.theme)
                            echartSample.setOption(option)
                            window.addEventListener('resize', echartSample.resize)
                        }
                    }
                }
            })
    }

    downloadIamge = () => {
        let e = echarts.getInstanceByDom(this.refs.chart)
        let a = document.createElement("a")
        a.href = e.getDataURL()
        a.download = (e.getOption()).title["0"].text + '.png'
        a.click()
    }

    render() {
        return (
            <div style={{width: '100%', height: '100%'}}>
                {
                    this.props.edit &&
                    <div className="toolbar">
                        <Icon type="delete" onClick={() => this.props.onRemove(this.props.item.id)}/>
                        {
                            this.state.type !== 'table' &&
                            <Icon type="download" onClick={this.downloadIamge}/>
                        }
                        <Icon type="edit"
                              onClick={() => window.open('/editor.html?id=' + this.props.item.data.chartId, '_blank')}/>
                        <Icon type="sync" onClick={this.refreshChart}/>
                    </div>
                }
                <div style={{width: '100%', height: '100%'}} className={this.props.theme}>
                    {
                        this.state.type !== 'table' &&
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
                </div>
            </div>
        )
    }//渲染
}

export default Echart