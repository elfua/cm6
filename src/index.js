import './styles/editor.css';

import {
    EditorView,
    lineNumbers,
    highlightActiveLineGutter,
    highlightSpecialChars,
    drawSelection,
    rectangularSelection,
    crosshairCursor,
    highlightActiveLine,
    keymap
} from '@codemirror/view';
import { EditorState, StateField, StateEffect } from '@codemirror/state';
import { Compartment } from '@codemirror/state'

import { oneDark } from '@codemirror/theme-one-dark'

import {
    foldCode,
    unfoldCode,
    foldGutter,
    indentOnInput,
    indentUnit,
    bracketMatching,
    foldKeymap,
    syntaxHighlighting,
    defaultHighlightStyle
} from '@codemirror/language';
import {
    indentWithTab,
    history,
    defaultKeymap,
    historyKeymap,
    baseKeymap,
    indentSelection,
    redo,
    redoSelection,
    undo,
    undoSelection
} from '@codemirror/commands';
import { highlightSelectionMatches } from '@codemirror/search';

import {
    closeBrackets,
    autocompletion,
    closeBracketsKeymap,
    completionKeymap
} from '@codemirror/autocomplete';

import { linter, openLintPanel } from "@codemirror/lint";

import { javascript } from "@codemirror/lang-javascript"

// prettier imports
import prettier from 'prettier/standalone';
import pluginEstree from 'prettier/plugins/estree';
import pluginBabel from 'prettier/plugins/babel';
import pluginTypescript from 'prettier/plugins/typescript';
import pluginHtml from 'prettier/plugins/html';
import pluginPostcss from 'prettier/plugins/postcss';
import pluginJson from 'prettier/plugins/babel';
import pluginMarkdown from 'prettier/plugins/markdown';
import pluginYaml from 'prettier/plugins/yaml';

const languageModes = {
    javascript: () => import("@codemirror/lang-javascript").then(module => module.javascript()),
    python: () => import("@codemirror/lang-python").then(module => module.python()),
    css: () => import("@codemirror/lang-css").then(module => module.css()),
    html: () => import("@codemirror/lang-html").then(module => module.html()),
    cpp: () => import("@codemirror/lang-cpp").then(module => module.cpp()),
    java: () => import("@codemirror/lang-java").then(module => module.java()),
    xml: () => import("@codemirror/lang-xml").then(module => module.xml()),
    sql: () => import("@codemirror/lang-sql").then(module => module.sql()),
    yaml: () => import("@codemirror/lang-yaml").then(module => module.yaml()),
    markdown: () => import("@codemirror/lang-markdown").then(module => module.markdown()),
    rust: () => import("@codemirror/lang-rust").then(module => module.rust()),
    php: () => import("@codemirror/lang-php").then(module => module.php()),
    json: () => import("@codemirror/lang-json").then(module => module.json())
};


import { html } from "@codemirror/lang-html"
import { css } from "@codemirror/lang-css"
import { cpp } from '@codemirror/lang-cpp';
import { python } from "@codemirror/lang-python"
import { java } from "@codemirror/lang-java"
import { xml } from "@codemirror/lang-xml"
import { sql } from "@codemirror/lang-sql"
import { yaml } from "@codemirror/lang-yaml"
import { markdown } from "@codemirror/lang-markdown"
import { rust } from '@codemirror/lang-rust';
import { php } from '@codemirror/lang-php';
import { json } from '@codemirror/lang-json';

let editor;
let isMac = /Mac/.test(navigator.platform);

const languages = {
    javascript: javascript(),
    python: python(),
    java: java(),
    cpp: cpp(),
    rust: rust(),
    php: php(),
    sql: sql(),
    html: html(),
    css: css(),
    json: yaml(),
    rust: rust(),
    yaml: json(),
    xml: xml(),
    markdown: markdown()
};

const CM6_TO_PRETTIER_LANGS = {
    'javascript': 'babel',
    'css': 'postcss',
    'json': 'json5'
}

const STORAGE_CONTENT_KEY = 'cm6_editor_content';
const STORAGE_LANGUAGE_KEY = 'cm6_editor_language';
const STORAGE_THEME_KEY = 'cm6_editor_theme';

