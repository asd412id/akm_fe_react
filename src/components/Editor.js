import { Component } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import ImageResize from 'quill-image-resize-module-react';

Quill.register('modules/imageResize', ImageResize);

/*
 * Simple editor component that takes placeholder text as a prop
 */
class Editor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editorHtml: props.value ?? '',
      readOnly: props.readOnly ?? false,
    };
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.value !== this.props.value) {
      this.setState({ editorHtml: this.props.value ?? '' });
    }
    if (prevProps.readOnly !== this.props.readOnly) {
      this.setState({ readOnly: this.props.readOnly ?? false });
    }
  }

  handleChange(html) {
    this.setState({ editorHtml: html });
    this.props.onChange(html);
  }

  render() {
    return (
      <ReactQuill
        theme={this.state.theme}
        onChange={this.handleChange}
        value={this.state.editorHtml}
        modules={Editor.modules}
        formats={Editor.formats}
        bounds={'#root'}
        placeholder={this.props.placeholder}
        readOnly={this.state.readOnly}
      />
    );
  }
}

/*
 * Quill modules to attach to editor
 * See https://quilljs.com/docs/modules/ for complete options
 */
Editor.modules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6] }],
    [{ align: ['', 'center', 'right', 'justify'] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [
      { list: 'ordered' },
      { list: 'bullet' },
      { indent: '-1' },
      { indent: '+1' }
    ],
    [{ color: [] }, { background: [] }],
    ['link', 'image', 'video'],
    ['clean']
  ],
  clipboard: {
    // toggle to add extra line breaks when pasting HTML:
    matchVisual: false
  },
  imageResize: {
    parchment: Quill.import('parchment'),
    modules: ['Resize', 'DisplaySize']
  }
};

/*
 * Quill editor formats
 * See https://quilljs.com/docs/formats/
 */
Editor.formats = [
  'header',
  'align',
  'bold',
  'italic',
  'underline',
  'strike',
  'blockquote',
  'list',
  'bullet',
  'indent',
  'link',
  'image',
  'color',
  'background',
  'video'
];

export default Editor;
