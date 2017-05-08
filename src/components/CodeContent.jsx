import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {Input, Button, Tag, Tooltip, Modal, Form, Radio, InputNumber, Checkbox} from 'antd'
import EditorChart from './EditorChart.jsx'
import editorAction from '../actions/editorAction'

const FormItem = Form.Item;

const mapStateToProps = (state) => ({
    dataSet: state.dataSet,
    chart: state.chart
})

const mapDispatchToProps = (dispatch) => (bindActionCreators(editorAction, dispatch))

class CodeContentUI extends Component {
    static propTypes = {
    }

    constructor(props) {
        super(props)
        this.state = {
            refreshLoading: 'reload',
            inputVisible: false,
            inputValue: '',
            visible: false,
            visibleType: '',
            visibleName: '',
            visibleThousands: true,
        }
    }//初始化 state

    refreshChart = () => {
        this.setState({refreshLoading: 'loading'})
        this.props.getChart(() => {
            this.setState({refreshLoading: 'reload'})
        })
    }

    valuesInputConfirm = () => {
        let inputValue = this.state.inputValue
        let comment = '未命名' + inputValue
        if (inputValue.indexOf('[') > 0 && inputValue.indexOf(']') > 0) {
            comment = inputValue.split('[')[1].split(']')[0]
            inputValue = inputValue.split('[')[0]
        }
        let values = this.props.dataSet.values
        if (inputValue && !values.some(value => value.name == inputValue)) {
            let newValue = {
                name: inputValue,
                comment: comment,
                sort: '',
                statistical: '求和',
                layout: {
                    type: 0,
                    decimal: -1,
                    thousands: false
                }
            }
            values = [...values, newValue]
            this.props.setDataSetValues(values)
            this.setState({
                inputVisible: false,
                inputValue: '',
            })
        }
    }

    valuesClose = (removedTag) => {
        const values = this.props.dataSet.values.filter(value => value.name !== removedTag)
        this.props.setDataSetValues(values)
    }

    showModal = (visibleType, visibleName, type) => {
        this.setState({visible: true, visibleType, visibleName, visibleThousands: type === 1});
    }
    handleCreate = () => {
        const {visibleType, visibleName} = this.state
        const {form, dataSet} = this.props
        const {name, comment, layoutType, layoutDecimal, layoutThousands} = form.getFieldsValue(['name', 'comment','layoutType','layoutDecimal','layoutThousands'])
        form.validateFields((err, values) => {
            if (err) {
                return;
            }
            if (visibleType === 'dimensions') {
                const dimensions = dataSet.dimensions.map(dimension => {
                    if (dimension.name === visibleName) {
                        dimension.name = name
                        dimension.comment = comment
                    }
                    return dimension
                })
                this.props.setDataSetDimensions(dimensions)
            } else if (visibleType === 'values') {
                const values = dataSet.values.map(value => {
                    if (value.name === visibleName) {
                        value.name = name
                        value.comment = comment
                        value.layout.type = layoutType
                        value.layout.decimal = layoutDecimal
                        value.layout.thousands = layoutThousands === true
                    }
                    return value
                })
                this.props.setDataSetValues(values)
            }
            form.resetFields();
            this.setState({visible: false});
        });
    }

    checkName = (rule, val, callback) => {
        const state = this.state
        if (val === state.visibleName) {
            callback()
            return
        } else if (state.visibleType === 'values' && this.props.dataSet.values.some(value => value.name == val)) {
            callback('数值的数据库字段名称已存在！')
        } else if (state.visibleType === 'dimensions' && this.props.dataSet.dimensions.some(dimension => dimension.name == val)) {
            callback('维度的数据库字段名称已存在！')
        }
        callback()
    }

