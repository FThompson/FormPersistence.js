const FormPersistence = require('../form-persistence');
const Forms = require('./forms');

test('persists form', () => {
    document.body.innerHTML = Forms.SimpleForm;
    let form = document.forms[0];
    FormPersistence.persist(form, { uuid: 'test' });
    form.elements['test'].value = 'test-value';
    // prompt library to serialize and save form to local storage
    document.defaultView.dispatchEvent(new Event('unload'));
    // reset page with blank form and check that data loads as expected
    document.body.innerHTML = Forms.SimpleForm;
    let newForm = document.forms[0];
    FormPersistence.persist(newForm, { uuid: 'test' });
    expect(newForm.elements['test'].value).toBe('test-value');
});

test('throws id error', () => {
    document.body.innerHTML = Forms.SimpleForm;
    expect(() => FormPersistence.persist(document.forms[0])).toThrow();
});