class CodeMirrorEditor {
    constructor() {
        this.languageSelect = document.getElementById('language-select');
        this.themeToggle = document.getElementById('theme-toggle');
        this.formatBtn = document.getElementById('formatBtn');
        this.currentLanguage = localStorage.getItem(STORAGE_LANGUAGE_KEY) || 'javascript';
        this.currentTheme = [];

        this.editorText = localStorage.getItem(STORAGE_CONTENT_KEY) || "console.log(42);\n\n\n\n\n\n";

        this.themeConf = new Compartment();
        this.languageConf = new Compartment();

        this.initializeEditor();
        this.setupEventListeners();
    }

    async initializeEditor() {
        // set language dropdown value when restored from localStorage state
        if (this.languageSelect.value !== this.currentLanguage) {
            this.languageSelect.value = this.currentLanguage;
        }
        const startState = EditorState.create({
            doc: this.editorText,
            extensions: [
                ...this.getBaseExtensions(),
                this.languageConf.of(languages[this.currentLanguage])
                ,
                this.themeConf.of(this.currentTheme)
            ]
        });

        this.editorView = new EditorView({
            state: startState,
            parent: document.getElementById('editor')
        });
    }

    getBaseExtensions() {
        return [
            // languageExtensions[language],
            // javascript(),
            // theme === 'dark' ? oneDark : defaultHighlightStyle,
            // autoLanguage,
            // defaultHighlightStyle(),
            autocompletion(),
            lineNumbers(),
            highlightActiveLineGutter(),
            highlightSpecialChars(),
            history(),
            foldGutter(),
            drawSelection(),
            indentUnit.of("    "),
            syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
            EditorState.allowMultipleSelections.of(true),
            indentOnInput(),
            bracketMatching(),
            closeBrackets(),
            autocompletion(),
            rectangularSelection(),
            crosshairCursor(),
            highlightActiveLine(),
            highlightSelectionMatches(),
            keymap.of({
                "Mod-z": undo,
                "Mod-Shift-z": redo,
                "Mod-u": view => undoSelection(view) || true,
                [isMac ? "Mod-Shift-u" : "Alt-u"]: redoSelection,
                "Ctrl-y": isMac ? undefined : redo,
                "Shift-Tab": indentSelection,
                "Mod-Alt-[": foldCode,
                "Mod-Alt-]": unfoldCode,
                "Shift-Mod-m": openLintPanel
            }),
            keymap.of([
                indentWithTab,
                ...closeBracketsKeymap,
                ...defaultKeymap,
                ...historyKeymap,
                ...foldKeymap,
                ...completionKeymap,
            ]),
        ]
    }

    setupEventListeners() {
        this.languageSelect.addEventListener('change', async (e) => {
            this.currentLanguage = e.target.value;
            this.updateLanguage();
        });

        this.themeToggle.addEventListener('change', (e) => {
            this.currentTheme = e.target.checked ? [oneDark] : [];
            this.updateTheme();
        });

        this.formatBtn.addEventListener('click', (e) => {
            const codeBefore = this.editorView.state.doc.toString();

            prettier.format(codeBefore, {
                parser: CM6_TO_PRETTIER_LANGS[this.currentLanguage] || this.currentLanguage,
                plugins: [pluginBabel, pluginEstree, pluginHtml, pluginJson, pluginMarkdown, pluginPostcss, pluginTypescript, pluginYaml]
            }).then((codeBeautified) => {
                this.editorView.dispatch(
                    {
                        changes: {
                            from: 0,
                            to: this.editorView.state.doc.length,
                            insert: codeBeautified
                        }
                    }
                )
            })
        });

        // SAVE STATE
        window.addEventListener('beforeunload', (event) => {
            if (this.editorView) {
                localStorage.setItem(STORAGE_CONTENT_KEY, this.editorView.state.doc.toString());
                localStorage.setItem(STORAGE_LANGUAGE_KEY, this.currentLanguage);
                // Dispose editor to free resources
                console.log("BEFOREUNLOAD");
                event.returnValue = null;
            }
        });
    }

    updateLanguage() {
        this.editorView.dispatch({
            effects: this.languageConf.reconfigure(languages[this.currentLanguage])
        });
    }

    updateTheme() {
        this.editorView.dispatch({
            effects: this.themeConf.reconfigure(this.currentTheme)
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new CodeMirrorEditor();
});
