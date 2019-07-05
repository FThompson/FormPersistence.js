module.exports.SimpleForm = `
    <form>
        <input type='text' name='test' />
    </form>
`;

module.exports.ExternalForm = `
    <form id='test-form'></form>
    <input type='text' name='test' form='test-form' />
`;

module.exports.CheckboxForm = `
    <form>
        <input type='checkbox' name='test' />
    </form>
`;

module.exports.RadioForm = `
    <form>
        <input type='radio' name='test' value='a' checked />
        <input type='radio' name='test' value='b' />
    </form>
`;

module.exports.TextareaForm = `
    <form>
        <textarea name='test' />
    </form>
`;

module.exports.SelectForm = `
    <form>
        <select name='test'>
            <option value='a'>A</option>
            <option value='b'>B</option>
        </select>
    </form>
`;

module.exports.SelectMultipleForm = `
    <form>
        <select name='test' multiple='multiple'>
            <option value='a'>A</option>
            <option value='b'>B</option>
            <option value='c'>C</option>
        </select>
    </form>
`;

module.exports.FileForm = `
    <form>
        <input type='file' name='test' />
    </form>
`;

module.exports.PasswordForm = `
    <form>
        <input type='password' name='test' />
    </form>
`;