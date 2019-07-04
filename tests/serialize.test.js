import FormPersistence from '../form-persistence';
import * as Forms from './forms';

const formTests = [
    {
        label: 'serializes simple form',
        form: Forms.SimpleForm,
        setup: form => form.elements['test'].value = 'test-value',
        validate: data => data.toEqual({ test: ['test-value'] })
    },
    // External form test fails due to a bug in the version of jsdom used by jest.
    // See: https://github.com/facebook/jest/issues/8645
    /*{
        label: 'serializes external form',
        form: Forms.ExternalForm,
        setup: form => form.elements['test'].value = 'test-value',
        validate: data => data.toEqual({ test: ['test-value'] })
    },*/
    {
        label: 'serializes checkbox',
        form: Forms.CheckboxForm,
        setup: form => form.elements['test'].checked = true,
        validate: data => data.toEqual({ test: [true] })
    },
    {
        label: 'serializes radio input',
        form: Forms.RadioForm,
        setup: form => form.elements[1].checked = true,
        validate: data => data.toEqual({ test: ['B'] })
    },
    {
        label: 'serializes textarea',
        form: Forms.TextareaForm,
        setup: form => form.elements['test'].value = 'test-value',
        validate: data => data.toEqual({ test: ['test-value'] })
    },
    {
        label: 'serializes select',
        form: Forms.SelectForm,
        setup: form => form.elements['test'].value = 'a',
        validate: data => data.toEqual({ test: ['a'] })
    },
    {
        label: 'serializes select multiple',
        form: Forms.SelectMultipleForm,
        setup: form => {
            let select = form.elements['test'];
            select.children[0].selected = true;
            select.children[2].selected = true;
        },
        validate: data => data.toEqual({ test: ['a', 'c'] })
    },
    {
        label: 'does not serialize file',
        form: Forms.FileForm,
        setup: () => null,
        validate: data => data.toEqual({})
    },
    {
        label: 'does not serialize password',
        form: Forms.PasswordForm,
        setup: form => form.elements['test'].value = 'test-value',
        validate: data => data.toEqual({})
    }
];

formTests.forEach(formTest => {
    test(formTest.label, () => {
        document.body.innerHTML = formTest.form;
        let form = document.forms[0];
        formTest.setup(form);
        formTest.validate(expect(FormPersistence.serialize(form)));
    });
});