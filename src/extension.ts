import { ExtensionContext, languages, commands, Disposable, workspace, window, Terminal } from 'vscode';
import { CodelensProvider } from './CodelensProvider';
// import cp = require('child_process'); // use this if can't read terminals' output ?


var disposables: Disposable[] = [];

export function activate(context: ExtensionContext) {
    let codelensProvider = new CodelensProvider();
    let terminals: Record<string, Terminal> = {};

    let dcl = languages.registerCodeLensProvider({
        scheme: "file",
        language: "pmmusic"
    }, codelensProvider);
    disposables.push(dcl);

    commands.registerCommand("pmmusic.togglePlayingSection", (args) => {
        let name: string = args;
        if (name in terminals) {
            terminals[name].dispose();
            delete terminals[name];
        }
        else if (window.activeTextEditor) {
            let exe = workspace.getConfiguration("pmmusic").get("musicconvPath", "pokemini_musicconv");
            let doc = window.activeTextEditor.document;
            let file = doc.fileName;
            doc.save();
            codelensProvider.play(name);
            terminals[name] = window.createTerminal(`Playing ${name}`, exe, ["-i", file, "-play", name]);
            // TODO: watch for "Error:" and show terminal (or toast?) if any appear
            // TODO: use event emitters to toggle play/stop button ...
            // see: https://github.com/Microsoft/vscode/issues/26168
        }
    });

    window.onDidCloseTerminal((terminal) => {
        let name = terminal.name.replace("Playing ", "");
        if (name in terminals) {
            codelensProvider.stop(name);
            delete terminals[name];
        }
	});
}

// this method is called when your extension is deactivated
export function deactivate() {
    if (disposables) {
        disposables.forEach(item => item.dispose());
    }
    disposables = [];
}
