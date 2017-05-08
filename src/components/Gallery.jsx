/**
 * Created by DengYiKun on 2017/3/8.
 */
import React, {Component, PropTypes} from 'react'
import {Icon, Modal, Spin, Row, Button, message, Popover} from 'antd'
import Dropzone from 'react-dropzone'
import ReactScrollbar from 'react-custom-scrollbars'
import config from '../config'

class Gallery extends Component {
    static propTypes = {
        visible: PropTypes.bool.isRequired,
        onOk: PropTypes.func.isRequired,
        onCancel: PropTypes.func.isRequired,
        projectId: PropTypes.string.isRequired
    }//props 类型检查

    static defaultProps = {}//默认 props

    static contextTypes = {}//context 显式注册

    constructor(props) {
        super(props)
        this.state = {
            images: [],
            selectImages: [],
            isLoading: false
        }
    }//初始化 state

    componentWillMount() {
    }//插入 DOM 前

    componentWillReceiveProps(nextProps) {
        if (nextProps.visible !== this.props.visible && nextProps.visible) {
            this.init()
        }
    }//接收新 props

    init = () => {
        this.setState({isLoading: true})
        fetch(`${config.mgmtApiHost}/gallery/list/${config.request.token}/${this.props.projectId}/0/-1`, {
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
                    this.setState({
                        images: data.data.dataList,
                        selectImages: [],
                        isLoading: false
                    })
                }
            })
    }

    onDrop = (files) => {
        this.setState({isLoading: true})
        let formData = new FormData()
        files.map((file) => {
            formData.append('uploadImg', file)
        })
        fetch(`${config.mgmtApiHost}/oss/gallery/add/img/${config.request.token}/${this.props.projectId}`, {
            method: "POST",
            headers: {
                'Accept': 'application/json'
            },
            body: formData
        })
            .then(response => {
                if (response.status >= 400) {
                    throw new Error("Bad response from server")
                }
                debugger
                return response.json()
            })
            .then(data => {
                this.init()
            })
    }

    selectImage = (image) => {
        let newSelectImages = this.state.selectImages.slice()
        if (newSelectImages.includes(image)) {
            newSelectImages.splice(newSelectImages.findIndex((newSelectImage) => newSelectImage === image), 1)
        } else {
            newSelectImages.push(image)
        }
        this.setState({selectImages: newSelectImages})
    }

    deleteImages = () => {
        let length = 0
        this.state.selectImages.map((image) => {
            this.setState({isLoading: true})
            fetch(`${config.mgmtApiHost}/gallery/delete/${config.request.token}/${image.galleryId}`, {
                method: "POST",
                headers: {
                    'Accept': 'application/json'
                }
            })
                .then(response => {
                    if (response.status >= 400) {
                        throw new Error("Bad response from server")
                    }
                    debugger
                    return response.json()
                })
                .then(data => {
                    length++
                    if (length === this.state.selectImages.length) {
                        this.init()
                    }
                })
        })
    }

    onOk = () => {
        this.props.onOk(Array.from(this.state.selectImages, selectImage => selectImage = selectImage.url))
    }

    render() {
        return (
            <Modal title="图库" maskClosable={false} {...this.props} width={802} footer={[
                <Button key="cancel" size="large" onClick={this.props.onCancel}>取消</Button>,
                <Button key="delete" size="large" type="danger" onClick={this.deleteImages}>删除</Button>,
                <Button key="ok" size="large" type="primary" onClick={this.onOk}>确认</Button>,
            ]}>
                <Spin spinning={this.state.isLoading}>
                    <ReactScrollbar style={{height: 440}}>
                        <Row>
                            <Dropzone onDrop={this.onDrop} accept='image/*'
                                      style={{
                                          width: 100, height: 100, float: 'left', background: '#fff',
                                          textAlign: 'center', margin: '5px', border: '#000 solid 1px'
                                      }}>
                                <Icon type="cloud-upload-o"
                                      style={{fontSize: '50px', color: '#666', marginTop: '10px'}}/>
                                <p style={{fontSize: '16px'}}>上传图片</p>
                            </Dropzone>
                            {
                                this.state.images.map((image) => {
                                    return <img src={image.url} style={{
                                        width: 100, height: 100, margin: '5px',
                                        border: this.state.selectImages.includes(image) ? '#108ee9 solid 1px' : '#000 solid 1px'
                                    }} key={image.galleryId} onClick={() => this.selectImage(image)}/>
                                })
                            }
                        </Row>
                    </ReactScrollbar>
                </Spin>
            </Modal>
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

export default Gallery