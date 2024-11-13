import { EditorView } from '@codemirror/view';
import { oneDark } from '@codemirror/theme-one-dark';

const lightTheme = EditorView.theme({
    '&': {
        backgroundColor: '#ffffff',
        color: '#000000'
    },
    '.cm-content': {
        caretColor: '#000000'
    },
    '.cm-cursor, .cm-dropCursor': { borderLeftColor: '#000000' },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
        backgroundColor: '#d7d4f0'
    },
    '.cm-activeLine': { backgroundColor: '#f8f9fa' },
    '.cm-gutters': {
        backgroundColor: '#f8f9fa',
        color: '#6c757d',
        border: 'none'
    },
    '.cm-activeLineGutter': {
        backgroundColor: '#e9ecef'
    }
});

export const themes = {
    light: lightTheme,
    dark: oneDark
};