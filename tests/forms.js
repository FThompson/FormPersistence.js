const SimpleForm = `
    <form>
        <input type='text' name='test' />
    </form>
`;

const ExternalForm = `
    <form id='test-form'></form>
    <input type='text' name='test' form='test-form' />
`;

const CheckboxForm = `
    <form>
        <input type='checkbox' name='test' />
    </form>
`;

const RadioForm = `
    <form>
        <input type='radio' name='test' value='a' checked />
        <input type='radio' name='test' value='b' />
    </form>
`;

const TextareaForm = `
    <form>
        <textarea name='test' />
    </form>
`;

const SelectForm = `
    <form>
        <select name='test'>
            <option value='a'>A</option>
            <option value='b'>B</option>
        </select>
    </form>
`;

const SelectMultipleForm = `
    <form>
        <select name='test' multiple='multiple'>
            <option value='a'>A</option>
            <option value='b'>B</option>
            <option value='c'>C</option>
        </select>
    </form>
`;

const FileForm = `
    <form>
        <input type='file' name='test' />
    </form>
`;

const PasswordForm = `
    <form>
        <input type='password' name='test' />
    </form>
`;

const ComplexForm = `
    <form>
        <input type='text' name='test1' />
        <input type='text' name='test2' />
    </form>
`;

module.exports = {
    SimpleForm,
    ExternalForm,
    CheckboxForm,
    RadioForm,
    TextareaForm,
    SelectForm,
    SelectMultipleForm,
    FileForm,
    PasswordForm,
    ComplexForm
};