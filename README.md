# Mailspring Classic Inboxes
DISCLAIMER: This is a brand-new plugin and may have unexpected behavior. The author holds no responsibility for any issues caused. Feedback and bug reports are welcome!

Mailspring plugin for people who prefer a classic, per-account mailbox sidebar instead of a unified inbox workflow.

This plugin replaces the default account sidebar and renders:

- Standard folders (Inbox, Sent, Drafts, Archive, Spam, Trash)
- All IMAP folders (including custom and nested folders)
- Hierarchical tree with collapse/expand behavior
- Drag and drop to move conversations between folders
- Context menu on custom IMAP folders to create subfolders and delete folders

## Why this plugin exists

If unified inbox is not your style, this plugin gives a more traditional mailbox experience with clear folder structure by account.

## Installation

1. Copy this plugin folder to your Mailspring packages directory.
2. Install dependencies:

```bash
npm install
```

3. Build:

```bash
npm run build
```

4. Restart Mailspring (or reload the main window from dev tools).

## Development

Source files live in `src/` and compile to `lib/`.

```bash
npm run build
```

## Notes

- Keep `lib/` committed for distribution.
- Plugin targets the main Mailspring window (`windowTypes.default`).
