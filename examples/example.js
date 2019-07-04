let form = document.getElementById('create-post');
FormPersistence.persist(form, { valueFunctions: {
    'tag': (form, value) => createTag(value)
}});

document.getElementById('add-tag').addEventListener('click', addTag);
document.getElementById('refresh').addEventListener('click', refreshPage);

function addTag() {
    let tagsBox = document.getElementById('tag-input');
    createTag(tagsBox.value);
    tagsBox.value = '';
}

function createTag(tag) {
    let tagsDiv = document.getElementById('added-tags');
    let tagElement = document.createElement('span');
    tagElement.textContent = tag;
    tagsDiv.appendChild(tagElement);
    let removeElement = document.createElement('a');
    removeElement.textContent = '\u274c';
    removeElement.addEventListener('click', () => tagsDiv.removeChild(tagElement));
    tagElement.appendChild(removeElement);
    let tagValue = document.createElement('input');
    tagValue.setAttribute('type', 'hidden');
    tagValue.setAttribute('name', 'tag');
    tagValue.value = tag;
    tagElement.appendChild(tagValue);
}

function refreshPage() {
    window.location.reload(true);
}