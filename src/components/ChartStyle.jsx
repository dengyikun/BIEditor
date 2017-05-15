/**
 * Created by DengYiKun on 2017/3/26.
 */
import React, {Component, PropTypes} from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import {Switch, Input, Radio, Icon, Form} from 'antd'
import editorAction from '../actions/editorAction'

const RadioGroup = Radio.Group
const FormItem = Form.Item


const mapStateToProps = (state) => ({
    chartSet: state.chartSet,
    dataSet: state.dataSet,
})

const mapDispatchToProps = (dispatch) => (bindActionCreators(editorAction, dispatch))

class ChartStyleUI extends Component {
    static propTypes = {}//props 类型检查

    static defaultProps = {}//默认 props

    static contextTypes = {}//context 显式注册

    constructor(props) {
        super(props)
        this.state = {}
    }//初始化 state

    componentWillMount() {
    }//插入 DOM 前

    componentWillReceiveProps(nextProps) {
    }//接收新 props

    changeStyle = (data) => {
        this.props.setChartSetStyle({
            ...this.props.chartSet.style,
            ...data
        })
    }

    render() {
        let setItems = []
        switch (this.props.dataSet.type) {
            case 'line-stack':
                setItems = ['showX', 'showY', 'yName']
                break
            case 'area-stack':
                setItems = ['showX', 'showY', 'yName']
                break
            case 'bar-tick-align':
                setItems = ['showX', 'showY', 'yName']
                break
            case 'bar-y-category':
                setItems = ['showX', 'showY', 'yName']
                break
            case 'pie-simple':
                setItems = ['pieShowName']
                break
            case 'pie-doughnut':
                setItems = ['pieShowName']
                break
        }
        return (
            <Form className="chart-set-style">
                <div style={{fontSize: 16, marginBottom: 8}}>
                    图表设置
                </div>
                {
                    setItems.includes('showX') &&
                    <FormItem label="横坐标">
                        <Switch checked={this.props.chartSet.style.showX}
                                onChange={(value) => this.changeStyle({showX:value})}/>
                    </FormItem>
                }
                {
                    setItems.includes('showY') &&
                    <FormItem label="纵坐标">
                        <Switch checked={this.props.chartSet.style.showY}
                                onChange={(value) => this.changeStyle({showY:value})}/>
                    </FormItem>
                }
                {
                    setItems.includes('yName') &&
                    <FormItem label="纵坐标名称">
                        <Input value={this.props.chartSet.style.yName}
                               onChange={(e) => this.changeStyle({yName:e.target.value})}/>
                    </FormItem>
                }
                {
                    setItems.includes('pieShowName') &&
                    <FormItem label="展示内容">
                        <RadioGroup value={this.props.chartSet.style.pieShowName}
                                    onChange={(e) => this.changeStyle({pieShowName:e.target.value})}>
                            <Radio value={false}>占比</Radio>
                            <Radio value={true}>文字</Radio>
                        </RadioGroup>
                    </FormItem>
                }
            </Form>
        )
    }//渲染

    componentDidMount() {
    }//插入 DOM 后

    shouldComponentUpdate(nextProps, nextState) {
        return true
    }//更新判断

    componentWillUpdate(nextProps, nextState) {
    }//更新前

    componentDidUpdate(prevProps, prevState) {
    }//更新后

    componentWillUnmount() {
    }//卸载前
}

const ChartStyle = connect(
    mapStateToProps,
    mapDispatchToProps
)(ChartStyleUI)

export default ChartStyle