/**
 * Created by DengYiKun on 2017/2/11.
 */
import React, {Component, PropTypes} from 'react'
import {Icon, Modal} from 'antd'
import ReactScrollbar from 'react-custom-scrollbars'
import ReactQuill from 'react-quill'
import 'quill/dist/quill.snow.css'
import 'echarts/map/js/china.js'

class Text extends Component {
    static propTypes = {}//props 类型检查

    static defaultProps = {}//默认 props

    constructor(props) {
        super(props)
        this.state = {
            isSettingShow: false,
            html: ''
        }
    }//初始化 state

    saveText = () => {
        let newItem = {...this.props.item}
        newItem.data.html = this.state.html
        this.props.onChange(newItem)
        this.setState({isSettingShow: false})
    }

    render() {
        return (
            <ReactScrollbar>
                {
                    this.props.edit &&
                    <div className="toolbar">
                        <Icon type="delete" onClick={() => this.props.onRemove(this.props.item.id)}/>
                        <Icon type="setting"
                              onClick={() => this.setState({isSettingShow: true, html: this.props.item.data.html})}/>
                    </div>
                }
                <div className="ql-editor"
                     style={{width: '100%', height: '100%', overflowY: 'visible', ...this.props.style}}
                     dangerouslySetInnerHTML={{__html: this.props.item.data.html}}/>
                <Modal title="文字设置" visible={this.state.isSettingShow}
                       maskClosable={false}
                       onOk={this.saveText} onCancel={() => {
                    this.setState({isSettingShow: false})
                }}
                >
                    <div style={{height: 442}}>
                        <ReactQuill theme="snow" style={{height: 400}}
                                    value={this.state.html}
                                    modules={{
                                        toolbar: [
                                            ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
                                            [{'list': 'ordered'}, {'list': 'bullet'}],
                                            [{'align': []}, 'clean'],
                                            [{'header': [1, 2, 3, 4, 5, 6, false]}],
                                            [{'color': []}, {'background': []}],          // dropdown with defaults from theme
                                        ]
                                    }}
                                    onChange={(value) => {
                                        this.setState({html: value})
                                    }}/>
                    </div>
                </Modal>
            </ReactScrollbar>
        )
    }//渲染
}

export default Text