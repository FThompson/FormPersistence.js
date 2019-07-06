const FormPersistence = require('../form-persistence');
const Forms = require('./forms');

test('persists form to local storage', () => {
    testPersistence();
});

test('persists form to session storage', () => {
    testPersistence({ useSessionStorage: true });
});

test('persists form and saves on submit', () => {
    testPersistence({ saveOnSubmit: true });
});

test('persists form with beforeunload event', () => {
    testPersistence({ unload: 'beforeunload' });
});

test('persists with value functions', () => {
    let valueFunction = jest.fn();
    testPersistence({ valueFunctions: { test: valueFunction }});
    let form = expect.objectContaining({ id: 'test' });
    expect(valueFunction).toHaveBeenCalledWith(form, 'test-value');
    expect(valueFunction).toHaveBeenCalledTimes(1);
});

test('throws id error', () => {
    document.body.innerHTML = Forms.SimpleForm;
    expect(() => FormPersistence.persist(document.forms[0])).toThrow();
});

/**
 * Tests form persistence with support for options for maximum coverage
 */
function testPersistence(options) {
    options = Object.assign({}, { unload: 'unload' }, options);
    document.body.innerHTML = Forms.SimpleForm;
    let form = document.forms[0];
    options.uuid = 'test'; // set a uuid on this form for identity
    FormPersistence.persist(form, options);
    form.elements['test'].value = 'test-value';
    // prompt library to serialize and save form to local storage
    let window = document.defaultView;
    window.dispatchEvent(new Event(options.unload));
    // reset page with blank form and check that data loads as expected
    document.body.innerHTML = Forms.SimpleForm;
    let newForm = document.forms[0];
    // test with form.id instead of uuid
    newForm.id = 'test';
    delete options.uuid;
    FormPersistence.persist(newForm, options);
    if (!options.valueFunctions) {
        expect(newForm.elements['test'].value).toBe('test-value');
    }
    // submit the form to test if storage is cleared 
    newForm.dispatchEvent(new Event('submit'));
    let storage = options.useSessionStorage ? window.sessionStorage : window.localStorage;
    if (options.saveOnSubmit) {
        expect(storage['form#test']).toBe(JSON.stringify({ test: ['test-value'] }));
    } else {
        expect(storage['form#test']).toBeUndefined();
    }
}