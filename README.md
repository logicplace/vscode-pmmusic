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

* `pmmusic.enableCodeLens`: enable/disable the `play / stop` button
* `pmmusic.musicconvPath`: path (including filename and extension) of pokemini_musicconv

## Release Notes

### 0.0.2

Fix highlighting bug on notes in MML

### 0.0.1

Initial development release of pmmusic

* Full highlighting support (note that the musicconv docs mention END in tracks, but it doesn't compile)
* Basic play/stop features
