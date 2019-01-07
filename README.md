# HTML Form Persistence #

A simple API for preserving form values across multiple sessons.

## Usage ##

```javascript
FormPersistence.persist(form)
```

Register a form for persistence. Values are saved to local storage upon form submission.

```javascript
FormPersistence.save(form)
```

Save a form to local storage. Useful for saving forms at regular intervals to avoid losing progress, for example.

```javascript
FormPersistence.load(form[, valueFunctions])
```

Load a form from local storage. Optionally pass a dictionary of special form value handling functions like `name: fn(form, value)` which will be applied, in the order provided, instead of the basic value insertion. Useful if your form has complicated element structures that require special handling.

### Example ###

```html
<script src='form-persistence.js' type='text/javascript'></script>
<script type='text/javascript'>
    window.addEventListener('load', () => {
        let form = document.getElementById('test-form')
        FormPersistence.persist(form)
        FormPersistence.load(form)
    })
</script>
```


---

### Compatibility ###

Uses modern JavaScript features (up to ECMAScript 2016) like the `of` operator. Use a compiler like [Babel](https://github.com/babel/babel) if you need to support IE users.

### Known issues / Limitations ###

May not support some element types.

Verified to support the following types:
* `<input>`
    * `text`
    * `checkbox`
    * `radio`
    * `hidden`
    * `submit`
* `<textarea>`
* External form elements (via `form='form-id'`) of the above types.