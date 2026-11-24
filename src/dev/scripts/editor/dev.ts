import { type CommandDefinition, State } from '../../../scripts/editor/main.ts';

const loadDialog = document.getElementById('load-dialog') as HTMLDialogElement;
const saveDialog = document.getElementById('save-dialog') as HTMLDialogElement;
const insertImageDialog = document.getElementById(
    'insert-image-dialog',
) as HTMLDialogElement;
const uploadImageDialog = document.getElementById(
    'upload-image-dialog',
) as HTMLDialogElement;

const load: CommandDefinition = {
    name: 'lumynity:load',
    title: 'Load article',
    innerHTML: '🖿',
    action() {
        loadDialog.showModal();
    },
};
const save: CommandDefinition = {
    name: 'lumynity:save',
    title: 'Save article',
    innerHTML: '💾',
    action() {
        (saveDialog.querySelector('[name="filename"]') as HTMLInputElement)
            .value = state.lastFilename;
        saveDialog.showModal();
    },
};
// TODO: convert to function (like in `editor/main.ts`) and disable when selection lost https://github.com/jefago/tiny-markdown-editor#selection-event
const insertImage: CommandDefinition = {
    name: 'lumynity:insert-image',
    title: 'Insert existing image',
    innerHTML: '🖼',
    async action() {
        const imageSelect = insertImageDialog.querySelector(
            '[name="image"]',
        ) as HTMLSelectElement;
        imageSelect.replaceChildren();
        const imageElement = insertImageDialog.querySelector('img')!;
        imageElement.alt = imageElement.title = imageElement.src = '';
        insertImageDialog.showModal();

        const images: string[] = await fetch('/news/images.json')
            .then((response) => response.json());
        for (const filename of images) {
            const option = document.createElement(
                'option',
            ) as HTMLOptionElement;
            option.innerText = option.value = filename;
            imageSelect.appendChild(option);
        }

        imageElement.src = `/news/images/${imageSelect.value}`;
        imageElement.alt = imageElement.title = imageSelect.value;
    },
};
const uploadImage: CommandDefinition = {
    name: 'lumynity:upload-image',
    title: 'Upload image',
    innerHTML: '',
    action() {
        (uploadImageDialog.querySelector(':scope > form') as HTMLFormElement)
            .reset();

        const imageElement = uploadImageDialog.querySelector('img')!;
        imageElement.alt = imageElement.title = imageElement.src = '';

        uploadImageDialog.showModal();
    },
};

const state = new State({
    editCommandBarProps(props) {
        props.commands.splice(-3, 0, load, save);
        props.commands.push('|', insertImage, uploadImage);
    },
});

loadDialog.querySelector(':scope > form')!
    .addEventListener('submit', (_e: Event) => {
        const event = _e as SubmitEvent;

        const submit = event.submitter!.getAttribute('value');
        if (submit === 'Cancel') return;

        const formdata = new FormData(event.target as HTMLFormElement);
        const postId = formdata.get('post')!.toString();

        (async () => {
            const content = await fetch(`/news/${postId}.md`).then((response) =>
                response.text()
            );

            state.editor.setContent(content);
            state.lastFilename = postId;
        })();
    });

saveDialog.querySelector(':scope > form')!
    .addEventListener('submit', (_e: Event) => {
        const event = _e as SubmitEvent;

        const submit = event.submitter!.getAttribute('value');
        if (submit === 'Cancel') return;

        const formdata = new FormData(event.target as HTMLFormElement);
        const postId = formdata.get('filename')!.toString();

        const content = state.editor.getContent();

        (async () => {
            const response = await fetch(`/news/${postId}.md`, {
                body: content,
                method: 'PUT',
            });
            if (!response.ok) {
                alert(
                    `❌ Failed to save article '${postId}'! Download it to prevent data loss.`,
                );
                return;
            }
            alert(`✅ Saved article '${postId}'.`);
        })();
    });

(insertImageDialog.querySelector('[name="image"]') as HTMLSelectElement)
    .addEventListener('change', (event: Event) => {
        const target = event.target as HTMLSelectElement;
        const imageElement = insertImageDialog.querySelector('img')!;
        imageElement.src = `/news/images/${target.value}`;
        imageElement.alt = imageElement.title = target.value;
    });

insertImageDialog.querySelector(':scope > form')!
    .addEventListener('submit', (_e: Event) => {
        const event = _e as SubmitEvent;

        const submit = event.submitter!.getAttribute('value');
        if (submit === 'Cancel') return;

        const formdata = new FormData(event.target as HTMLFormElement);
        const image = formdata.get('image')!.toString();

        state.editor.wrapSelection('![', `](./${image})`);
        const focus = state.editor.getSelection(false)!;
        const anchor = state.editor.getSelection(true)!;
        if (focus.col !== anchor.col || focus.row !== anchor.row) {
            return;
        }

        const placeholder = 'Image alt text';
        state.editor.paste(placeholder);
        state.editor.setSelection({
            row: focus.row,
            col: focus.col + placeholder.length,
        }, focus);
    });

(uploadImageDialog.querySelector('[name="file"]') as HTMLInputElement)
    .addEventListener('change', (event: Event) => {
        const target = event.target as HTMLInputElement;
        const imageElement = uploadImageDialog.querySelector('img')!;

        const file = target.files!.item(0);
        if (!file) {
            imageElement.src = imageElement.alt = imageElement.title = '';
            return;
        }
        const url = URL.createObjectURL(file);

        imageElement.src = url;
        (uploadImageDialog.querySelector(
            '[name="filename"]',
        ) as HTMLInputElement).value =
            imageElement.alt =
            imageElement.title =
                file.name;
    });

uploadImageDialog.querySelector(':scope > form')!
    .addEventListener('submit', (_e: Event) => {
        const event = _e as SubmitEvent;

        const submit = event.submitter!.getAttribute('value');
        if (submit === 'Cancel') return;

        const formdata = new FormData(event.target as HTMLFormElement);
        const file = formdata.get('file') as File;
        const filename = formdata.get('filename')!.toString();

        (async () => {
            const response = await fetch(`/news/images/${filename}`, {
                body: file,
                method: 'PUT',
            });
            if (!response.ok) {
                alert(
                    `❌ Failed to save image '${filename}'!`,
                );
                return;
            }
            alert(`✅ Saved image '${filename}'.`);
        })();
    });
