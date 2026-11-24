import { type CommandDefinition, State } from '../../../scripts/editor/main.ts';

new State({
    editCommandBarProps(props, state) {
        props.commands.splice(-3, 0, loadCommand(state), saveCommand(state));
        props.commands.push(
            '|',
            insertImageCommand(state),
            uploadImageCommand(),
        );
    },
});

function loadCommand(state: State): CommandDefinition {
    const dialog = document.getElementById(
        'load-dialog',
    ) as HTMLDialogElement;
    const form = dialog.querySelector(':scope > form') as HTMLFormElement;

    form.addEventListener('submit', (_e: Event) => {
        const event = _e as SubmitEvent;

        const submit = event.submitter!.getAttribute('value');
        if (submit === 'Cancel') return;

        const formdata = new FormData(form);
        const postId = formdata.get('post')!.toString();

        (async () => {
            const content = await fetch(`/news/${postId}.md`).then((
                response,
            ) => response.text());

            state.editor.setContent(content);
            state.lastFilename = postId;
        })();
    });

    return {
        name: 'lumynity:load',
        title: 'Load article',
        innerHTML: '🖿',
        action() {
            form.reset();
            dialog.showModal();
        },
    };
}

function saveCommand(state: State): CommandDefinition {
    const dialog = document.getElementById(
        'save-dialog',
    ) as HTMLDialogElement;
    const form = dialog.querySelector(':scope > form') as HTMLFormElement;

    form.addEventListener('submit', (_e: Event) => {
        const event = _e as SubmitEvent;

        const submit = event.submitter!.getAttribute('value');
        if (submit === 'Cancel') return;

        const formdata = new FormData(form);
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

    return {
        name: 'lumynity:save',
        title: 'Save article',
        innerHTML: '💾',
        action() {
            form.reset();
            (dialog.querySelector('[name="filename"]') as HTMLInputElement)
                .value = state.lastFilename;
            dialog.showModal();
        },
    };
}

// TODO: disable when selection lost https://github.com/jefago/tiny-markdown-editor#selection-event
function insertImageCommand(state: State): CommandDefinition {
    const dialog = document.getElementById(
        'insert-image-dialog',
    ) as HTMLDialogElement;
    const select = dialog.querySelector('[name="image"]') as HTMLSelectElement;
    const form = dialog.querySelector(':scope > form') as HTMLFormElement;
    const imageElement = dialog.querySelector('img')!;

    select.addEventListener('change', (_e: Event) => {
        imageElement.src = `/news/images/${select.value}`;
        imageElement.alt = imageElement.title = select.value;
    });

    form.addEventListener('submit', (_e: Event) => {
        const event = _e as SubmitEvent;

        const submit = event.submitter!.getAttribute('value');
        if (submit === 'Cancel') return;

        const formdata = new FormData(form);
        const image = formdata.get('image')!.toString();

        if (!state.editor.getSelection()) {
            state.setSelectionToEnd();
        }

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

    return {
        name: 'lumynity:insert-image',
        title: 'Insert existing image',
        innerHTML: '🖼',
        async action() {
            form.reset();
            select.replaceChildren();
            imageElement.alt = imageElement.title = imageElement.src = '';
            dialog.showModal();

            const images: string[] = await fetch('/news/images.json')
                .then((response) => response.json());
            for (const filename of images) {
                const option = document.createElement(
                    'option',
                ) as HTMLOptionElement;
                option.innerText = option.value = filename;
                select.appendChild(option);
            }

            imageElement.src = `/news/images/${select.value}`;
            imageElement.alt = imageElement.title = select.value;
        },
    };
}

function uploadImageCommand(): CommandDefinition {
    const dialog = document.getElementById(
        'upload-image-dialog',
    ) as HTMLDialogElement;
    const fileInput = dialog.querySelector('[name="file"]') as HTMLInputElement;
    const imageElement = dialog.querySelector('img')!;
    const filenameInput = dialog.querySelector(
        '[name="filename"]',
    ) as HTMLInputElement;
    const form = dialog.querySelector(':scope > form') as HTMLFormElement;

    fileInput.addEventListener('change', (_e: Event) => {
        const file = fileInput.files?.item(0);
        if (!file) {
            imageElement.src = imageElement.alt = imageElement.title = '';
            return;
        }
        const url = URL.createObjectURL(file);

        imageElement.src = url;
        filenameInput.value =
            imageElement.alt =
            imageElement.title =
                file.name;
    });

    form.addEventListener('submit', (_e: Event) => {
        const event = _e as SubmitEvent;

        const submit = event.submitter!.getAttribute('value');
        if (submit === 'Cancel') return;

        const formdata = new FormData(form);
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

    return {
        name: 'lumynity:upload-image',
        title: 'Upload image',
        innerHTML: '↥',
        action() {
            form.reset();
            imageElement.alt = imageElement.title = imageElement.src = '';
            dialog.showModal();
        },
    };
}
