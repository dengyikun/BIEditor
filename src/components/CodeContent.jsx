import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {Input, Button, Tag, Tooltip, Modal, Form, Radio, InputNumber, Checkbox, Icon, message} from 'antd'
import EditorChart from './EditorChart.jsx'
import editorAction from '../actions/editorAction'
import AceEditor from 'react-ace'
import 'brace/ext/language_tools'
import 'brace/mode/mysql'
import 'brace/theme/tomorrow'

const FormItem = Form.Item;

const mapStateToProps = (state) => ({
    dataSet: state.dataSet,
    chart: state.chart
})

const mapDispatchToProps = (dispatch) => (bindActionCreators(editorAction, dispatch))

class CodeContentUI extends Component {
    static propTypes = {}

    constructor(props) {
        super(props)
        this.state = {
            init: false,
            enableLiveAutocompletion: false,
            refreshLoading: 'swap',
            inputVisible: false,
            inputValue: '',
            visible: false,
            visibleType: '',
            visibleName: '',
            visibleThousands: true,
            isCodeFilterShow: false,
            codeFilter: []
        }
    }//初始化 state

    componentWillReceiveProps(nextProps) {
        if (!this.state.init) {
            this.setState({init: true})
        }
    }//接收新 props

    refreshChart = () => {
        this.setState({refreshLoading: 'loading'})
        this.props.getChart(this.props.dataSet, () => {
            this.setState({refreshLoading: 'swap'})
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
        const {name, comment, layoutType, layoutDecimal, layoutThousands} = form.getFieldsValue(['name', 'comment', 'layoutType', 'layoutDecimal', 'layoutThousands'])
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

    showCodeFilter = () => {
        let codeFilter = []
        let error = ''
        this.props.dataSet.codeSql.replace(/\$\{(.*?)\}/g, (string, match) => {
            if (codeFilter.findIndex((item) => item.name === match) !== -1) {
                error = '存在相同的 SQL 数值！'
            } else if (match) {
                const filter = this.props.dataSet.codeFilter.find((item) => item.name === match)
                if (filter) {
                    codeFilter.push({
                        name: match,
                        value: filter.value,
                    })
                } else {
                    codeFilter.push({
                        name: match,
                        value: '',
                    })
                }
            }
        })
        if (codeFilter.length === 0) {
            error = '没有设置 SQL 数值！'
        }
        if (error) {
            message.error(error)
        } else {
            this.setState({isCodeFilterShow: true, codeFilter})
        }
    }

    render() {
        const {dataSet, setDataSetCodeSql, form} = this.props
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
        console.log(this.state.init)
        return (
            <div className="content-wrapper">
                <div className="content-wrapper-title">
                    <div size="large">
                        <i className="iconfont-bi icon-111zhuanhuan"/>拖拽模式
                    </div>
                    <div className="active" size="large">
                        <i className="iconfont-bi icon-yuandaima"/>代码模式
                    </div>
                </div>
                <div className="field-panel">
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
                                <Tag key={name} onClick={() => this.showModal('values', name, value.layout.type)}
                                     closable={index !== -1}
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
                    </div>
                </div>
                <div className="data-code-panel">
                    <AceEditor width="100%" height="140px" mode="mysql" theme="tomorrow"
                               onChange={setDataSetCodeSql} value={dataSet.codeSql}
                               enableLiveAutocompletion={this.state.init}/>
                    <Button className="edit-sql-value" icon="edit"
                            onClick={this.showCodeFilter}>赋值</Button>
                    <Button className="refresh-chart" icon={this.state.refreshLoading}
                            onClick={this.refreshChart}>刷新</Button>
                </div>
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
                                <Radio.Group onChange={(e) => this.setState({visibleThousands: e.target.value === 1})}>
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
                            {getFieldDecorator('layoutThousands', {
                                valuePropName: 'checked',
                                initialValue: modelLayoutThousands
                            })(
                                <Checkbox>使用千位分隔符</Checkbox>
                            )}
                        </FormItem>}
                    </Form>
                </Modal>
                <CodeFilterModal
                    visible={this.state.isCodeFilterShow}
                    onCancel={() => this.setState({isCodeFilterShow: false})}
                    setDataSetCodeFilter={this.props.setDataSetCodeFilter}
                    codeFilter={this.state.codeFilter}/>
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
const CodeFilterModal = Form.create()(
    class extends Component {
        static propTypes = {
            visible: PropTypes.bool.isRequired,
            setDataSetCodeFilter: PropTypes.func.isRequired,
            onCancel: PropTypes.func.isRequired,
            codeFilter: PropTypes.array.isRequired
        }//props 类型检查

        static defaultProps = {}//默认 props

        static contextTypes = {}//context 显式注册

        constructor(props) {
            super(props)
            this.state = {}
        }//初始化 state

        onOk = () => {
            this.props.form.validateFields((err, values) => {
                if (!err) {
                    debugger
                    let codeFilter = []
                    for (const key in values) {
                        codeFilter.push({
                            name: key,
                            value: values[key]
                        })
                    }
                    this.props.setDataSetCodeFilter(codeFilter)
                    this.props.onCancel()
                }
            })
        }

        render() {
            return (

                <Modal
                    {...this.props}
                    title="SQL 赋值"
                    afterClose={() => this.props.form.resetFields()}
                    onOk={this.onOk}
                    className="sql-value-modal"
                >
                    <Form>
                        {
                            this.props.codeFilter.map((filter) =>
                                <FormItem label={filter.name} labelCol={{span: 5, offset: 2}}
                                          wrapperCol={{span: 13, offset: 2}}
                                          key={filter.name} colon={false}>
                                    {this.props.form.getFieldDecorator(filter.name, {
                                        initialValue: filter.value
                                    })(
                                        <Input/>
                                    )}
                                </FormItem>
                            )
                        }
                    </Form>
                </Modal>
            )
        }//渲染
    }
)

const CodeContent = connect(
    mapStateToProps,
    mapDispatchToProps
)(Form.create()(CodeContentUI))

export default CodeContent