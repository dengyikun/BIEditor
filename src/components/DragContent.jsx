/**
 * Created by Loki on 2017/1/19.
 */
import React, {Component, PropTypes} from 'react'
import { Tag, Input, Tooltip, Button } from 'antd';

class DragContent extends Component {
    static propTypes = {}//props 类型检查

    static defaultProps = {}//默认 props

    constructor(props) {
        super(props)
        this.state = {
            tags: ['Unremovable', 'Tag 2', 'Tag 3'],
            inputVisible: false,
            inputValue: '',
        }
        alert('初始化 state')
    }//初始化 state



    handleClose = (removedTag) => {
        const tags = this.state.tags.filter(tag => tag !== removedTag);
        console.log(tags);
        this.setState({ tags });
    }

    showInput = () => {
        this.setState({ inputVisible: true }, () => this.input.focus());
    }

    handleInputChange = (e) => {
        this.setState({ inputValue: e.target.value });
    }

    handleInputConfirm = () => {
        const state = this.state;
        const inputValue = state.inputValue;
        let tags = state.tags;
        if (inputValue && tags.indexOf(inputValue) === -1) {
            tags = [...tags, inputValue];
        }
        console.log(tags);
        this.setState({
            tags,
            inputVisible: false,
            inputValue: '',
        });
    }

    saveInputRef = input => this.input = input

    render() {
        const { tags, inputVisible, inputValue } = this.state;
        return (
            <div className="content-wrapper">
                {tags.map((tag, index) => {
                    const isLongTag = tag.length > 20;
                    const tagElem = (
                        <Tag key={tag} closable={index !== 0} afterClose={() => this.handleClose(tag)}>
                            {isLongTag ? `${tag.slice(0, 20)}...` : tag}
                        </Tag>
                    );
                    return isLongTag ? <Tooltip title={tag}>{tagElem}</Tooltip> : tagElem;
                })}
                {inputVisible && (
                    <Input
                        ref={this.saveInputRef}
                        type="text" size="small"
                        style={{ width: 78 }}
                        value={inputValue}
                        onChange={this.handleInputChange}
                        onBlur={this.handleInputConfirm}
                        onPressEnter={this.handleInputConfirm}
                    />
                )}
                {!inputVisible && <Button size="small" type="dashed" onClick={this.showInput}>+ New Tag</Button>}
            </div>
        );
    }
}

export default DragContent