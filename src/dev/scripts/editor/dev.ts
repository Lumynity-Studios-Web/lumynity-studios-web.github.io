import {
    type CommandDefinition,
    init,
    newArticleCommand,
} from '../../../scripts/editor/main.ts';

const loadDialog = document.getElementById('load-dialog') as HTMLDialogElement;
const saveDialog = document.getElementById('save-dialog') as HTMLDialogElement;

let lastLoaded: string = '';
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
            .value = lastLoaded;
        saveDialog.showModal();
    },
};
const newArticle = newArticleCommand((filename) => {
    lastLoaded = filename;
});

const { editor } = init({
    editCommandBarProps(props) {
        props.commands.push('|', load, save, newArticle);
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

            if (!editor) return;
            editor.setContent(content);
            lastLoaded = postId;
        })();
    });

saveDialog.querySelector(':scope > form')!
    .addEventListener('submit', (_e: Event) => {
        const event = _e as SubmitEvent;

        const submit = event.submitter!.getAttribute('value');
        if (submit === 'Cancel') return;

        const formdata = new FormData(event.target as HTMLFormElement);
        const postId = formdata.get('filename')!.toString();

        const content = editor.getContent();

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
