export const SimpleForm = `
    <form>
        <input type='text' name='test' />
    </form>
`;

export const ExternalForm = `
    <form id='test-form'><input type='text' name='test2' /></form>
    <input type='text' name='test' form='test-form' />
`;

export const CheckboxForm = `
    <form>
        <input type='checkbox' name='test' />
    </form>
`;

export const RadioForm = `
    <form>
        <input type='radio' name='test' value='A' checked />
        <input type='radio' name='test' value='B' />
    </form>
`;

export const TextareaForm = `
    <form>
        <textarea name='test' />
    </form>
`;

export const SelectForm = `
    <form>
        <select name='test'>
            <option value='a'>A</option>
            <option value='b'>B</option>
        </select>
    </form>
`;

export const SelectMultipleForm = `
    <form>
        <select name='test' multiple='multiple'>
            <option value='a'>A</option>
            <option value='b'>B</option>
            <option value='c'>C</option>
        </select>
    </form>
`;

export const FileForm = `
    <form>
        <input type='file' name='test' />
    </form>
`;

export const PasswordForm = `
    <form>
        <input type='password' name='test' />
    </form>
`;