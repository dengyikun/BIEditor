/**
 * Created by Loki on 2017/1/20.
 */
import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import echarts from 'echarts'
import 'echarts/map/js/china.js'
import ReactScrollbar from 'react-custom-scrollbars'
import {Table} from 'antd'

const mapStateToProps = (state) => ({
    dataSet: state.dataSet,
    chart: state.chart
})

class EditorChartUI extends Component {
    static propTypes = {
        dataSet: PropTypes.object,
        chart: PropTypes.object
    }//props 类型检查

    static defaultProps = {}//默认 props

    constructor(props) {
        super(props)
        this.state = {
        }
    }//初始化 state

    componentWillMount() {
    }//插入 DOM 前

    componentDidMount() {
    }//插入 DOM 后

    componentWillReceiveProps(nextProps) {
    }//接收新 prop

    shouldComponentUpdate(nextProps, nextState) {
        return this.props.chart !== nextProps.chart;
    }//更新判断

    componentWillUpdate(nextProps, nextState) {
    }//更新前

    componentDidUpdate(prevProps, prevState) {
        const {chart} = this.props
        if (chart.series && chart.series != ''){
            let echartSample = echarts.init(this.refs.echart)
            echartSample.setOption(chart)
            window.addEventListener('resize', echartSample.resize)
        }
    }//更新后

    componentWillUnmount() {
    }//卸载前

    render() {
        return (
            <div className="chart-content">
                {
                    this.props.dataSet.type === 'table' &&
                    <ReactScrollbar>
                        <Table columns={this.props.chart.columns || []} size="middle"
                               dataSource={this.props.chart.dataSource || []} bordered
                               title={() => <p style={{fontSize: 18}}>{this.props.chart.title || ''}</p>}/>
                    </ReactScrollbar>
                }
                {
                    this.props.dataSet.type === 'unit-value' &&
                    <div className="unit-value">
                        <div className="unit-value-name">
                            {this.props.chart.name || ''}
                        </div>
                        <div className="unit-value-value">
                            {this.props.chart.value || ''}
                        </div>
                    </div>
                }
                {
                    this.props.dataSet.type !== 'table' &&
                    this.props.dataSet.type !== 'unit-value' &&
                    <div className="e-chart" ref="echart"></div>
                }
            </div>
        )
    }//渲染
}

const EditorChart = connect(
    mapStateToProps
)(EditorChartUI)

export default EditorChart