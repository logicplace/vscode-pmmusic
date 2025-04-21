# PM Music

A companion for Pokemon mini music authorship! Write and play your MML right in the editor.

## Features

* pmmusic syntax highlighting
* play your BGMs, patterns, and sound effects right from the editor

## Requirements

You'll need to download and install pokemini_musicconv, which is included in the [PokeMini](https://sourceforge.net/p/pokemini/) release.

Once installed, either add that folder to your PATH or go to your VS Code settings (`Ctrl+,`) and set `pmmusic.musicconvPath` to the path for that exe.

## Extension Settings

This extension contributes the following settings:

* `pmmusic.enableCodeLens`: enable/disable the `play` / `stop` button
* `pmmusic.musicconvPath`: path (including filename and extension) of pokemini_musicconv

## Release Notes

### 0.0.3

* Adding `END` even though it doesn't work, since I'm making a compiler that will allow it
* Allow arbitrary effects to be highlighted
* Discovered some new syntax allowed in `ROW`:
  * A note declaration can be separated from its octave with a space or underscore as well.
  * Allows the `\n` command same as MML, but not the `/n` variant.
  * One can unspecify the current note by using `-` or `_` in place of a note.
  * Note octaves are optional
* Changed `play / stop` to `play` which changes to `stop` after clicking and back once it's done.

### 0.0.2

Fix highlighting bug on notes in MML

### 0.0.1

Initial development release of pmmusic

* Full highlighting support (note that the musicconv docs mention END in tracks, but it doesn't compile)
* Basic play/stop features
