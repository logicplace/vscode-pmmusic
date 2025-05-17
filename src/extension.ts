import { ExtensionContext, languages, commands, Disposable, Uri, workspace, window, Range, Position } from 'vscode';
import { CodelensProvider } from './CodelensProvider';
import * as fs from 'fs';
import * as path from 'path';
import * as pmsound from 'pmsound';
import { SpeakerSink } from 'pmsound/out/pm/audout/node';

var disposables: Disposable[] = [];

export function activate(context: ExtensionContext) {
	let codelensProvider = new CodelensProvider();
	let playing: Record<string, boolean> = {};
	let isPlaying = false;
	let player = new pmsound.PMMusicEngine(0);
	player.addSink(new SpeakerSink());

	let dcl = languages.registerCodeLensProvider({
		scheme: "file",
		language: "pmmusic"
	}, codelensProvider);
	disposables.push(dcl);

	context.subscriptions.push(
		commands.registerCommand("pmmusic.compilePMAS", () => {
			compile().then(async r => {
				const out = r.cr.toPMAS()
				const outFN = getOutFilename(r.doc.fileName, ".asm")
				return await open(outFN, out)
			})
		})
	)

	commands.registerCommand("pmmusic.togglePlayingSection", (...args) => {
		let section:string, name: string;
		[section, name] = args

		function end() {
			delete playing[name]
			codelensProvider.stop(name);
		}

		if (name in playing) {
			if (section !== "SFX") {
				player.stopBGM();
			} else {
				player.stopSFX();
			}
			end()
			return
		}
		else if (section !== "SFX" && player.isPlayingBGM()) {
			window.showErrorMessage(`cannot play multiple BGMs at once`)
			return
		}
		else if (window.activeTextEditor) {
			playing[name] = true;
			codelensProvider.play(name);
			let doc = window.activeTextEditor.document;
			pmsound.parse(doc.getText(), getFile).then((value: pmsound.PMMusic) => {
				player.setMasterTime(value.masterTime);
				const engine = workspace.getConfiguration("pmmusic").get("soundEngine", "direct")
				const filter = workspace.getConfiguration("pmmusic").get("filter", "piezo")
				
				switch (engine.toLowerCase()) {
					case "generated":
						player.audio.changeEngine(pmsound.SoundEngine.generated)
						break
					case "direct":
						player.audio.changeEngine(pmsound.SoundEngine.direct)
						break
					case "emulated":
						player.audio.changeEngine(pmsound.SoundEngine.emulated)
						break
					case "direct_pwm": case "directpwm":
						player.audio.changeEngine(pmsound.SoundEngine.directPWM)
						break
					default:
						window.showErrorMessage(`unknown sound engine "${engine}"`)
						return
				}

				switch (filter.toLowerCase()) {
					case "disabled": case "none":
						player.audio.changeFilter(pmsound.Filter.disabled)
						break
					case "piezo":
						player.audio.changeFilter(pmsound.Filter.piezo)
						break
					default:
						window.showErrorMessage(`unknown filter "${filter}", disabling`)
						player.audio.changeFilter(pmsound.Filter.disabled)
						break
				}

				let cr;
				// TODO: handle errors
				switch (section) {
					case "BGM":
						cr = pmsound.compile(value, {bgm: name});
						player.playBGM(cr.bgmCommands(name), end)
						break
					case "SFX":
						cr = pmsound.compile(value, {sfx: name});
						player.playSFX(cr.sfx[name] ?? [], end)
						break
					case "PAT":
						cr = pmsound.compile(value, {pattern: name});
						player.playBGM([
							cr.pattern[name] ?? [],
							[player.makeEndCommand()]
						], end)
						break
				}

				if (!isPlaying) {
					player.play().then(() => isPlaying = false)
				}
			});
		}
	});
}

async function compile() {
	if (window.activeTextEditor) {
		const doc = window.activeTextEditor.document;
		return pmsound.parse(doc.getText(), getFile).then((value: pmsound.PMMusic) => {
			const cr = pmsound.compile(value, {
				bgm: Object.keys(value.bgm),
				sfx: Object.keys(value.sfx),
			})
			return {doc, cr}
		})
	}
	return Promise.reject("no active text editor")
}

async function open(fn: string, content: string) {
	const exists = fs.existsSync(fn);
	const uri = exists ? Uri.file(fn) : Uri.parse("untitled:" + fn);
	const doc = await workspace.openTextDocument(uri);
	const editor = await window.showTextDocument(doc);
	return editor.edit(edit => {
		if (exists) {
			const prev = editor.selection;
			edit.replace(new Range(
				new Position(0, 0),
				new Position(
					doc.lineCount - 1,
					doc.lineAt(doc.lineCount - 1).range.end.character
				)
			), content);
			editor.selection = prev;
		}
		else {
			edit.insert(new Position(0, 0), content)
		}
	})
}

async function getFile(fn: string) {
	const root = workspace.workspaceFolders?.[0];
	if (!root) {
		window.showErrorMessage("not in a workspace, can't import");
		return "";
	}
	if (!path.extname(fn)) fn += ".pmmusic"
	const fileURI = root.uri.with({ path: path.join(root.uri.path, fn) });
	let readData;
	try {
		readData = await workspace.fs.readFile(fileURI);
	} catch (err) {
		window.showErrorMessage(`Error reading file: ${err}`);
		return "";
	}
	return Buffer.from(readData).toString("utf8");
}

function getOutFilename(fn: string, ext: string) {
	// Export relative to target file (default)
	fn = path.basename(fn, path.extname(fn));
	return path.resolve(path.dirname(fn), fn + ext);
}

// this method is called when your extension is deactivated
export function deactivate() {
	if (disposables) {
		disposables.forEach(item => item.dispose());
	}
	disposables = [];
}
