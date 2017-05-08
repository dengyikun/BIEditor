/**
 * Created by DengYiKun on 2017/2/11.
 */
import React, {Component, PropTypes} from 'react'
import {Icon} from 'antd'
import image from '../../anssets/images/image.png'

class Echart extends Component {
    static propTypes = {}//props 类型检查

    static defaultProps = {}//默认 props

    constructor(props) {
        super(props)
        this.state = {}
    }//初始化 state

    render() {
        return (
            <div style={{width: '100%', height: '100%'}}>
                {
                    this.props.edit &&
                    <div className="toolbar">
                        <Icon type="delete" onClick={() => this.props.onRemove(this.props.item.id)}/>
                    </div>
                }
                <img style={{width: '100%', height: '100%'}}
                     src={this.props.item.data.src} draggable="false"
                     onError={(e) => {
                         e.target.src = image
                     }}/>
            </div>
        )
    }//渲染
}

export default Echart