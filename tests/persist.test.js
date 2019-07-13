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

test('persists with value functions and filter', () => {
    let valueFunction = jest.fn();
    testPersistenceFilters({ include: ['test1'], valueFunctions: { test1: valueFunction }});
    let form = expect.objectContaining({ id: 'test' });
    expect(valueFunction).toHaveBeenCalledWith(form, 'value1');
    expect(valueFunction).toHaveBeenCalledTimes(1);
});

test('persists with include filter', () => {
    testPersistenceFilters({ include: ['test1'] });
});

test('persists with exclude filter', () => {
    testPersistenceFilters({ exclude: ['test2'] });
});

test('throws id error', () => {
    document.body.innerHTML = Forms.SimpleForm;
    expect(() => FormPersistence.persist(document.forms[0])).toThrow();
});

/**
 * Tests form persistence with support for options for maximum coverage
 */
function testPersistence(options={}) {
    let { newForm, window } = setupPersistenceTest(Forms.SimpleForm, options,
        form => form.elements['test'].value = 'test-value');
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

function testPersistenceFilters(options) {
    let { newForm } = setupPersistenceTest(Forms.ComplexForm, options, form => {
        form.elements['test1'].value = 'value1';
        form.elements['test2'].value = 'value2';
    });
    if (!options.valueFunctions) {
        expect(newForm.elements['test1'].value).toBe('value1');
        expect(newForm.elements['test2'].value).toBe('');
    }
}

function setupPersistenceTest(formSrc, options, setup) {
    options = Object.assign({}, { unload: 'unload' }, options);
    document.body.innerHTML = formSrc;
    let form = document.forms[0];
    options.uuid = 'test';
    FormPersistence.persist(form, options);
    setup(form);
    // prompt library to serialize and save form to local storage
    let window = document.defaultView;
    window.dispatchEvent(new Event(options.unload));
    // reset page with blank form and check that data loads as expected
    document.body.innerHTML = formSrc;
    // test with form.id instead of uuid
    let newForm = document.forms[0];
    newForm.id = 'test';
    delete options.uuid;
    FormPersistence.persist(newForm, options);
    return { newForm, window };
}