    render() {
        const {dataSet, setDataSetSql, form} = this.props
        const {inputVisible, inputValue, visibleType, visibleName} = this.state
        const {getFieldDecorator} = form
        let modelName = ''
        let modelComment = ''
        let modelLayoutType = 0
        let modelLayoutDecimal = -1
        let modelLayoutThousands = false
        if (visibleType === 'dimensions') {
            dataSet.dimensions.some(dimension => {
                if (dimension.name === visibleName) {
                    modelName = dimension.name
                    modelComment = dimension.comment
                    return true
                } else
                    return false
            })
        } else if (visibleType === 'values') {
            dataSet.values.some(value => {
                if (value.name === visibleName) {
                    modelName = value.name
                    modelComment = value.comment
                    modelLayoutType = value.layout.type
                    modelLayoutDecimal = value.layout.decimal
                    modelLayoutThousands = value.layout.thousands
                    return true
                } else
                    return false
            })
        }
        return (
            <div className="content-wrapper">
                <div className="field-panel">
                    <div className="field-item field-item-title">
                        数据源：{dataSet.sourceId}
                        <Button icon="code" type="ghost" size="large">代码模式</Button>
                        <Button icon="upload" type="primary" size="large">拖拽模式</Button>
                    </div>
                    <div className="field-item field-item-row">
                        列(维度)&nbsp;&nbsp;
                        {dataSet.dimensions.map((dimension) => {
                            const name = dimension.name
                            const comment = dimension.comment
                            return (
                                <Tag key={name} onClick={() => this.showModal('dimensions', name)}>
                                    {(name + '[' + comment + ']')}
                                </Tag>
                            )
                        })}
                    </div>
                    <div className="field-item field-item-col">
                        行(数值)&nbsp;&nbsp;
                        {dataSet.values.map((value, index) => {
                            const name = value.name
                            const comment = value.comment
                            const isLongTag = name.length * 2 + comment.length > 18
                            const tagElem = (
                                <Tag key={name} onClick={() => this.showModal('values', name,value.layout.type )} closable={index !== -1}
                                     onClose={(e) => e.stopPropagation()} afterClose={() => this.valuesClose(name)}>
                                    {isLongTag ? `${(name + '[' + comment + ']').slice(0, 20)}...` : (name + '[' + comment + ']')}
                                </Tag>
                            )
                            return isLongTag ? <Tooltip title={name} key={name}>{tagElem}</Tooltip> : tagElem
                        })}
                        {inputVisible && (
                            <Input
                                ref={input => this.input = input}
                                type="text" size="small"
                                style={{width: 78}}
                                value={inputValue}
                                onChange={(e) => this.setState({inputValue: e.target.value})}
                                onBlur={this.valuesInputConfirm}
                                onPressEnter={this.valuesInputConfirm}
                            />
                        )}
                        {!inputVisible &&
                        <Button type="dashed" icon="plus" shape="circle"
                                onClick={() => this.setState({inputVisible: true}, () => this.input.focus())}/>}
                        <Button className="refresh-chart" type="primary" icon={this.state.refreshLoading} onClick={this.refreshChart}
                                size="large">刷新</Button>
                    </div>
                </div>
                <Input className="data-code-panel" type="textarea" placeholder="代码编辑区"
                       value={dataSet.sql} onChange={(event) => setDataSetSql(event.target.value)}/>
                <div className="chart-panel">
                    <EditorChart/>
                </div>
                <Modal
                    visible={this.state.visible}
                    title="属性设置"
                    onCancel={() => this.setState({visible: false})}
                    onOk={this.handleCreate}
                    afterClose={() => this.props.form.resetFields()}
                >
                    <Form>
                        <FormItem label="数据库字段名称">
                            {getFieldDecorator('name', {
                                rules: [
                                    {required: true, message: '数据库字段名称不能为空!'},
                                    {validator: this.checkName}
                                ],
                                initialValue: modelName
                            })(
                                <Input />
                            )}
                        </FormItem>
                        <FormItem label="字段中文名称">
                            {getFieldDecorator('comment', {
                                initialValue: modelComment
                            })(
                                <Input />
                            )}
                        </FormItem>
                        {visibleType === 'values' &&
                        <FormItem label="数值显示样式">
                            {getFieldDecorator('layoutType', {
                                initialValue: modelLayoutType
                            })(
                                <Radio.Group onChange={(e) => this.setState({visibleThousands:e.target.value === 1})}>
                                    <Radio value={1}>数值</Radio>
                                    <Radio value={0}>百分数</Radio>
                                </Radio.Group>
                            )}
                        </FormItem>}
                        {visibleType === 'values' &&
                        <FormItem label="小数位数">
                            {getFieldDecorator('layoutDecimal', {
                                initialValue: modelLayoutDecimal
                            })(
                                <InputNumber min={-1}/>
                            )}
                        </FormItem>}
                        {visibleType === 'values' && this.state.visibleThousands &&
                        <FormItem label="分隔符">
                            {getFieldDecorator('layoutThousands',{
                                valuePropName: 'checked',
                                initialValue: modelLayoutThousands
                            })(
                                <Checkbox>使用千位分隔符</Checkbox>
                            )}
                        </FormItem>}
                    </Form>
                </Modal>
            </div>
        )
    }

    componentDidMount() {
    }

    shouldComponentUpdate(nextProps, nextState) {
        return true
    }//更新判断

    componentDidUpdate() {
    }
}

const CodeContent = connect(
    mapStateToProps,
    mapDispatchToProps
)(Form.create()(CodeContentUI))

export default CodeContent