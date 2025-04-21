import * as vscode from 'vscode';

interface LensInfo {
    name: string;
    playing: boolean;
    type: string;
}

class CodeLens extends vscode.CodeLens {
    details: LensInfo;

    constructor(range: vscode.Range, details: LensInfo, command?: vscode.Command) {
        super(range, command);
        this.details = details;
    }
}

/**
 * CodelensProvider
 */
export class CodelensProvider implements vscode.CodeLensProvider {

    private codeLenses: Record<string, CodeLens> = {};
    private regex: RegExp;
    private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
    public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;

    constructor() {
        this.regex = /(BGM|(PAT(TERN)?|SFX)(_T(RACK)?)?)[ \t]([^ \t{]+)/g;

        vscode.workspace.onDidChangeConfiguration((_) => {
            this._onDidChangeCodeLenses.fire();
        });
    }

    public reload() {
        this._onDidChangeCodeLenses.fire();
    }

    public play(name: string) {
        if (name in this.codeLenses) {
            this.codeLenses[name].details.playing = true;
            this.reload();
        }
    }

    public stop(name: string) {
        if (name in this.codeLenses) {
            this.codeLenses[name].details.playing = false;
            this.reload();
        }
    }

    public provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {
        if (vscode.workspace.getConfiguration("pmmusic").get("enableCodeLens", true)) {
            let codeLenses = [];
            const regex = new RegExp(this.regex);
            const text = document.getText();
            let matches;
            while ((matches = regex.exec(text)) !== null) {
                let line = document.lineAt(document.positionAt(matches.index).line);
                let indexOf = line.text.indexOf(matches[0]);
                let position = new vscode.Position(line.lineNumber, indexOf);
                let range = document.getWordRangeAtPosition(position, new RegExp(this.regex));
                if (range) {
                    let sectionName = "";
                    switch (matches[1].substring(0, 3)) {
                        case "BGM": sectionName = "BGM"; break;
                        case "PAT": sectionName = "pattern"; break;
                        case "SFX": sectionName = "sound effect"; break;
                    }
                    let name = matches[6], details: LensInfo;
                    if (name in this.codeLenses) {
                        details = this.codeLenses[name].details;
                    }
                    else {
                        details = {
                            name: name,
                            playing: false,
                            type: sectionName
                        };
                    }
                    let lens = new CodeLens(range, details, {
                        title: details.playing ? "stop" : "play",
                        tooltip: `${details.playing ? "Stop playing" : "Play"} this ${details.type} through pokemini_musicconv`,
                        command: "pmmusic.togglePlayingSection",
                        arguments: [details.name]
                    });
                    codeLenses.push(lens);
                    this.codeLenses[name] = lens;
                }
            }
            return codeLenses;
        }
        return [];
    }
}

