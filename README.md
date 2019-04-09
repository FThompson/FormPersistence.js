# HTML Form Persistence #
[![](https://img.shields.io/github/license/mashape/apistatus.svg)](LICENSE)

A simple API for preserving form values across multiple sessons.

Kindly hosted by jsDelivr: https://cdn.jsdelivr.net/gh/FThompson/FormPersistence.js@1.0.0/form-persistence.js

```html
<script src='https://cdn.jsdelivr.net/gh/FThompson/FormPersistence.js@1.0.0/form-persistence.js' type='text/javascript'></script>
```

### Example ###

```javascript
window.addEventListener('load', () => {
    let form = document.getElementById('test-form')
    FormPersistence.persist(form)
})
```

See a complete working example [here](https://jsfiddle.net/fthompson/xa62drsh/). Change form values, press submit, and then refresh the page to observe persistence.

## Usage ##

```javascript
FormPersistence.persist(form[, useSessionStorage[, saveOnSubmit]])
```

Register a form for persistence. Values are saved to local (default) or session storage upon page refresh and optionally upon form submission (default behavior is to clear storage upon submission). Calling this function loads saved data into the form.

```javascript
FormPersistence.save(form[, useSessionStorage])
```

Save a form to local (default) or session storage. Useful for saving forms at regular intervals to avoid losing progress, for example.

```javascript
FormPersistence.load(form[, useSessionStorage[, valueFunctions]])
```

Load a form from local (default) or session storage. Optionally pass a dictionary of special form value handling functions like `name: fn(form, value)` which will be applied, in the order provided, instead of the basic value insertion. Useful if your form has complicated element structures that require special handling.

```javascript
FormPersistence.clearStorage(form[, useSessionStorage])
```

Clear a form's data from local (default) or session storage.

---

### Compatibility ###

Uses modern JavaScript features (up to ECMAScript 2016) like the `of` operator. Use a compiler like [Babel](https://github.com/babel/babel) if you need to support IE/legacy users.

Verified to support the following content:
* All `<input>` types
    * `file` is ignored. Browsers do not allow file input values to be set for security reasons.
    * `password` is ignored to avoid saving passwords in local storage.
    * `submit` is ignored. Their values should not need to be set upon load.
    * `button`, `reset`, and `image` types are ignored. Their values are not form data.
* `<textarea>`
* `<select>` and `<select multiple>`
* `<button>` elements are ignored. Their values should not need to be set upon load.
* Array form inputs.
* External form elements via `form='form-id'`.