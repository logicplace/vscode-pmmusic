# PM Music

A companion for Pokemon mini music authorship! Write and play your MML right in the editor.

## Features

* pmmusic syntax highlighting
* play your BGMs, patterns, and sound effects right from the editor

## Extension Settings

This extension contributes the following settings:

* `pmmusic.enableCodeLens`: enable/disable the `play` / `stop` button
* `pmmusic.soundEngine`: select which sound engine to use for playback
* `pmmusic.filter`: select which filter to apply to the sound

## Release Notes

### 0.1.0

* Sound emulation is now built-in
  * Subsequently, `pmmusic.musicconvPath` has been removed
  * Playback no longer automatically saves the file
* Added `pmmusic.soundEngine` and `pmmusic.filter`
* Added command for compiling to PMAS syntax
* Syntax changes:
  * First argument to MASTERBPM can be a float
  * Length extension can go up to `....` not just `..`
  * Effects can now highlight negative arguments
  * VOLLEVEL can now accept 4/16
  * OCTREV and SHORTQ can now accept true/false and 1/0
  * Removed `;` from track-data as being END, turns out it's ignored entirely and there's no way to END in track-data in the official build
  * body markers are only required for multiple lines
  * allow body (containing raw text) for description
    * not supported in the official build
  * Support comments at the end of DESCRIPTION and similar directives

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
