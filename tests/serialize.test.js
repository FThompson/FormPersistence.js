const FormPersistence = require('../form-persistence');
const Forms = require('./forms');

const formTests = [
    {
        label: 'serializes simple form',
        form: Forms.SimpleForm,
        setup: form => form.elements['test'].value = 'test-value',
        validate: data => expect(data).toEqual({ test: ['test-value'] })
    },
    // External form test fails due to a bug in jsdom.
    // See: https://github.com/facebook/jest/issues/8645
    // See: https://github.com/jsdom/jsdom/issues/2628
    // {
    //     label: 'serializes external form',
    //     form: Forms.ExternalForm,
    //     setup: form => form.elements['test'].value = 'test-value',
    //     validate: data => expect(data).toEqual({ test: ['test-value'] })
    // },
    {
        label: 'serializes checkbox',
        form: Forms.CheckboxForm,
        setup: form => form.elements['test'].checked = true,
        validate: data => expect(data).toEqual({ test: [true] })
    },
    {
        label: 'serializes radio input',
        form: Forms.RadioForm,
        setup: form => form.elements[1].checked = true,
        validate: data => expect(data).toEqual({ test: ['b'] })
    },
    {
        label: 'serializes textarea',
        form: Forms.TextareaForm,
        setup: form => form.elements['test'].value = 'test-value',
        validate: data => expect(data).toEqual({ test: ['test-value'] })
    },
    {
        label: 'serializes select',
        form: Forms.SelectForm,
        setup: form => form.elements['test'].value = 'a',
        validate: data => expect(data).toEqual({ test: ['a'] })
    },
    {
        label: 'serializes select multiple',
        form: Forms.SelectMultipleForm,
        setup: form => {
            let select = form.elements['test'];
            select.children[0].selected = true;
            select.children[2].selected = true;
        },
        validate: data => expect(data).toEqual({ test: ['a', 'c'] })
    },
    {
        label: 'does not serialize file',
        form: Forms.FileForm,
        setup: () => null,
        validate: data => expect(data).toEqual({})
    },
    {
        label: 'does not serialize password',
        form: Forms.PasswordForm,
        setup: form => form.elements['test'].value = 'test-value',
        validate: data => expect(data).toEqual({})
    },
    {
        label: 'serializes included names',
        form: Forms.ComplexForm,
        setup: form => {
            form.elements['test1'].value = 'value1';
            form.elements['test2'].value = 'value2';
        },
        validate: data => expect(data).toEqual({ test1: ['value1'] }),
        options: { include: ['test1'] }
    },
    {
        label: 'does not serialize excluded names',
        form: Forms.ComplexForm,
        setup: form => {
            form.elements['test1'].value = 'value1';
            form.elements['test2'].value = 'value2';
        },
        validate: data => expect(data).toEqual({ test1: ['value1'] }),
        options: { exclude: ['test2'] }
    }
];

formTests.forEach(formTest => {
    test(formTest.label, () => {
        document.body.innerHTML = formTest.form;
        let form = document.forms[0];
        formTest.setup(form);
        formTest.validate(FormPersistence.serialize(form, formTest.options));
    });
});