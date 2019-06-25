# HTML Form Persistence #
![](https://img.shields.io/github/release/FThompson/FormPersistence.js.svg)
[![](https://img.shields.io/github/license/mashape/apistatus.svg)](LICENSE)

A simple API for preserving form values across page refreshes and multiple sessions.

## Installation

Include the script hosted on [jsDelivr CDN](https://www.jsdelivr.com/package/gh/FThompson/FormPersistence.js).

```html
<script src='https://cdn.jsdelivr.net/gh/FThompson/FormPersistence.js@1.0.2/form-persistence.min.js'></script>
```

Or [download the script](https://github.com/FThompson/FormPersistence.js/blob/master/form-persistence.js) and include it on your page.

```html
<script src='form-persistence.js'></script>
```

## Usage

The FormPersistence module's main function is `FormPersistence.persist`, which persists a form across refreshes or sessions.

```javascript
let form = document.getElementById('test-form');
FormPersistence.persist(form);
```

`FormPersistence.persist` loads saved form data into the form and sets up event handlers that take care of saving form data. By default, form data is saved to local storage and cleared upon form submission.

Ensure that you call `persist` after the document has finished loading, either by using an `onLoad` event handler or by adding `defer` to the script import.

### What if my form has complex elements that require custom data loading?

If your form has elements that are added to the page depending on selected data, you can set up custom **value functions** that are invoked when loading data into the persisted form. These functions are passed to `persist` through its fourth parameter. The second and third parameters are `useSessionStorage` (default false, save to local storage) and `saveOnSubmit` (default false, clear storage on submit).

The `valueFunctions` parameter takes a dictionary object where the keys are form data names and the values are functions that handle loading in the values for those data names.

```javascript
let formValueFunctions = {
    name: callback(form, value)
};
```

#### Custom Value Functions Example

Consider a post submission form that takes a title, a post body, and a set of tags describing the post.

```html
<form id='create-post'>
    <div>
        <label for='title'>Title</label>
        <input type='text' name='title' id='title'>
    </div>
    <div>
        <label for='post-body'>Body</label>
        <textarea name='post-body' id='post-body'></textarea>
    </div>
    <div>
        <label for='tags'>Tags</label>
        <input type='text' id='tag-input'><button type='button' id='add-tag'>Add</button>
        <div id='added-tags'></div>
    </div>
    <input type='submit'>
</form>
```

You want users to be able to remove tags they have added, so you create a script that adds a span with each selected tag and a button to remove that tag. You add tags to the form's data as `span` elements each containing a hidden `input` element containing the tag to be submitted in the form's data.

```javascript
document.getElementById('add-tag').addEventListener('click', addTag);

function addTag() {
    let tagsBox = document.getElementById('tag-input');
    createTag(tagsBox.value);
    tagsBox.value = '';
}

function createTag(tag) {
    let tagsDiv = document.getElementById('added-tags');
    let tagElement = document.createElement('span');
    tagElement.textContent = tag;
    tagsDiv.appendChild(tagElement);
    let removeElement = document.createElement('a');
    removeElement.textContent = '\u274c';
    removeElement.addEventListener('click', () => tagsDiv.removeChild(tagElement));
    tagElement.appendChild(removeElement);
    let tagValue = document.createElement('input');
    tagValue.setAttribute('type', 'hidden');
    tagValue.setAttribute('name', 'tag');
    tagValue.value = tag;
    tagElement.appendChild(tagValue);
}
```

If you try to set up form persistence normally on this form, the script would not create the tag because the script would unable to find any inputs named `tag` in the document. This scenario requires custom value functions.

```javascript
let valueFunctions = {
    'tag': (form, value) => createTag(value)
};
```

Pass the value functions to `FormPersistence.persist` and keep the default values of `false` for both `useSessionStorage` and `saveOnSubmit` parameters.

```javascript
FormPersistence.persist(form, false, false, valueFunctions);
```

*Voila!* The `persist` function will now create tag elements upon loading the form's persisted data.

See the complete working example [here](https://jsfiddle.net/fthompson/jz25bfvd/). Change form values and refresh the page to observe persistence.

## API Reference

```javascript
FormPersistence.persist(form[, useSessionStorage[, saveOnSubmit[, valueFunctions]]])
```

Register a form for persistence. Values are saved to local or session storage on page refresh and optionally on form submission. Default behavior is to use local storage and clear storage upon form submission. Calling this function loads saved data into the form.

Optionally pass a dictionary of special form value handling functions like `name: fn(form, value)` which will be applied (in the order provided) instead of basic value insertion. The `valueFunctions` parameter is useful if your form has complex data elements that require special handling.

```javascript
FormPersistence.save(form[, useSessionStorage])
```

Save a form to local or session storage (default local storage). This function can be useful for saving forms at regular intervals to avoid losing progress, for example.

```javascript
FormPersistence.load(form[, useSessionStorage[, valueFunctions]])
```

Load a form from local or session storage (default local storage). Optionally pass a dictionary of special form value handling functions like `name: fn(form, value)`.

```javascript
FormPersistence.clearStorage(form[, useSessionStorage])
```

Clear a form's data from local or session storage (default local storage).

```javascript
FormPersistence.serialize(form)
```

Serialize a form into an object, skipping password and file inputs. This function can be useful for saving form progress on a server rather than on the user's machine, for example.

```javascript
FormPersistence.deserialize(form, data[, valueFunctions])
```

Load a form by deserializing a data object. Optionally pass a dictionary of special form value handling functions like `name: fn(form, value)`.

---

## Compatibility

Uses modern JavaScript features (ECMAScript 2016). Use a compiler like [Babel](https://github.com/babel/babel) if you need to support legacy users.

This script supports the following content:
* All `<input>` types excluding specific exemptions:
    * `file` type elements are ignored. Browsers do not allow file input values to be set for security reasons.
    * `password` type elements are ignored to avoid saving passwords in local storage.
    * `submit` type elements are ignored. This tag's values should not need to be set upon load.
    * `button`, `reset`, and `image` type elements are ignored. These tags' values are not form data.
* `<textarea>`
* `<select>` and `<select multiple>`
* `<button>` elements are ignored. This tag's values should not need to be set upon load.
* Array form inputs.
* External form elements via `form='form-id'` attributes.

### Browsers
`FormPersistence.js` currently does not support Microsoft Edge versions before November 2018 or Internet Explorer.

## Contributing

Found a bug? Have a question or suggestion? Please open an issue [here](https://github.com/FThompson/FormPersistence.js/issues).