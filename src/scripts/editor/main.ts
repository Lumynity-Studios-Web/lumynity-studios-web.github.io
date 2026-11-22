import { CommandBar, Editor } from 'tiny-markdown-editor';

export type EditorProps = ConstructorParameters<typeof Editor>[0];
export type CommandBarProps = ConstructorParameters<typeof CommandBar>[0];
export type InitOptions = {
    editEditorProps?(props: EditorProps): void;
    editCommandBarProps?(props: Required<CommandBarProps>): void;
};

export type CommandDefinition = Exclude<
    NonNullable<CommandBarProps['commands']>[number],
    string
>;

export function init(
    options: InitOptions = {},
): { editor: Editor; commandBar: CommandBar } {
    const editorElement = document.getElementById('editor') as HTMLDivElement;
    const commandBarElement = document.getElementById(
        'commandbar',
    ) as HTMLDivElement;

    const editorProps: EditorProps = { element: editorElement };
    if (options.editEditorProps) options.editEditorProps(editorProps);
    const editor = new Editor(editorProps);

    const commandBarProps = {
        element: commandBarElement,
        editor,
        commands: defaultCommands(),
    };
    if (options.editCommandBarProps) {
        options.editCommandBarProps(commandBarProps);
    }
    const commandBar = new CommandBar(commandBarProps);

    return { editor, commandBar };
}

export function newArticleCommand(
    setLastFilename: (filename: string) => void,
): CommandDefinition {
    return {
        name: 'lumynity:new',
        title: 'New article',
        innerHTML: '+',
        action(editor: Editor) {
            setLastFilename('');
            const date = new Date();
            editor.setContent(`\
---
date: ${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}
---
# Article Title

`);
        },
    };
}

export function defaultCommands(): (string | CommandDefinition)[] {
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
    ];
}
