import { CommandBar, Editor } from 'tiny-markdown-editor';

export type EditorProps = ConstructorParameters<typeof Editor>[0];
export type CommandBarProps = ConstructorParameters<typeof CommandBar>[0];
export type InitOptions = {
    editEditorProps?(props: EditorProps, state: State): void;
    editCommandBarProps?(
        props: Required<CommandBarProps>,
        state: State,
    ): void;
};

export type CommandDefinition = Exclude<
    NonNullable<CommandBarProps['commands']>[number],
    string
>;

export class State {
    editor: Editor;
    commandBar: CommandBar;
    lastFilename: string;

    constructor(options: InitOptions = {}) {
        const editorElement = document.getElementById(
            'editor',
        ) as HTMLDivElement;
        const commandBarElement = document.getElementById(
            'commandbar',
        ) as HTMLDivElement;

        const editorProps: EditorProps = { element: editorElement };
        if (options.editEditorProps) options.editEditorProps(editorProps, this);
        this.editor = new Editor(editorProps);

        const commandBarProps = {
            element: commandBarElement,
            editor: this.editor,
            commands: defaultCommands(this),
        };
        if (options.editCommandBarProps) {
            options.editCommandBarProps(commandBarProps, this);
        }
        this.commandBar = new CommandBar(commandBarProps);

        this.lastFilename = '';
    }
}

function newFrontmatter(): string {
    const date = new Date();
    return `\
---
date: ${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}
---
`;
}

export function newArticleCommand(state: State): CommandDefinition {
    return {
        name: 'lumynity:new',
        title: 'New article',
        innerHTML: '+',
        action() {
            state.lastFilename = '';
            state.editor.setContent(`\
${newFrontmatter()}
# Article Title

`);
        },
    };
}

export function uploadArticleCommand(state: State): CommandDefinition {
    const uploadDialog = document.getElementById(
        'upload-dialog',
    ) as HTMLDialogElement;

    uploadDialog.querySelector(':scope > form')!
        .addEventListener('submit', (_e: Event) => {
            const event = _e as SubmitEvent;

            const submit = event.submitter!.getAttribute('value');
            if (submit === 'Cancel') return;

            const formdata = new FormData(event.target as HTMLFormElement);
            const file = formdata.get('file') as File;
            const name = file.name.replace(/\.md$/, '');

            (async () => {
                let content = await file.text();
                if (!content.startsWith('---\n')) {
                    content = newFrontmatter() + '\n' + content;
                }

                state.editor.setContent(content);
                state.lastFilename = name;
            })();
        });

    return {
        name: 'lumynity:upload',
        title: 'Upload article',
        innerHTML: '↥',
        action() {
            uploadDialog.showModal();
        },
    };
}

export function downloadArticleCommand(state: State): CommandDefinition {
    return {
        name: 'lumynity:download',
        title: 'Download article',
        innerHTML: '↧',
        action() {
            const content = state.editor.getContent();

            const a = document.createElement('a');
            const blobUrl = a.href = URL.createObjectURL(new Blob([content]));
            a.download = (state.lastFilename || 'article') + '.md';

            // TODO: does this need adding to the document?
            //   Seems to work on Chrome without it, may break in other browsers
            a.dispatchEvent(new MouseEvent('click'));

            URL.revokeObjectURL(blobUrl);
        },
    };
}

export function defaultCommands(
    state: State,
): (string | CommandDefinition)[] {
    return [
        'bold',
        'italic',
        'strikethrough',
        '|',
        'code',
        '|',
        'h1',
        'h2',
        '|',
        'ul',
        'ol',
        'tasklist',
        '|',
        'blockquote',
        'hr',
        '|',
        'undo',
        'redo',
        '|',
        'insertLink',
        'insertImage',
        '|',
        uploadArticleCommand(state),
        downloadArticleCommand(state),
        newArticleCommand(state),
    ];
}
