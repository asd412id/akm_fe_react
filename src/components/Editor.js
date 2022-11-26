import { Component } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import CustomEditor from 'ckeditor5-custom-build';

class Editor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editorHtml: props.value ?? '',
      disabled: props.disabled ?? false,
    };
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.value !== this.props.value) {
      this.setState({ editorHtml: this.props.value ?? '' });
    }
    if (prevProps.disabled !== this.props.disabled) {
      this.setState({ disabled: this.props.disabled ?? false });
    }
  }

  handleChange(event, editor) {
    const data = editor.getData();
    this.setState({ editorHtml: data });
    this.props.onChange(data);
  }

  render() {
    return (
      <CKEditor
        editor={CustomEditor}
        data={this.state.editorHtml}
        onChange={this.handleChange}
        disabled={this.state.disabled}
        placeholder={this.props.placeholder}
        config={{
          toolbar: {
            shouldNotGroupWhenFull: true
          }
        }}
      />
    );
  }
}

export default Editor;
