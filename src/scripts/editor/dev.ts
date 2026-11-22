import { type Editor } from 'tiny-markdown-editor';
import { type CommandDefinition, init } from './main.ts';

const loadDialog = document.getElementById('load-dialog') as HTMLDialogElement;

let modalEditor: Editor | null = null;

const load: CommandDefinition = {
    name: 'lumynity:load',
    title: 'Load article',
    innerHTML: '↓',
    action(editor: Editor) {
        loadDialog.showModal();
        modalEditor = editor;
    },
};

init({
    editCommandBarProps(props) {
        props.commands.push('|', load);
    },
});

loadDialog.querySelector(':scope > form')!
    .addEventListener('submit', (_e) => {
        const event = _e as SubmitEvent;

        const submit = event.submitter!.getAttribute('value');
        if (submit === 'Cancel') return;

        const formdata = new FormData(event.target as HTMLFormElement);
        const postId = formdata.get('post');

        (async () => {
            const post = await fetch(`/news/${postId}.md`).then((response) =>
                response.text()
            );

            if (!modalEditor) return;
            modalEditor.setContent(post);
        })();
    });
