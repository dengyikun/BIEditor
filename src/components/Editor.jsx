/**
 * Created by dyk on 2017/1/14.
 */
import React, {Component, PropTypes} from 'react'
import {bindActionCreators} from 'redux'
import {Input, Button, Icon, Popover, Spin, message, Tree} from 'antd'
import {connect} from 'react-redux'
import DragContent from './DragContent.jsx'
import CodeContent from './CodeContent.jsx'
import ChartStyle from './ChartStyle.jsx'
import editorAction from '../actions/editorAction';
import config from '../config'

const TreeNode = Tree.TreeNode
const Search = Input.Search

const mapStateToProps = (state) => ({
    dataSet: state.dataSet,
    chartSet: state.chartSet,
    chart: state.chart,
    source: state.source,
})

const mapDispatchToProps = (dispatch) => (bindActionCreators(editorAction, dispatch))

class EditorUI extends Component {
    static propTypes = {
        dataSet: PropTypes.object,
        chart: PropTypes.object,
        setDataSetType: PropTypes.func,
        getChart: PropTypes.func,
        source: PropTypes.object,
    }

    constructor(props) {
        super(props)
        this.state = {
            loading: true,
        }
    }//初始化 state

    componentWillMount() {
        this.props.getCodeData(config.request.id, (sourceId, dataSet) => {
            this.props.getSourceTable(sourceId)
            this.props.getChart(dataSet)
            this.setState({loading: false})
        })
    }//插入 DOM 前

    onSearch = (value) => {
        this.props.getSourceTable(this.props.dataSet.sourceId, value)
    }
    setChartType = (type) => {
        let dataSet = {...this.props.dataSet}
        dataSet.type = type
        this.props.setDataSetType(type)
        this.props.getChart(dataSet)
    }

    render() {
        const {setChartSetTitle, chartSet, saveChart} = this.props
        return (
            <Spin spinning={this.state.loading}>
                <div className='wrapper'>
                    <header>
                        <div className="logo"/>
                    </header>
                    <aside className="left-aside">
                        <div className="resource-name">
                            {this.props.source.sourceName}
                        </div>
                        <Search placeholder="输入表名进行搜索"
                                onSearch={this.onSearch}/>
                        <Tree>
                            {
                                this.props.source.tableList.map((item) => {
                                    const columns = []
                                    item.columns.map((column) => {
                                        columns.push(<TreeNode title={<i className="iconfont-bi icon-1">{column.name}</i>} key={column.name}/>)
                                    })
                                    return <TreeNode title={<i className="iconfont-bi icon-biaoge">{item.tableName}</i>} key={item.tableName}>
                                        {columns}
                                    </TreeNode>
                                })
                            }
                        </Tree>
                    </aside>
                    <CodeContent/>
                    <aside className="right-aside">
                        <div className="chart-set-panel">
                            <Button className="chart-set-save" type="primary" size="large" icon="save"
                                    onClick={() => saveChart(() => message.success('保存成功！'))}>保存</Button>
                            <hr/>
                            <div className="chart-set-title-label">
                                图表标题
                                <br/>
                                <Input className="chart-set-title" size="large" placeholder="请输入图表名称"
                                       value={chartSet.title}
                                       onChange={(event) => setChartSetTitle(event.target.value)}/>
                            </div>
                            <hr/>
                            <div className="chart-set-select">
                                图表类型
                                <Popover placement="leftTop" content={
                                    <div className="chart-set-select-item chart-set-select-table">
                                        <div className="chart-set-select-table" onClick={() => this.setChartType("table")}></div>
                                    </div>
                                }>
                                    <Button type="ghost" size="small"><i className="iconfont-bi icon-icons17"/>表&nbsp;&nbsp;&nbsp;&nbsp;格</Button>
                                </Popover>
                                <Popover placement="leftTop" content={
                                    <div className="chart-set-select-item chart-set-select-line">
                                        <div className="chart-set-select-line-stack"
                                             onClick={() => this.setChartType("line-stack")}>
                                        </div>
                                        <div className="chart-set-select-area-stack"
                                             onClick={() => this.setChartType("area-stack")}>
                                        </div>
                                    </div>
                                }>
                                    <Button type="ghost" size="small"><i className="iconfont-bi icon-tubiao_zhexiantu"/>折线图</Button>
                                </Popover>
                                <Popover placement="leftTop" content={
                                    <div className="chart-set-select-item chart-set-select-bar">
                                        <div className="chart-set-select-bar-tick-align"
                                             onClick={() => this.setChartType("bar-tick-align")}></div>
                                        <div className="chart-set-select-bar-y-category"
                                             onClick={() => this.setChartType("bar-y-category")}></div>
                                    </div>
                                }>
                                    <Button type="ghost" size="small"><i className="iconfont-bi icon-tubiao-zhuzhuangtu"/>柱状图</Button>
                                </Popover>
                                <Popover placement="leftTop" content={
                                    <div className="chart-set-select-item chart-set-select-pie">
                                        <div className="chart-set-select-pie-simple"
                                             onClick={() => this.setChartType("pie-simple")}></div>
                                        <div className="chart-set-select-pie-doughnut"
                                             onClick={() => this.setChartType("pie-doughnut")}></div>
                                    </div>
                                }>
                                    <Button type="ghost" size="small"><i className="iconfont-bi icon-bingtu-kongxin"/>饼&nbsp;&nbsp;&nbsp;&nbsp;图</Button>
                                </Popover>
                                { false && <Popover placement="leftTop" content={
                                    <div className="chart-set-select-item chart-set-select-strip">
                                    </div>
                                }>
                                    <Button icon="menu-unfold" type="ghost" size="small">条线图</Button>
                                </Popover>}
                                { false && <Popover placement="leftTop" content={
                                    <div className="chart-set-select-item chart-set-select-filter">
                                    </div>
                                }>
                                    <Button type="ghost" size="small"><i className="iconfont-bi icon-shaixuan"/>漏斗图</Button>
                                </Popover>}
                                <Popover placement="leftTop" content={
                                    <div className="chart-set-select-item chart-set-select-map">
                                        <div className="chart-set-select-map-china-dataRange"
                                             onClick={() => this.setChartType("map-china-dataRange")}></div>
                                    </div>
                                }>
                                    <Button type="ghost" size="small"><i className="iconfont-bi icon-ditu"/>地&nbsp;&nbsp;&nbsp;&nbsp;图</Button>
                                </Popover>
                                <Popover placement="leftTop" content={
                                    <div className="chart-set-select-item chart-set-select-value">
                                        <div className="chart-set-select-unit-value"
                                             onClick={() => this.setChartType("unit-value")}></div>
                                    </div>
                                }>
                                    <Button type="ghost" size="small"><i className="iconfont-bi icon-1"/>单&nbsp;&nbsp;&nbsp;&nbsp;值</Button>
                                </Popover>
                            </div>
                            <hr/>
                            <ChartStyle/>
                        </div>
                    </aside>
                </div>
            </Spin>
        )
    }
}

const Editor = connect(
    mapStateToProps,
    mapDispatchToProps
)(EditorUI)

export default Editor