# Shamsi Daily Note for Obsidian

An Obsidian plugin that automatically opens or creates today's daily note using a **Jalali (Hijri Shamsi / Persian)** filename.

For example, instead of a Gregorian filename like:

```text
20250808.md
```

it creates and opens a note like:

```text
14050306.md
```


The note content starts with the **Persian weekday name**, followed by a blank line, and places the cursor on that blank line so you can start writing immediately.

---

## Features

- Uses **Jalali/Shamsi** date for the filename
- Filename format:

  ```text
  YYYYMMDD.md
  ```

  Example:

  ```text
  14050306.md
  ```

- Creates notes inside a vault-relative folder:

  ```text
  dailyNotes
  ```

- Automatically opens today's note on startup
- Writes the **Persian weekday** as the first line, for example:

  ```text

  چهارشنبه
  ```

- Inserts a blank line after the weekday
- Places the cursor on the blank line in a newly created note
- Works as a custom Obsidian plugin on desktop and mobile-compatible vault setups

---

## Folder behavior

By default, the plugin creates daily notes in:

text
dailyNotes

This path is **vault-relative**, not an absolute Windows or Android path.

So if your vault root is:

text
evt

then the daily notes will be created in:

text
evt/dailyNotes/

---

## Why this plugin exists

Obsidian's built-in Daily Notes plugin can create/open daily notes based on Gregorian date naming, but it does not natively support:

- **Jalali filename generation**
- automatic opening of a Shamsi-named daily note like `14050306.md`

This plugin replaces that behavior for users who want Persian/Shamsi daily note naming.

The [persian calendar](https://github.com/karfekr/obsidian-persian-calendar) plugin was already there, but was too complicated for my daily note taking.

---

## Installation

### Manual installation

Copy these files into your vault plugin folder:

text
.obsidian/plugins/shamsi-daily-note/

Required files:

- `manifest.json`
- `main.js`

Final structure:

text
YourVault/
└── .obsidian/
    └── plugins/
        └── shamsi-daily-note/
            ├── manifest.json
            └── main.js

Then in Obsidian:

1. Open **Settings**
2. Go to **Community plugins**
3. Turn off **Restricted mode**
4. Enable **Shamsi Daily Note**

---

## Build from source

This repository contains the TypeScript source and build configuration.

### Requirements

- Node.js
- npm

### Install dependencies

bash
npm install

### Build

bash
npm run build

This produces:

text
main.js

which is the compiled plugin file used by Obsidian.

---

## Usage

Once enabled, the plugin will:

1. calculate today's Gregorian date
2. convert it to Jalali/Shamsi
3. generate a filename like:

   ```text
   14050306.md
   ```

4. create the file in `dailyNotes` if it does not exist
5. open the file automatically

If the note already exists, it opens that same note instead of creating duplicates.

---

## Notes

- This plugin uses **vault-relative paths**
- Do **not** use absolute paths like:

  ```text
  C:\Users\...\vault\...
  ```

- The built-in Daily Notes core plugin should generally be disabled if you want this plugin to fully control daily note behavior

---

## Repository files

Typical source files:

- `main.ts`
- `manifest.json`
- `package.json`
- `tsconfig.json`
- `esbuild.config.mjs`

Built output:

- `main.js`

---
