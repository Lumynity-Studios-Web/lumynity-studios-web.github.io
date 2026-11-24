import { type CommandDefinition, State } from '../../../scripts/editor/main.ts';

const loadDialog = document.getElementById('load-dialog') as HTMLDialogElement;
const saveDialog = document.getElementById('save-dialog') as HTMLDialogElement;
const insertImageDialog = document.getElementById(
    'insert-image-dialog',
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
const insertImage: CommandDefinition = {
    name: 'lumynity:insert-image',
    title: 'Insert existing image',
    innerHTML: '🖼',
    async action() {
        const imageSelect = insertImageDialog.querySelector('[name="image"]')!;
        imageSelect.replaceChildren();
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
    },
};

const state = new State({
    editCommandBarProps(props) {
        props.commands.splice(-3, 0, load, save);
        props.commands.push('|', insertImage);
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
        imageElement.setAttribute('src', `/news/images/${target.value}`);
    });

insertImageDialog.querySelector(':scope > form')!
    .addEventListener('submit', (_e: Event) => {
        const event = _e as SubmitEvent;

        const submit = event.submitter!.getAttribute('value');
        if (submit === 'Cancel') return;

        const formdata = new FormData(event.target as HTMLFormElement);
        const image = formdata.get('image')!.toString();

        state.editor.paste(`![](./${image})`);
    });
