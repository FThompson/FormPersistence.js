/**
 * This module implements form persistence across sessions via local storage.
 * * Register a form for persistence with `FormPersistence#persist(form)`.
 * * Save a form to local storage with `FormPersistence#save(form)`.
 * * Load a saved form (e.g. at window load time) with `FormPersistence#load(form, valueFunctions)`.
 * 
 * Uses module pattern per https://yuiblog.com/blog/2007/06/12/module-pattern/.
 */
let FormPersistence = (() => {
    /**
     * Registers the given form for persistence and saves its data to local storage upon submission.
     * 
     * @param {HTMLFormElement} form The form to make persistent.
     */
    function persist(form) {
        form.addEventListener('submit', () => save(form))
    }

    /**
     * Saves the given form to local storage.
     * 
     * @param {HTMLFormElement} form The form to serialize to local storage.
     */
    function save(form) {
        let data = {}
        let formData = new FormData(form)
        for (let key of formData.keys()) {
            let values = formData.getAll(key)
            for (let value of values) {
                if (value.constructor.name !== 'File') {
                    if (!(key in data)) {
                        data[key] = []
                    }
                    data[key].push(value)
                }
            }
        }
        localStorage.setItem(getStorageKey(form), JSON.stringify(data))
    }

    /**
     * Loads a given form from local storage, optionally with given special value handling functions.
     * Does nothing if no saved values are found.
     * 
     * @param {HTMLFormElement} form           The form to load saved values into.
     * @param {Object}          valueFunctions The special value functions, like `name: fn(form, value)`.
     */
    function load(form, valueFunctions) {
        let json = localStorage.getItem(getStorageKey(form))
        if (json) {
            let data = JSON.parse(json)
            // apply given value functions first
            let speciallyHandled = []
            if (valueFunctions !== undefined) {
                speciallyHandled = applySpecialHandlers(data, form, valueFunctions)
            }
            // fill remaining values normally
            let checkedBoxes = []
            for (let name in data) {
                if (!speciallyHandled.includes(name)) {
                    let inputs = getDataElements(form.id, name)
                    inputs.forEach((input, i) => {
                        applyValues(input, data[name], i, checkedBoxes)
                    })
                }
            }
            // unchecked boxes are not included in form data, handle them separately
            uncheckBoxes(form, checkedBoxes)
        }
    }

    /**
     * Selects the given form's data elements in the document with a given name.
     * 
     * @param {String} formID The id of the form.
     * @param {String} name   The name of the input-like tag to select for.
     */
    function getDataElements(formID, name) {
        let buildInternalSelector = (tag) => `form#${formID} ${tag}[name="${name}"]`
        let buildExternalSelector = (tag) => `${tag}[name="${name}"][form="${formID}"]`
        let selectors = [
            buildInternalSelector('input'),
            buildInternalSelector('textarea'),
            buildInternalSelector('select'),
            buildExternalSelector('input'),
            buildExternalSelector('textarea'),
            buildExternalSelector('select')
        ]
        return document.querySelectorAll(selectors.join())
    }

    /**
     * Applies the given values to the given element.
     * Adds any checkbox elements checked to the given array.
     * 
     * @param {HTMLElement} element The element to apply values to.
     * @param {Array} values        The array of values. Some element types use the first element instead of the index.
     * @param {Number} index        The index of the value array to apply if applicable.
     * @param {Array} checkedBoxes  The array of checkboxes to add any clicked checkboxes to.
     */
    function applyValues(element, values, index, checkedBoxes) {
        let tag = element.tagName
        if (tag === 'INPUT') {
            let type = element.type
            if (type === 'radio') {
                applyCheckedValue(element, values[0])
            } else if (type === 'checkbox') {
                applyCheckedValue(element, values[index])
                checkedBoxes.push(element)
            } else {
                element.value = values[index]
            }
        } else if (tag === 'TEXTAREA') {
            element.value = values[index]
        } else if (tag === 'SELECT') {
            if (element.multiple) {
                for (let option of element.options) {
                    option.selected = values.includes(option.value)
                }
            } else {
                element.value = values[index]
            }
        }
    }

    /**
     * Runs given value handling functions in place of basic value insertion.
     * 
     * @param {Object}          data           The form data being loaded.
     * @param {HTMLFormElement} form           The HTML form being loaded.
     * @param {Object}          valueFunctions The special value functions, like `name: fn(form, value)`.
     * 
     * @return {Array} An array containing the data entry names that were handled.
     */
    function applySpecialHandlers(data, form, valueFunctions) {
        let speciallyHandled = []
        for (let fnName in valueFunctions) {
            if (fnName in data) {
                for (let value of data[fnName]) {
                    valueFunctions[fnName](form, value)
                }
                speciallyHandled.push(fnName)
            }
        }
        return speciallyHandled
    }

    /**
     * Clicks the given input element if it matches the given value and is not already checked.
     * 
     * @param {HTMLInputElement} inputElement The radio or checkbox input element to click if applicable.
     * @param {String}           value        The value to check against.
     */
    function applyCheckedValue(inputElement, value) {
        if (inputElement.value === value && !inputElement.checked) {
            inputElement.click()
        }
    }

    /**
     * Unchecks all checkboxes in the given form unless they exist in the given array.
     * This check is necessary because unchecked boxes are not included in form data.
     * 
     * @param {HTMLFormElement} form             The form to clear checked boxes from.
     * @param {Array}           checkboxesToSkip The list of checkboxes to skip because they have already been checked.
     */
    function uncheckBoxes(form, checkboxesToSkip) {
        let checkboxes = form.querySelectorAll('input[type="checkbox"]')
        for (let checkbox of checkboxes) {
            if (!checkboxesToSkip.includes(checkbox) && checkbox.checked) {
                checkbox.click()
            }
        }
    }

    /**
     * Creates a local storage key for the given form.
     * 
     * @param {HTMLFormElement} form The form to create a storage key for.
     */
    function getStorageKey(form) {
        return 'form#' + form.id
    }

    /**
     * Return the public interface of FormPersistence.
     */
    return {
        persist: persist,
        load: load,
        save: save
    }
})()
