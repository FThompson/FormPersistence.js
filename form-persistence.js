/**
 * Copyright (c) 2019 Finn Thompson, licensed under the MIT License.
 * 
 * This module implements form persistence across sessions via local storage.
 * * Register a form for persistence with `FormPersistence#persist(form[, options])`.
 * * Save a form to local storage with `FormPersistence#save(form[, options])`.
 * * Load a saved form (e.g. at window load time) with `FormPersistence#load(form[, options])`.
 * * Clear saved form data with `FormPersistence#clearStorage(form[, options])`.
 * * Serialize form data to an object with `FormPersistence#serialize(form[, options])`.
 * * Deserialize a data object into a form with `FormPersistence#deserialize(form, data[, options])`.
 * 
 * See https://github.com/FThompson/FormPersistence.js
 */
const FormPersistence = (function() {
    /**
     * Registers the given form for persistence by saving its data to local or session storage.
     * Saved form data will be stored upon page refresh and cleared upon form submission.
     * Saved form data will be loaded upon calling this function, typically on page load.
     * 
     * @param {HTMLFormElement} form    The form to make persistent.
     * @param {Object}          options Options object containing any of the following:
     *  * uuid - A unique identifier for this form's storage key.
     *           Required if using a form without an id. If unspecified, form id will be used.
     *  * useSessionStorage - Use session storage if `true`, local storage if `false`. Default `false`.
     *  * saveOnSubmit - Save form data upon submit if `true`. Default `false`.
     *  * valueFunctions - Special value functions to apply, like `name: fn(form, value)`.
     *  * include - Define a whitelist array of data names to include.
     *  * exclude - Define a blacklist array of data names to exclude.
     */
    function persist(form, options) {
        let defaults = {
            saveOnSubmit: false
        }
        let config = Object.assign({}, defaults, options)
        load(form, config)
        // Some devices like ios safari do not support beforeunload events.
        // Unload event does not work in some situations, so we use both unload/beforeunload
        // and remove the unload event if the beforeunload event fires successfully.
        // If problems persist, we can add listeners on the pagehide event as well.
        let saveForm = () => save(form, config)
        let saveFormBeforeUnload = () => {
            window.removeEventListener('unload', saveForm)
            saveForm()
        }
        window.addEventListener('beforeunload', saveFormBeforeUnload)
        window.addEventListener('unload', saveForm)
        if (!config.saveOnSubmit) {
            form.addEventListener('submit', () => {
                window.removeEventListener('beforeunload', saveFormBeforeUnload)
                window.removeEventListener('unload', saveForm)
                clearStorage(form, config)
            })
        }
    }

    /**
     * Serializes the given form into an object, excluding password and file inputs.
     * 
     * @param {HTMLFormElement} form    The form to serialize.
     * @param {Object}          options Options object containing any of the following:
     *  * include - Define a whitelist array of data names to include.
     *  * exclude - Define a blacklist array of data names to exclude.
     * 
     * @return {Object} The serialized data object.
     */
    function serialize(form, options) {
        let defaults = {
            include: [],
            exclude: []
        }
        let config = Object.assign({}, defaults, options)
        let data = {}
        for (let element of form.elements) {
            let tag = element.tagName
            let type = element.type
            if (tag === 'INPUT' && (type === 'password' || type === 'file')) {
                continue // do not serialize passwords or files
            }
            if (isNameFiltered(element.name, config.include, config.exclude)) {
                continue
            }
            if (tag === 'INPUT') {
                let type = element.type
                if (type === 'radio') {
                    if (element.checked) {
                        pushToArray(data, element.name, element.value)
                    }
                } else if (type === 'checkbox') {
                    pushToArray(data, element.name, element.checked)
                } else {
                    pushToArray(data, element.name, element.value)
                }
            } else if (tag === 'TEXTAREA') {
                pushToArray(data, element.name, element.value)
            } else if (tag === 'SELECT') {
                if (element.multiple) {
                    for (let option of element.options) {
                        if (option.selected) {
                            pushToArray(data, element.name, option.value)
                        }
                    }
                } else {
                    pushToArray(data, element.name, element.value)
                }
            }
        }
        return data
    }

    /**
     * Add a value to an object, creating an array to place it in if needed.
     */
    function pushToArray(dict, key, value) {
        if (!(key in dict)) {
            dict[key] = []
        }
        dict[key].push(value)
    }

    /**
     * Checks if the given name should be filtered out.
     * 
     * @param {String} name    The name of the element to check for.
     * @param {Array}  include The list of names to include.
     * @param {Array}  exclude The list of names to exclude.
     */
    function isNameFiltered(name, include, exclude) {
        if (!name) {
            return true
        }
        if (exclude.includes(name)) {
            return true
        }
        if (include.length > 0 && !include.includes(name)) {
            return true
        }
        return false
    }

    /**
     * Saves the given form to local or session storage.
     * 
     * @param {HTMLFormElement} form    The form to serialize to local storage.
     * @param {Object}          options Options object containing any of the following:
     *  * uuid - A unique identifier for this form's storage key.
     *           Required if using a form without an id. If unspecified, form id will be used.
     *  * useSessionStorage - Use session storage if `true`, local storage if `false`. Default `false`.
     *  * include - Define a whitelist array of data names to include.
     *  * exclude - Define a blacklist array of data names to exclude.
     */
    function save(form, options) {
        let defaults = {
            uuid: null,
            useSessionStorage: false
        }
        let config = Object.assign({}, defaults, options)
        let data = serialize(form, config)
        let storage = config.useSessionStorage ? sessionStorage : localStorage
        storage.setItem(getStorageKey(form, config.uuid), JSON.stringify(data))
    }

    /**
     * Loads a given form by deserializing given data, optionally with given special value handling functions.
     * 
     * @param {HTMLFormElement} form    The form to deserialize data into.
     * @param {Object}          data    The data object to deserialize into the form.
     * @param {Object}          options Options object containing any of the following:
     *  * valueFunctions - Special value functions to apply, like `name: fn(form, value)`.
     *  * include - Define a whitelist array of data names to include.
     *  * exclude - Define a blacklist array of data names to exclude.
     */
    function deserialize(form, data, options) {
        let defaults = {
            valueFunctions: null,
            include: [],
            exclude: []
        }
        let config = Object.assign({}, defaults, options)
        // apply given value functions first
        let speciallyHandled = []
        if (config.valueFunctions !== null) {
            speciallyHandled = applySpecialHandlers(data, form, config)
        }
        // fill remaining values normally
        for (let name in data) {
            if (isNameFiltered(name, config.include, config.exclude)) {
                continue
            }
            if (!speciallyHandled.includes(name)) {
                let inputs = [...form.elements].filter(elem => elem.name === name)
                inputs.forEach((input, i) => {
                    applyValues(input, data[name], i)
                })
            }
        }
    }

    /**
     * Loads a given form from local or session storage, optionally with given special value handling functions.
     * Does nothing if no saved values are found.
     * 
     * @param {HTMLFormElement} form    The form to load saved values into.
     * @param {Object}          options Options object containing any of the following:
     *  * uuid - A unique identifier for this form's storage key.
     *           Required if using a form without an id. If unspecified, form id will be used.
     *  * useSessionStorage - Use session storage if `true`, local storage if `false`. Default `false`.
     *  * valueFunctions - Special value functions to apply, like `name: fn(form, value)`.
     *  * include - Define a whitelist array of data names to include.
     *  * exclude - Define a blacklist array of data names to exclude.
     */
    function load(form, options) {
        let defaults = {
            uuid: null,
            useSessionStorage: false
        }
        let config = Object.assign({}, defaults, options)
        let storage = config.useSessionStorage ? sessionStorage : localStorage
        let json = storage.getItem(getStorageKey(form, config.uuid))
        if (json) {
            let data = JSON.parse(json)
            deserialize(form, data, options)
        }
    }

    /**
     * Clears a given form's data from local or session storage.
     * 
     * @param {HTMLFormElement} form              The form to clear stored data for.
     * @param {Object}          options Options object containing any of the following:
     *  * uuid - A unique identifier for this form's storage key.
     *           Required if using a form without an id. If unspecified, form id will be used.
     *  * useSessionStorage - Use session storage if `true`, local storage if `false`. Default `false`.
     */
    function clearStorage(form, options) {
        let defaults = {
            uuid: null,
            useSessionStorage: false
        }
        let config = Object.assign({}, defaults, options)
        let storage = config.useSessionStorage ? sessionStorage : localStorage
        storage.removeItem(getStorageKey(form, config.uuid))
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
    function applyValues(element, values, index) {
        let tag = element.tagName
        if (tag === 'INPUT') {
            let type = element.type
            if (type === 'radio') {
                element.checked = (element.value === values[0])
            } else if (type === 'checkbox') {
                element.checked = values[0]
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
    function applySpecialHandlers(data, form, options) {
        let speciallyHandled = []
        for (let fnName in options.valueFunctions) {
            if (fnName in data) {
                if (isNameFiltered(fnName, options.include, options.exclude)) {
                    continue
                }
                for (let value of data[fnName]) {
                    options.valueFunctions[fnName](form, value)
                }
                speciallyHandled.push(fnName)
            }
        }
        return speciallyHandled
    }

    /**
     * Creates a local storage key for the given form.
     * 
     * @param {HTMLFormElement} form The form to create a storage key for.
     * 
     * @return {String} The unique form storage key.
     * @throws {Error} If given a form without an id or uuid.
     */
    function getStorageKey(form, uuid) {
        if (!uuid && !form.id) {
            throw Error('form persistence requires a form id or uuid')
        }
        return 'form#' + (uuid ? uuid : form.id)
    }

    /**
     * Return the public interface of FormPersistence.
     */
    return {
        persist: persist,
        load: load,
        save: save,
        clearStorage: clearStorage,
        serialize: serialize,
        deserialize: deserialize
    }
})();

/**
 * Export the module if applicable.
 */
(function() {
    // istanbul ignore else
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = exports = FormPersistence
    }
})();