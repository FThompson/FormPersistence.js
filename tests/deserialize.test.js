const FormPersistence = require('../form-persistence');
const Forms = require('./forms');

const formTests = [
    {
        label: 'deserializes simple form',
        form: Forms.SimpleForm,
        data: { test: ['test-value'] },
        validate: form => form.elements['test'].value === 'test-value'
    },
    // External form test fails due to a bug in the version of jsdom used by jest.
    // See: https://github.com/facebook/jest/issues/8645
    // See: https://github.com/jsdom/jsdom/issues/2628
    // {
    //     label: 'deserializes external form',
    //     form: Forms.ExternalForm,
    //     data: { test: ['test-value'] },
    //     validate: form => form.elements['test'].value === 'test-value'
    // },
    {
        label: 'deserializes checkbox',
        form: Forms.CheckboxForm,
        data: { test: [true] },
        validate: form => form.elements['test'].checked
    },
    {
        label: 'deserializes radio input',
        form: Forms.RadioForm,
        data: { test: ['b']},
        validate: form => form.elements[1].checked
    },
    {
        label: 'deserializes textarea',
        form: Forms.TextareaForm,
        data: { test: ['test-value'] },
        validate: form => form.elements['test'].value === 'test-value'
    },
    {
        label: 'deserializes select',
        form: Forms.SelectForm,
        data: { test: ['a'] },
        validate: form => form.elements['test'].value === 'a'
    },
    {
        label: 'deserializes select multiple',
        form: Forms.SelectMultipleForm,
        data: { test: ['a', 'c']},
        validate: form => {
            let select = form.elements['test'];
            return select.children[0].selected && select.children[2].selected;
        }
    },
    {
        label: 'deserializes included names',
        form: Forms.ComplexForm,
        data: { test1: ['value1'], test2: ['value2'] },
        validate: form => {
            return form.elements['test1'].value === 'value1'
                && form.elements['test2'].value === ''
        },
        options: { include: ['test1'] }
    }
];

formTests.forEach(formTest => {
    test(formTest.label, () => {
        document.body.innerHTML = formTest.form;
        let form = document.forms[0];
        FormPersistence.deserialize(form, formTest.data, formTest.options);
        expect(formTest.validate(form)).toBeTruthy();
    });
});