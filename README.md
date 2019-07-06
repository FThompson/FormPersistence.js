# HTML Form Persistence #
[![](https://img.shields.io/npm/v/form-persistence.svg)](https://www.npmjs.com/package/form-persistence)
[![](https://img.shields.io/bundlephobia/min/form-persistence.svg)](https://www.npmjs.com/package/form-persistence)
[![](https://img.shields.io/github/license/mashape/apistatus.svg)](LICENSE)

A simple library for preserving form values across page refreshes and multiple sessions.

## Installation

```
npm install form-persistence
```

```javascript
import FormPersistence from 'form-persistence';
```

Or include the script hosted on jsDelivr CDN or download and link the script directly.

```html
<script src='https://cdn.jsdelivr.net/gh/FThompson/FormPersistence.js@2.0.1/form-persistence.min.js'></script>
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

If your form has elements that are added to the page depending on selected data, you can set up custom **value functions** that are invoked when loading data into the persisted form. These functions are passed in the `options` object parameter. Other options include `uuid`, `useSessionStorage`, and `saveOnSubmit`. See details in the below API reference.

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

Pass the value functions to `FormPersistence.persist`.

```javascript
FormPersistence.persist(form, { valueFunctions: valueFunctions });
```

*Voila!* The `persist` function will now create tag elements upon loading the form's persisted data.

See the complete working example [here](https://jsfiddle.net/fthompson/jz25bfvd/). Change form values and refresh the page to observe persistence.

## API Reference

```javascript
FormPersistence.persist(form[, options])
```

Register a form for persistence. Values are saved to local or session storage on page refresh and optionally on form submission. Defaults to use local storage and clear form data on submit. Calling this function loads saved data into the form.

Options can include any of the following:
* `uuid` Define a custom storage key to avoid conflicts. If your form has an id, that id will be used by default. If your form does not have an id, you **must** define a `uuid` or an error will be thrown.
* `useSessionStorage` Use session storage if `true`, local storage if `false`. Local storage will be used by default.
* `saveOnSubmit` Save form data upon submit if `true`, clear form data upon submit if `false`. Default `false`.
* `valueFunctions` Provide special form value handling functions to be applied (in the order defined) instead of basic value insertion. This option must be an object containing key value pairs like `name: fn(form, value)`. This option can be necessary if your form has complex data elements that require special handling. See the above example for a detailed usage.

```javascript
FormPersistence.save(form[, options])
```

Save a form to local or session storage (default local storage). This function can be useful for saving forms at regular intervals to avoid losing progress, for example.

Options can include any of the following:
* `uuid` Define a custom storage key to avoid conflicts. If your form has an id, that id will be used by default. If your form does not have an id, you **must** define a `uuid` or an error will be thrown.
* `useSessionStorage` Use session storage if `true`, local storage if `false`. Local storage will be used by default.

```javascript
FormPersistence.load(form[, options])
```

Load a form from local or session storage (default local storage).

Options can include any of the following:
* `uuid` Define a custom storage key to avoid conflicts. If your form has an id, that id will be used by default. If your form does not have an id, you **must** define a `uuid` or an error will be thrown.
* `useSessionStorage` Use session storage if `true`, local storage if `false`. Local storage will be used by default.
* `valueFunctions` Provide special form value handling functions to be applied (in the order defined) instead of basic value insertion. This option must be an object containing key value pairs like `name: fn(form, value)`. This option can be necessary if your form has complex data elements that require special handling. See the above example for a detailed usage.

```javascript
FormPersistence.clearStorage(form[, options])
```

Clear a form's data from local or session storage (default local storage).

Options can include any of the following:
* `uuid` Define a custom storage key to avoid conflicts. If your form has an id, that id will be used by default. If your form does not have an id, you **must** define a `uuid` or an error will be thrown.
* `useSessionStorage` Use session storage if `true`, local storage if `false`. Local storage will be used by default.

```javascript
FormPersistence.serialize(form)
```

Serialize a form into an object, skipping password and file inputs. This function can be useful for storing form progress on a server rather than on the user's machine, for example.

```javascript
FormPersistence.deserialize(form, data[, options])
```

Load a form by deserializing a data object.

Options can include any of the following:
* `valueFunctions` Provide special form value handling functions to be applied (in the order defined) instead of basic value insertion. This option must be an object containing key value pairs like `name: fn(form, value)`. This option can be necessary if your form has complex data elements that require special handling. See the above example for a detailed usage.

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
FormPersistence.js relies on web storage for storing form data. All major browsers supported web storage by mid 2009 ([see caniuse](https://caniuse.com/#search=webstorage)), but if you need to support old browsers, I recommend adding the local storage imitation shown [here](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Local_storage) that uses cookies in place of web storage.

## Contributing

Found a bug? Have a question or suggestion? Please open an issue [here](https://github.com/FThompson/FormPersistence.js/issues).