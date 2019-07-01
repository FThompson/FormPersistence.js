import React from '../node_modules/react';
import ReactDOM from '../node_modules/react-dom';
import FormPersistence from './form-persistence.js';
import './TestForm.css';

export default class TestForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = { tags: [] };
    this.tagInput = React.createRef();
    this.addCurrentTag = this.addCurrentTag.bind(this);
    this.removeTag = this.removeTag.bind(this);
  }

  addCurrentTag() {
    this.addTag(this.tagInput.current.value);
  }

  addTag(tag) {
    if (!this.state.tags.includes(tag)) {
      this.setState(state => ({ tags: [...state.tags, tag] }));
      this.tagInput.current.value = '';
    }
  }

  removeTag(tag) {
    this.setState(state => ({ tags: state.tags.filter(t => t !== tag) }));
  }

  refreshPage() {
    window.location.reload(true);
  }

  componentDidMount() {
    let form = ReactDOM.findDOMNode(this);
    FormPersistence.persist(form, false, false, {
      'tag': (form, value) => this.addTag(value)
    });
  }

  render() {
    let tags = this.state.tags.map(tag => (
      <span key={tag}>
        {tag}
        <a onClick={() => this.removeTag(tag)}>{'\u274c'}</a>
        <input type='hidden' name='tag' value={tag} />
      </span>
    ));
    return (
      <form id='create-post'>
        <div>
          <label htmlFor='title'>Title</label>
          <input type='text' name='title' id='title' />
        </div>
        <div>
          <label htmlFor='post-body'>Body</label>
          <textarea name='post-body' id='post-body'></textarea>
        </div>
        <div>
          <label htmlFor='tags'>Tags</label>
          <input
            type='text'
            id='tag-input'
            ref={this.tagInput} />
          <button
            type='button'
            id='add-tag'
            onClick={this.addCurrentTag}>
              Add
          </button>
          <div id='added-tags'>{tags}</div>
        </div>
        <div>
          <button
            type='button'
            id='refresh'
            onClick={this.refreshPage}>
              Refresh Page
          </button>
          <input type='submit' />
        </div>
      </form>
    );
  }
}