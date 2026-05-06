"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mailspring_exports_1 = require("mailspring-exports");
const mailspring_component_kit_1 = require("mailspring-component-kit");
// ─── Plugin-level i18n ────────────────────────────────────────────────────────
const PLUGIN_STRINGS = {
    ru: {
        "Hide folder": "Скрыть папку",
        "Create subfolder": "Создать подпапку",
        "Show hidden folders": "Показать скрытые папки",
        "Hide hidden folders": "Скрыть скрытые папки",
        "Hidden folders": "Скрытые папки",
        "Show": "Показать",
        "Create new subfolder": "Новая подпапка",
        "Create": "Создать",
        "Cancel": "Отмена",
        "Are you sure?": "Вы уверены?",
    },
};
const _pluginLang = (typeof window !== "undefined" && window.navigator.language || "en").split("-")[0].toLowerCase();
const _pluginStrings = PLUGIN_STRINGS[_pluginLang] || {};
const t = (str) => _pluginStrings[str] || str;
// ─── Avatar helpers ───────────────────────────────────────────────────────────
// Simple MD5 implementation for Gravatar (no external deps needed)
function _md5(str) {
    function safeAdd(x, y) {
        const lsw = (x & 0xffff) + (y & 0xffff);
        return (((x >> 16) + (y >> 16) + (lsw >> 16)) << 16) | (lsw & 0xffff);
    }
    function bitRotateLeft(num, cnt) { return (num << cnt) | (num >>> (32 - cnt)); }
    function md5cmn(q, a, b, x, s, t2) { return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t2)), s), b); }
    function md5ff(a, b, c, d, x, s, t2) { return md5cmn((b & c) | (~b & d), a, b, x, s, t2); }
    function md5gg(a, b, c, d, x, s, t2) { return md5cmn((b & d) | (c & ~d), a, b, x, s, t2); }
    function md5hh(a, b, c, d, x, s, t2) { return md5cmn(b ^ c ^ d, a, b, x, s, t2); }
    function md5ii(a, b, c, d, x, s, t2) { return md5cmn(c ^ (b | ~d), a, b, x, s, t2); }
    const utf8 = unescape(encodeURIComponent(str));
    const m = [];
    for (let i = 0; i < utf8.length; i++)
        m[i >> 2] |= utf8.charCodeAt(i) << (i % 4 * 8);
    const length8 = utf8.length;
    m[length8 >> 2] |= 0x80 << (length8 % 4 * 8);
    m[(((length8 + 8) >> 6) + 1) * 16 - 2] = length8 * 8;
    let [a, b, c, d] = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476];
    for (let i = 0; i < m.length; i += 16) {
        const [oa, ob, oc, od] = [a, b, c, d];
        a = md5ff(a, b, c, d, m[i], 7, -680876936);
        d = md5ff(d, a, b, c, m[i + 1], 12, -389564586);
        c = md5ff(c, d, a, b, m[i + 2], 17, 606105819);
        b = md5ff(b, c, d, a, m[i + 3], 22, -1044525330);
        a = md5ff(a, b, c, d, m[i + 4], 7, -176418897);
        d = md5ff(d, a, b, c, m[i + 5], 12, 1200080426);
        c = md5ff(c, d, a, b, m[i + 6], 17, -1473231341);
        b = md5ff(b, c, d, a, m[i + 7], 22, -45705983);
        a = md5ff(a, b, c, d, m[i + 8], 7, 1770035416);
        d = md5ff(d, a, b, c, m[i + 9], 12, -1958414417);
        c = md5ff(c, d, a, b, m[i + 10], 17, -42063);
        b = md5ff(b, c, d, a, m[i + 11], 22, -1990404162);
        a = md5ff(a, b, c, d, m[i + 12], 7, 1804603682);
        d = md5ff(d, a, b, c, m[i + 13], 12, -40341101);
        c = md5ff(c, d, a, b, m[i + 14], 17, -1502002290);
        b = md5ff(b, c, d, a, m[i + 15], 22, 1236535329);
        a = md5gg(a, b, c, d, m[i + 1], 5, -165796510);
        d = md5gg(d, a, b, c, m[i + 6], 9, -1069501632);
        c = md5gg(c, d, a, b, m[i + 11], 14, 643717713);
        b = md5gg(b, c, d, a, m[i], 20, -373897302);
        a = md5gg(a, b, c, d, m[i + 5], 5, -701558691);
        d = md5gg(d, a, b, c, m[i + 10], 9, 38016083);
        c = md5gg(c, d, a, b, m[i + 15], 14, -660478335);
        b = md5gg(b, c, d, a, m[i + 4], 20, -405537848);
        a = md5gg(a, b, c, d, m[i + 9], 5, 568446438);
        d = md5gg(d, a, b, c, m[i + 14], 9, -1019803690);
        c = md5gg(c, d, a, b, m[i + 3], 14, -187363961);
        b = md5gg(b, c, d, a, m[i + 8], 20, 1163531501);
        a = md5gg(a, b, c, d, m[i + 13], 5, -1444681467);
        d = md5gg(d, a, b, c, m[i + 2], 9, -51403784);
        c = md5gg(c, d, a, b, m[i + 7], 14, 1735328473);
        b = md5gg(b, c, d, a, m[i + 12], 20, -1926607734);
        a = md5hh(a, b, c, d, m[i + 5], 4, -378558);
        d = md5hh(d, a, b, c, m[i + 8], 11, -2022574463);
        c = md5hh(c, d, a, b, m[i + 11], 16, 1839030562);
        b = md5hh(b, c, d, a, m[i + 14], 23, -35309556);
        a = md5hh(a, b, c, d, m[i + 1], 4, -1530992060);
        d = md5hh(d, a, b, c, m[i + 4], 11, 1272893353);
        c = md5hh(c, d, a, b, m[i + 7], 16, -155497632);
        b = md5hh(b, c, d, a, m[i + 10], 23, -1094730640);
        a = md5hh(a, b, c, d, m[i + 13], 4, 681279174);
        d = md5hh(d, a, b, c, m[i], 11, -358537222);
        c = md5hh(c, d, a, b, m[i + 3], 16, -722521979);
        b = md5hh(b, c, d, a, m[i + 6], 23, 76029189);
        a = md5hh(a, b, c, d, m[i + 9], 4, -640364487);
        d = md5hh(d, a, b, c, m[i + 12], 11, -421815835);
        c = md5hh(c, d, a, b, m[i + 15], 16, 530742520);
        b = md5hh(b, c, d, a, m[i + 2], 23, -995338651);
        a = md5ii(a, b, c, d, m[i], 6, -198630844);
        d = md5ii(d, a, b, c, m[i + 7], 10, 1126891415);
        c = md5ii(c, d, a, b, m[i + 14], 15, -1416354905);
        b = md5ii(b, c, d, a, m[i + 5], 21, -57434055);
        a = md5ii(a, b, c, d, m[i + 12], 6, 1700485571);
        d = md5ii(d, a, b, c, m[i + 3], 10, -1894986606);
        c = md5ii(c, d, a, b, m[i + 10], 15, -1051523);
        b = md5ii(b, c, d, a, m[i + 1], 21, -2054922799);
        a = md5ii(a, b, c, d, m[i + 8], 6, 1873313359);
        d = md5ii(d, a, b, c, m[i + 15], 10, -30611744);
        c = md5ii(c, d, a, b, m[i + 6], 15, -1560198380);
        b = md5ii(b, c, d, a, m[i + 13], 21, 1309151649);
        a = md5ii(a, b, c, d, m[i + 4], 6, -145523070);
        d = md5ii(d, a, b, c, m[i + 11], 10, -1120210379);
        c = md5ii(c, d, a, b, m[i + 2], 15, 718787259);
        b = md5ii(b, c, d, a, m[i + 9], 21, -343485551);
        a = safeAdd(a, oa);
        b = safeAdd(b, ob);
        c = safeAdd(c, oc);
        d = safeAdd(d, od);
    }
    return [a, b, c, d].map(n => {
        let hex = "";
        for (let j = 0; j < 4; j++)
            hex += ("0" + ((n >> (j * 8)) & 0xff).toString(16)).slice(-2);
        return hex;
    }).join("");
}
// Deterministic color from a string (used as fallback bg for initials avatar)
function _colorFromString(str) {
    const COLORS = [
        "#E57373", "#F06292", "#BA68C8", "#9575CD", "#7986CB",
        "#64B5F6", "#4FC3F7", "#4DD0E1", "#4DB6AC", "#81C784",
        "#AED581", "#FFD54F", "#FFB74D", "#FF8A65", "#A1887F",
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++)
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return COLORS[Math.abs(hash) % COLORS.LENGTH] || COLORS[Math.abs(hash) % COLORS.length];
}
function _initialsFromLabel(label) {
    if (!label)
        return "?";
    const parts = label.trim().split(/\s+/);
    if (parts.length >= 2)
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return label.slice(0, 2).toUpperCase();
}
function AccountAvatar({ account }) {
    const email = (account.emailAddress || "").trim().toLowerCase();
    const label = account.label || account.emailAddress || "";
    const hash = email ? _md5(email) : null;
    const gravatarUrl = hash
        ? `https://www.gravatar.com/avatar/${hash}?s=32&d=404`
        : null;
    const [imgFailed, setImgFailed] = mailspring_exports_1.React.useState(false);
    const initials = _initialsFromLabel(label);
    const bgColor = _colorFromString(email || label);
    if (gravatarUrl && !imgFailed) {
        return (mailspring_exports_1.React.createElement("span", { className: "account-avatar" },
            mailspring_exports_1.React.createElement("img", { src: gravatarUrl, alt: initials, onError: () => setImgFailed(true) })));
    }
    return (mailspring_exports_1.React.createElement("span", { className: "account-avatar account-avatar-initials", style: { background: bgColor } }, initials));
}
const STORAGE_KEY = "mailspring-classic-inbox-hidden-folders";
const FOLDERS = [
    {
        key: "inbox",
        label: mailspring_exports_1.localized("Inbox"),
        makePerspective: accountId => mailspring_exports_1.MailboxPerspective.forInbox([accountId]),
    },
    {
        key: "sent",
        label: mailspring_exports_1.localized("Sent"),
        makePerspective: accountId => mailspring_exports_1.MailboxPerspective.forStandardCategories([accountId], "sent"),
    },
    {
        key: "drafts",
        label: mailspring_exports_1.localized("Drafts"),
        makePerspective: accountId => mailspring_exports_1.MailboxPerspective.forDrafts([accountId]),
    },
    {
        key: "archive",
        label: mailspring_exports_1.localized("Archive"),
        makePerspective: accountId => mailspring_exports_1.MailboxPerspective.forStandardCategories([accountId], "archive", "all"),
    },
    {
        key: "spam",
        label: mailspring_exports_1.localized("Spam"),
        makePerspective: accountId => mailspring_exports_1.MailboxPerspective.forStandardCategories([accountId], "spam"),
    },
    {
        key: "trash",
        label: mailspring_exports_1.localized("Trash"),
        makePerspective: accountId => mailspring_exports_1.MailboxPerspective.forStandardCategories([accountId], "trash"),
    },
];
class AccountFoldersSidebar extends mailspring_exports_1.React.Component {
    constructor(props) {
        super(props);
        this._setSidebarRef = element => {
            this._sidebarRef = element;
        };
        // ─── localStorage ────────────────────────────────────────────────────────────
        this._loadHiddenFolderKeys = () => {
            try {
                const raw = localStorage.getItem(STORAGE_KEY);
                return raw ? JSON.parse(raw) : {};
            }
            catch (e) {
                return {};
            }
        };
        this._saveHiddenFolderKeys = keys => {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
            }
            catch (e) { }
        };
        this._hideFolderKey = key => {
            this.setState(prevState => {
                const hiddenFolderKeys = Object.assign(Object.assign({}, prevState.hiddenFolderKeys), { [key]: true });
                this._saveHiddenFolderKeys(hiddenFolderKeys);
                return { hiddenFolderKeys };
            });
        };
        this._showFolderKey = key => {
            this.setState(prevState => {
                const hiddenFolderKeys = Object.assign({}, prevState.hiddenFolderKeys);
                delete hiddenFolderKeys[key];
                this._saveHiddenFolderKeys(hiddenFolderKeys);
                return { hiddenFolderKeys };
            });
        };
        // ─── Store changes ────────────────────────────────────────────────────────────
        this._onStoreChange = () => {
            this.setState(prevState => (Object.assign(Object.assign({}, this._getStateFromStores()), { collapsedNodes: prevState.collapsedNodes, collapsedAccounts: prevState.collapsedAccounts, showHiddenAccounts: prevState.showHiddenAccounts, contextMenu: prevState.contextMenu, createDialog: prevState.createDialog, hiddenFolderKeys: prevState.hiddenFolderKeys })));
        };
        this._getStateFromStores = () => {
            return {
                accounts: mailspring_exports_1.AccountStore.accounts(),
                focusedPerspective: mailspring_exports_1.FocusedPerspectiveStore.current(),
            };
        };
        // ─── Account helpers ──────────────────────────────────────────────────────────
        this._accountLabel = account => account.label || account.emailAddress || account.id;
        this._toggleAccountCollapsed = accountId => {
            this.setState(prevState => ({
                collapsedAccounts: Object.assign(Object.assign({}, prevState.collapsedAccounts), { [accountId]: !prevState.collapsedAccounts[accountId] }),
            }));
        };
        this._isAccountCollapsed = accountId => !!this.state.collapsedAccounts[accountId];
        this._toggleShowHidden = accountId => {
            this.setState(prevState => ({
                showHiddenAccounts: Object.assign(Object.assign({}, prevState.showHiddenAccounts), { [accountId]: !prevState.showHiddenAccounts[accountId] }),
            }));
        };
        // ─── Folder builders ──────────────────────────────────────────────────────────
        this._stdFolderKey = (accountId, folderKey) => `std-${accountId}-${folderKey}`;
        this._standardFoldersForAccount = account => {
            const { hiddenFolderKeys } = this.state;
            return FOLDERS
                .map(folder => {
                const folderKey = this._stdFolderKey(account.id, folder.key);
                const perspective = folder.makePerspective(account.id);
                return {
                    key: folderKey,
                    folderKey,
                    label: folder.label,
                    perspective,
                    iconName: (perspective && perspective.iconName) || "folder.png",
                    isStandard: true,
                    hidden: !!hiddenFolderKeys[folderKey],
                };
            });
        };
        this._pathPartsForCategory = category => {
            const fallbackName = category.displayName || category.path || category.name || "Folder";
            const rawPath = String(category.path || category.displayName || category.name || fallbackName);
            const slashParts = rawPath.replace(/\\/g, "/").split("/").filter(Boolean);
            if (slashParts.length > 1) {
                return slashParts;
            }
            const dottedParts = String(fallbackName).split(".").filter(Boolean);
            if (dottedParts.length > 1) {
                return dottedParts;
            }
            return [fallbackName];
        };
        this._customFoldersForAccount = account => {
            const { hiddenFolderKeys } = this.state;
            const categories = mailspring_exports_1.CategoryStore.userCategories(account) || [];
            return categories
                .filter(category => category && !hiddenFolderKeys[category.id])
                .map(category => {
                const parts = this._pathPartsForCategory(category);
                const baseName = parts[parts.length - 1] || category.displayName || "Folder";
                return {
                    id: category.id,
                    key: `custom-${category.id}`,
                    folderKey: category.id,
                    label: baseName,
                    category,
                    isCustom: true,
                    iconName: "folder.png",
                    parts,
                    perspective: mailspring_exports_1.MailboxPerspective.forCategory(category),
                };
            });
        };
        this._customFolderTreeForAccount = account => {
            const folders = this._customFoldersForAccount(account).sort((a, b) => {
                const aPath = a.parts.join("/").toLowerCase();
                const bPath = b.parts.join("/").toLowerCase();
                return aPath.localeCompare(bPath);
            });
            const root = [];
            const nodeByPath = {};
            folders.forEach(folder => {
                let siblings = root;
                const currentPath = [];
                folder.parts.forEach((part, index) => {
                    currentPath.push(part);
                    const pathKey = currentPath.join("/").toLowerCase();
                    let node = nodeByPath[pathKey];
                    if (!node) {
                        node = {
                            key: `group-${pathKey}`,
                            folderKey: `group-${pathKey}`,
                            pathKey,
                            path: currentPath.join("/"),
                            label: part,
                            iconName: "folder.png",
                            perspective: null,
                            isCustom: true,
                            isGroup: true,
                            children: [],
                        };
                        nodeByPath[pathKey] = node;
                        siblings.push(node);
                    }
                    if (index === folder.parts.length - 1) {
                        node.key = folder.key;
                        node.folderKey = folder.folderKey;
                        node.pathKey = pathKey;
                        node.path = folder.parts.join("/");
                        node.label = folder.label;
                        node.category = folder.category;
                        node.isCustom = true;
                        node.iconName = folder.iconName;
                        node.perspective = folder.perspective;
                    }
                    siblings = node.children;
                });
            });
            return root;
        };
        // Returns hidden folders (both standard and custom) for the "manage hidden" panel
        this._hiddenFoldersForAccount = account => {
            const { hiddenFolderKeys } = this.state;
            const result = [];
            FOLDERS.forEach(folder => {
                const key = this._stdFolderKey(account.id, folder.key);
                if (hiddenFolderKeys[key]) {
                    result.push({ key, folderKey: key, label: folder.label });
                }
            });
            const categories = mailspring_exports_1.CategoryStore.userCategories(account) || [];
            categories.forEach(category => {
                if (category && hiddenFolderKeys[category.id]) {
                    const label = category.displayName || category.name || category.path || "Folder";
                    result.push({ key: category.id, folderKey: category.id, label });
                }
            });
            return result;
        };
        // ─── Node state ───────────────────────────────────────────────────────────────
        this._nodeStateKey = (accountId, pathKey) => `${accountId}:${pathKey}`;
        this._isNodeCollapsed = (accountId, pathKey) => {
            const key = this._nodeStateKey(accountId, pathKey);
            if (this.state.collapsedNodes[key] === undefined) {
                return true;
            }
            return !!this.state.collapsedNodes[key];
        };
        this._toggleNodeCollapsed = (accountId, pathKey) => {
            const key = this._nodeStateKey(accountId, pathKey);
            this.setState(prevState => ({
                collapsedNodes: Object.assign(Object.assign({}, prevState.collapsedNodes), { [key]: prevState.collapsedNodes[key] === undefined
                        ? false
                        : !prevState.collapsedNodes[key] }),
            }));
        };
        // ─── Drag & drop ─────────────────────────────────────────────────────────────
        this._shouldAcceptThreadDrop = (targetPerspective, event) => {
            if (!targetPerspective || !event || !event.dataTransfer) {
                return false;
            }
            if (!event.dataTransfer.types.includes("mailspring-threads-data")) {
                return false;
            }
            const current = this.state.focusedPerspective;
            if (current && targetPerspective.isEqual && targetPerspective.isEqual(current)) {
                return false;
            }
            const accountsType = event.dataTransfer.types.find(type => type.startsWith("mailspring-accounts="));
            const accountIds = (accountsType || "").replace("mailspring-accounts=", "").split(",");
            return targetPerspective.canReceiveThreadsFromAccountIds(accountIds);
        };
        this._onDropThreads = (targetPerspective, event) => {
            if (!targetPerspective || !event || !event.dataTransfer) {
                return;
            }
            const jsonString = event.dataTransfer.getData("mailspring-threads-data");
            let jsonData = null;
            try {
                jsonData = JSON.parse(jsonString);
            }
            catch (err) {
                return;
            }
            if (!jsonData || !jsonData.threadIds) {
                return;
            }
            targetPerspective.receiveThreadIds(jsonData.threadIds);
        };
        // ─── Category CRUD ────────────────────────────────────────────────────────────
        this._onCreateCategory = account => {
            return (displayName, parentPath = null) => {
                const rawName = (displayName || "").trim();
                const name = parentPath ? `${parentPath}/${rawName}` : rawName;
                if (!name) {
                    return;
                }
                mailspring_exports_1.Actions.queueTask(mailspring_exports_1.SyncbackCategoryTask.forCreating({
                    name,
                    accountId: account.id,
                }));
            };
        };
        this._onCreateCategoryFromAction = (account, parentPath = null, displayName = "") => {
            const name = (displayName || "").trim();
            if (!name) {
                return;
            }
            this._onCreateCategory(account)(name, parentPath);
        };
        this._onDeleteCategory = node => {
            if (!node || !node.category || !node.isCustom) {
                return;
            }
            const confirmed = window.confirm(t("Are you sure?"));
            if (!confirmed) {
                return;
            }
            // Hide immediately as optimistic UI (in-memory only, not persisted)
            const categoryId = node.category.id;
            if (categoryId) {
                this.setState(prevState => {
                    const hiddenFolderKeys = Object.assign(Object.assign({}, prevState.hiddenFolderKeys), { [categoryId]: true });
                    this._saveHiddenFolderKeys(hiddenFolderKeys);
                    return { hiddenFolderKeys };
                });
            }
            mailspring_exports_1.Actions.queueTask(new mailspring_exports_1.DestroyCategoryTask({
                path: node.category.path,
                accountId: node.category.accountId,
            }));
        };
        // ─── Misc helpers ─────────────────────────────────────────────────────────────
        this._iconNameForNode = node => {
            if (node.iconName)
                return node.iconName;
            if (node.perspective && node.perspective.iconName)
                return node.perspective.iconName;
            return "folder.png";
        };
        // ─── Context menu & dialogs ───────────────────────────────────────────────────
        this._hideContextMenu = () => {
            if (this.state.contextMenu) {
                this.setState({ contextMenu: null });
            }
        };
        this._hideCreateDialog = () => {
            if (this.state.createDialog) {
                this.setState({ createDialog: null });
            }
        };
        this._onGlobalMouseDown = event => {
            if (this.state.contextMenu) {
                const menu = this._sidebarRef && this._sidebarRef.querySelector
                    ? this._sidebarRef.querySelector(".custom-folder-context-menu")
                    : null;
                if (!menu || !menu.contains(event.target)) {
                    this._hideContextMenu();
                }
            }
            if (this.state.createDialog) {
                const dialog = this._sidebarRef && this._sidebarRef.querySelector
                    ? this._sidebarRef.querySelector(".custom-folder-create-dialog")
                    : null;
                if (!dialog || !dialog.contains(event.target)) {
                    this._hideCreateDialog();
                }
            }
        };
        this._onGlobalKeyDown = event => {
            if (event && event.key === "Escape") {
                this._hideContextMenu();
                this._hideCreateDialog();
            }
        };
        this._onContextMenuHide = () => {
            const menu = this.state.contextMenu;
            if (!menu || !menu.node)
                return;
            this._hideContextMenu();
            const node = menu.node;
            if (node.isGroup) {
                // Hide all categories whose path starts with this group's path
                const prefix = node.path.toLowerCase();
                const account = node.account;
                const categories = mailspring_exports_1.CategoryStore.userCategories(account) || [];
                const toHide = {};
                categories.forEach(category => {
                    const catPath = String(category.path || category.displayName || category.name || "").toLowerCase();
                    if (catPath === prefix || catPath.startsWith(prefix + "/")) {
                        toHide[category.id] = true;
                    }
                });
                if (Object.keys(toHide).length > 0) {
                    this.setState(prevState => {
                        const hiddenFolderKeys = Object.assign(Object.assign({}, prevState.hiddenFolderKeys), toHide);
                        this._saveHiddenFolderKeys(hiddenFolderKeys);
                        return { hiddenFolderKeys };
                    });
                }
            }
            else {
                const key = node.folderKey || node.key;
                this._hideFolderKey(key);
            }
        };
        this._onContextMenuCreate = () => {
            const menu = this.state.contextMenu;
            if (!menu || !menu.node)
                return;
            this.setState({
                contextMenu: null,
                createDialog: {
                    x: menu.x,
                    y: menu.y,
                    account: menu.node.account,
                    parentPath: menu.node.category ? menu.node.category.path : null,
                    value: "",
                },
            });
        };
        this._onContextMenuDelete = () => {
            const menu = this.state.contextMenu;
            if (!menu || !menu.node)
                return;
            this._hideContextMenu();
            this._onDeleteCategory(menu.node);
        };
        this._onCreateDialogInputChange = event => {
            const value = event && event.target ? event.target.value : "";
            this.setState(prevState => ({
                createDialog: prevState.createDialog
                    ? Object.assign(Object.assign({}, prevState.createDialog), { value }) : null,
            }));
        };
        this._onCreateDialogConfirm = () => {
            const dialog = this.state.createDialog;
            if (!dialog)
                return;
            this._onCreateCategoryFromAction(dialog.account, dialog.parentPath, dialog.value);
            this._hideCreateDialog();
        };
        this._onCreateDialogKeyDown = event => {
            if (!event)
                return;
            if (event.key === "Enter") {
                event.preventDefault();
                this._onCreateDialogConfirm();
            }
        };
        this._extractContextClass = target => {
            let node = target;
            while (node) {
                if (node.classList && node.classList.length > 0) {
                    const match = Array.from(node.classList).find(name => name.indexOf("ctx-folder-") === 0);
                    if (match)
                        return match;
                }
                node = node.parentElement;
            }
            return null;
        };
        this._onNativeContextMenuCapture = event => {
            if (!this._sidebarRef || !event || !event.target)
                return;
            const clickedInsideSidebar = this._sidebarRef.contains(event.target);
            if (!clickedInsideSidebar)
                return;
            const contextClass = this._extractContextClass(event.target);
            const node = contextClass ? this._contextMenuNodesById[contextClass] : null;
            if (!node) {
                this._hideContextMenu();
                return;
            }
            event.preventDefault();
            event.stopPropagation();
            this.setState({
                contextMenu: {
                    x: event.clientX,
                    y: event.clientY,
                    node,
                },
            });
        };
        // ─── OutlineView item builder ─────────────────────────────────────────────────
        this._asOutlineItem = (node, account) => {
            const accountId = account.id;
            const outlineId = `${accountId}-${node.key}`;
            const contextClass = `ctx-folder-${outlineId.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
            const hasChildren = node.children && node.children.length > 0;
            const count = node.perspective ? this._countForPerspective(node.perspective) : 0;
            const selected = node.perspective ? this._isSelected(node.perspective) : false;
            const childItems = (node.children || []).map(child => this._asOutlineItem(child, account));
            // Register all nodes (standard + custom) so any can be right-clicked
            if (node.isCustom || node.isStandard) {
                this._contextMenuNodesById[contextClass] = Object.assign(Object.assign({}, node), { account });
            }
            return {
                id: outlineId,
                name: node.label,
                iconName: this._iconNameForNode(node),
                className: (node.isCustom || node.isStandard) ? contextClass : undefined,
                count,
                selected,
                collapsed: hasChildren ? this._isNodeCollapsed(accountId, node.pathKey || node.key) : false,
                children: childItems,
                onDrop: node.perspective ? (item, event) => this._onDropThreads(node.perspective, event) : null,
                shouldAcceptDrop: node.perspective
                    ? (item, event) => this._shouldAcceptThreadDrop(node.perspective, event)
                    : null,
                onCollapseToggled: hasChildren
                    ? () => this._toggleNodeCollapsed(accountId, node.pathKey || node.key)
                    : undefined,
                onSelect: node.perspective ? () => this._onOpenFolder(node.perspective) : undefined,
            };
        };
        this._itemsForAccount = account => {
            const standardItems = this._standardFoldersForAccount(account)
                .filter(folder => !folder.hidden)
                .map(folder => {
                const node = {
                    key: folder.key,
                    folderKey: folder.folderKey,
                    label: folder.label,
                    iconName: folder.iconName,
                    perspective: folder.perspective,
                    isStandard: true,
                    children: [],
                };
                return this._asOutlineItem(node, account);
            });
            const customTreeItems = this._customFolderTreeForAccount(account).map(node => this._asOutlineItem(node, account));
            return standardItems.concat(customTreeItems);
        };
        // ─── Focus / counts ───────────────────────────────────────────────────────────
        this._onOpenFolder = perspective => {
            mailspring_exports_1.Actions.focusMailboxPerspective(perspective);
        };
        this._isSelected = perspective => {
            const current = this.state.focusedPerspective;
            return current && current.isEqual && current.isEqual(perspective);
        };
        this._countForPerspective = perspective => {
            if (!perspective || typeof perspective.unreadCount !== "function")
                return 0;
            const count = perspective.unreadCount();
            if (!count || count < 0)
                return 0;
            return count;
        };
        this.state = Object.assign(Object.assign({}, this._getStateFromStores()), { collapsedNodes: {}, collapsedAccounts: {}, showHiddenAccounts: {}, contextMenu: null, createDialog: null, hiddenFolderKeys: this._loadHiddenFolderKeys() });
        this._contextMenuNodesById = {};
        this._sidebarRef = null;
    }
    componentDidMount() {
        this.unsubscribeAccount = mailspring_exports_1.AccountStore.listen(this._onStoreChange);
        this.unsubscribeCategories = mailspring_exports_1.CategoryStore.listen(this._onStoreChange);
        this.unsubscribePerspective = mailspring_exports_1.FocusedPerspectiveStore.listen(this._onStoreChange);
        this.unsubscribeCounts = mailspring_exports_1.ThreadCountsStore.listen(this._onStoreChange);
        document.addEventListener("contextmenu", this._onNativeContextMenuCapture, true);
        document.addEventListener("mousedown", this._onGlobalMouseDown, true);
        document.addEventListener("keydown", this._onGlobalKeyDown, true);
    }
    componentWillUnmount() {
        if (this.unsubscribeAccount)
            this.unsubscribeAccount();
        if (this.unsubscribeCategories)
            this.unsubscribeCategories();
        if (this.unsubscribePerspective)
            this.unsubscribePerspective();
        if (this.unsubscribeCounts)
            this.unsubscribeCounts();
        document.removeEventListener("contextmenu", this._onNativeContextMenuCapture, true);
        document.removeEventListener("mousedown", this._onGlobalMouseDown, true);
        document.removeEventListener("keydown", this._onGlobalKeyDown, true);
    }
    // ─── Render ───────────────────────────────────────────────────────────────────
    render() {
        const { accounts, contextMenu, createDialog } = this.state;
        this._contextMenuNodesById = {};
        if (!accounts || accounts.length === 0) {
            return null;
        }
        return (mailspring_exports_1.React.createElement("div", { className: "account-folders-sidebar", ref: this._setSidebarRef },
            accounts.map(account => {
                const collapsed = this._isAccountCollapsed(account.id);
                const showHidden = !!this.state.showHiddenAccounts[account.id];
                const hiddenFolders = this._hiddenFoldersForAccount(account);
                const hasHidden = hiddenFolders.length > 0;
                return (mailspring_exports_1.React.createElement("div", { key: account.id, className: "account-section" },
                    mailspring_exports_1.React.createElement("div", { className: `account-section-header${collapsed ? " collapsed" : ""}`, onClick: () => this._toggleAccountCollapsed(account.id) },
                        mailspring_exports_1.React.createElement("span", { className: "account-section-arrow" }, collapsed ? "▶" : "▼"),
                        mailspring_exports_1.React.createElement(AccountAvatar, { account: account }),
                        mailspring_exports_1.React.createElement("span", { className: "account-section-label" }, this._accountLabel(account)),
                        hasHidden && (mailspring_exports_1.React.createElement("button", { type: "button", className: `account-section-eye${showHidden ? " active" : ""}`, title: showHidden ? t("Hide hidden folders") : t("Show hidden folders"), onClick: e => { e.stopPropagation(); this._toggleShowHidden(account.id); } }, "\uD83D\uDC41"))),
                    !collapsed && (mailspring_exports_1.React.createElement(mailspring_component_kit_1.OutlineView, { key: account.id, title: "", items: this._itemsForAccount(account) })),
                    !collapsed && showHidden && hasHidden && (mailspring_exports_1.React.createElement("div", { className: "hidden-folders-section" },
                        mailspring_exports_1.React.createElement("div", { className: "hidden-folders-title" }, t("Hidden folders")),
                        hiddenFolders.map(item => (mailspring_exports_1.React.createElement("div", { key: item.key, className: "hidden-folder-row" },
                            mailspring_exports_1.React.createElement("span", { className: "hidden-folder-name" }, item.label),
                            mailspring_exports_1.React.createElement("button", { type: "button", className: "hidden-folder-restore", onClick: () => this._showFolderKey(item.folderKey) }, t("Show")))))))));
            }),
            contextMenu ? (mailspring_exports_1.React.createElement("div", { className: "custom-folder-context-menu", style: { left: contextMenu.x, top: contextMenu.y } },
                mailspring_exports_1.React.createElement("button", { type: "button", className: "menu-item", onClick: this._onContextMenuHide }, t("Hide folder")),
                contextMenu.node.isCustom && !contextMenu.node.isGroup && [
                    mailspring_exports_1.React.createElement("button", { key: "create", type: "button", className: "menu-item", onClick: this._onContextMenuCreate }, t("Create subfolder")),
                    mailspring_exports_1.React.createElement("div", { key: "sep", className: "menu-separator" }),
                    mailspring_exports_1.React.createElement("button", { key: "delete", type: "button", className: "menu-item menu-item-danger", onClick: this._onContextMenuDelete }, `${mailspring_exports_1.localized("Delete")} ${contextMenu.node.label}`),
                ])) : null,
            createDialog ? (mailspring_exports_1.React.createElement("div", { className: "custom-folder-create-dialog", style: { left: createDialog.x, top: createDialog.y } },
                mailspring_exports_1.React.createElement("input", { autoFocus: true, type: "text", value: createDialog.value, placeholder: t("Create new subfolder"), onChange: this._onCreateDialogInputChange, onKeyDown: this._onCreateDialogKeyDown }),
                mailspring_exports_1.React.createElement("div", { className: "actions" },
                    mailspring_exports_1.React.createElement("button", { type: "button", className: "menu-item", onClick: this._onCreateDialogConfirm }, t("Create")),
                    mailspring_exports_1.React.createElement("button", { type: "button", className: "menu-item", onClick: this._hideCreateDialog }, t("Cancel"))))) : null));
    }
}
exports.default = AccountFoldersSidebar;
AccountFoldersSidebar.displayName = "AccountFoldersSidebar";
AccountFoldersSidebar.containerRequired = false;
AccountFoldersSidebar.containerStyles = {
    order: 0,
    flexShrink: 0,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjb3VudC1mb2xkZXJzLXNpZGViYXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvYWNjb3VudC1mb2xkZXJzLXNpZGViYXIuanN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMkRBVzRCO0FBQzVCLHVFQUF1RDtBQUV2RCxpRkFBaUY7QUFDakYsTUFBTSxjQUFjLEdBQUc7SUFDckIsRUFBRSxFQUFFO1FBQ0YsYUFBYSxFQUFFLGNBQWM7UUFDN0Isa0JBQWtCLEVBQUUsa0JBQWtCO1FBQ3RDLHFCQUFxQixFQUFFLHdCQUF3QjtRQUMvQyxxQkFBcUIsRUFBRSxzQkFBc0I7UUFDN0MsZ0JBQWdCLEVBQUUsZUFBZTtRQUNqQyxNQUFNLEVBQUUsVUFBVTtRQUNsQixzQkFBc0IsRUFBRSxnQkFBZ0I7UUFDeEMsUUFBUSxFQUFFLFNBQVM7UUFDbkIsUUFBUSxFQUFFLFFBQVE7UUFDbEIsZUFBZSxFQUFFLGFBQWE7S0FDL0I7Q0FDRixDQUFDO0FBRUYsTUFBTSxXQUFXLEdBQUcsQ0FBQyxPQUFPLE1BQU0sS0FBSyxXQUFXLElBQUksTUFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQ3JILE1BQU0sY0FBYyxHQUFHLGNBQWMsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDekQsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUM7QUFFOUMsaUZBQWlGO0FBRWpGLG1FQUFtRTtBQUNuRSxTQUFTLElBQUksQ0FBQyxHQUFHO0lBQ2YsU0FBUyxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDbkIsTUFBTSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUM7UUFDeEMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsQ0FBQztJQUN4RSxDQUFDO0lBQ0QsU0FBUyxhQUFhLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxPQUFPLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2hGLFNBQVMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxJQUFJLE9BQU8sT0FBTyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ25ILFNBQVMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsSUFBSSxPQUFPLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDM0YsU0FBUyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxJQUFJLE9BQU8sTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMzRixTQUFTLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLElBQUksT0FBTyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNsRixTQUFTLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLElBQUksT0FBTyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUVyRixNQUFNLElBQUksR0FBRyxRQUFRLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUMvQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDYixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUU7UUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ3JGLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7SUFDNUIsQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQzdDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLE9BQU8sR0FBRyxDQUFDLENBQUM7SUFFckQsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDcEUsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRTtRQUNyQyxNQUFNLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN0QyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsU0FBUyxDQUFDLENBQUM7UUFBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxFQUFDLEVBQUUsRUFBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsRUFBQyxFQUFFLEVBQUMsU0FBUyxDQUFDLENBQUM7UUFBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxFQUFDLEVBQUUsRUFBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ2hLLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsU0FBUyxDQUFDLENBQUM7UUFBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxFQUFDLEVBQUUsRUFBQyxVQUFVLENBQUMsQ0FBQztRQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLEVBQUMsRUFBRSxFQUFDLENBQUMsVUFBVSxDQUFDLENBQUM7UUFBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxFQUFDLEVBQUUsRUFBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2xLLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsRUFBQyxFQUFFLEVBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsRUFBRSxDQUFDLEVBQUMsRUFBRSxFQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7UUFBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLEVBQUUsQ0FBQyxFQUFDLEVBQUUsRUFBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ2xLLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsRUFBRSxDQUFDLEVBQUMsQ0FBQyxFQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxFQUFFLENBQUMsRUFBQyxFQUFFLEVBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsRUFBRSxDQUFDLEVBQUMsRUFBRSxFQUFDLENBQUMsVUFBVSxDQUFDLENBQUM7UUFBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLEVBQUUsQ0FBQyxFQUFDLEVBQUUsRUFBQyxVQUFVLENBQUMsQ0FBQztRQUN0SyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsRUFBRSxDQUFDLEVBQUMsRUFBRSxFQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLEVBQUUsRUFBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ2hLLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsU0FBUyxDQUFDLENBQUM7UUFBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLEVBQUUsQ0FBQyxFQUFDLENBQUMsRUFBQyxRQUFRLENBQUMsQ0FBQztRQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsRUFBRSxDQUFDLEVBQUMsRUFBRSxFQUFDLENBQUMsU0FBUyxDQUFDLENBQUM7UUFBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxFQUFDLEVBQUUsRUFBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ2pLLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxFQUFFLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLEVBQUMsRUFBRSxFQUFDLENBQUMsU0FBUyxDQUFDLENBQUM7UUFBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxFQUFDLEVBQUUsRUFBQyxVQUFVLENBQUMsQ0FBQztRQUNsSyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLEVBQUUsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLEVBQUMsRUFBRSxFQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxFQUFFLENBQUMsRUFBQyxFQUFFLEVBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNwSyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsRUFBQyxFQUFFLEVBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsRUFBRSxDQUFDLEVBQUMsRUFBRSxFQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxFQUFFLENBQUMsRUFBQyxFQUFFLEVBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNqSyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsRUFBQyxFQUFFLEVBQUMsVUFBVSxDQUFDLENBQUM7UUFBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxFQUFDLEVBQUUsRUFBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxFQUFFLENBQUMsRUFBQyxFQUFFLEVBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNySyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLEVBQUUsQ0FBQyxFQUFDLENBQUMsRUFBQyxTQUFTLENBQUMsQ0FBQztRQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxFQUFFLEVBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLEVBQUMsRUFBRSxFQUFDLENBQUMsU0FBUyxDQUFDLENBQUM7UUFBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxFQUFDLEVBQUUsRUFBQyxRQUFRLENBQUMsQ0FBQztRQUM5SixDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxFQUFFLENBQUMsRUFBQyxFQUFFLEVBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsRUFBRSxDQUFDLEVBQUMsRUFBRSxFQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsRUFBQyxFQUFFLEVBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNuSyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsU0FBUyxDQUFDLENBQUM7UUFBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxFQUFDLEVBQUUsRUFBQyxVQUFVLENBQUMsQ0FBQztRQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsRUFBRSxDQUFDLEVBQUMsRUFBRSxFQUFDLENBQUMsVUFBVSxDQUFDLENBQUM7UUFBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxFQUFDLEVBQUUsRUFBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2pLLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsRUFBRSxDQUFDLEVBQUMsQ0FBQyxFQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsRUFBQyxFQUFFLEVBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsRUFBRSxDQUFDLEVBQUMsRUFBRSxFQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7UUFBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxFQUFDLEVBQUUsRUFBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3BLLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxFQUFFLENBQUMsRUFBQyxFQUFFLEVBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLEVBQUMsRUFBRSxFQUFDLENBQUMsVUFBVSxDQUFDLENBQUM7UUFBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLEVBQUUsQ0FBQyxFQUFDLEVBQUUsRUFBQyxVQUFVLENBQUMsQ0FBQztRQUNwSyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxFQUFFLENBQUMsRUFBQyxFQUFFLEVBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLEVBQUMsRUFBRSxFQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsRUFBQyxFQUFFLEVBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNuSyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztLQUNoRjtJQUNELE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUU7UUFDMUIsSUFBSSxHQUFHLEdB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