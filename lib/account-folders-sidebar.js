"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mailspring_exports_1 = require("mailspring-exports");
const mailspring_component_kit_1 = require("mailspring-component-kit");
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
                            pathKey,
                            path: currentPath.join("/"),
                            label: part,
                            iconName: "folder.png",
                            perspective: null,
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
            const confirmed = window.confirm(mailspring_exports_1.localized("Are you sure?"));
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
            const key = menu.node.folderKey || menu.node.key;
            this._hideFolderKey(key);
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
                        mailspring_exports_1.React.createElement("span", { className: "account-section-label" }, this._accountLabel(account)),
                        hasHidden && (mailspring_exports_1.React.createElement("button", { type: "button", className: `account-section-eye${showHidden ? " active" : ""}`, title: showHidden ? mailspring_exports_1.localized("Hide hidden folders") : mailspring_exports_1.localized("Show hidden folders"), onClick: e => { e.stopPropagation(); this._toggleShowHidden(account.id); } }, "\uD83D\uDC41"))),
                    !collapsed && (mailspring_exports_1.React.createElement(mailspring_component_kit_1.OutlineView, { key: account.id, title: "", items: this._itemsForAccount(account) })),
                    !collapsed && showHidden && hasHidden && (mailspring_exports_1.React.createElement("div", { className: "hidden-folders-section" },
                        mailspring_exports_1.React.createElement("div", { className: "hidden-folders-title" }, mailspring_exports_1.localized("Hidden folders")),
                        hiddenFolders.map(item => (mailspring_exports_1.React.createElement("div", { key: item.key, className: "hidden-folder-row" },
                            mailspring_exports_1.React.createElement("span", { className: "hidden-folder-name" }, item.label),
                            mailspring_exports_1.React.createElement("button", { type: "button", className: "hidden-folder-restore", onClick: () => this._showFolderKey(item.folderKey) }, mailspring_exports_1.localized("Show")))))))));
            }),
            contextMenu ? (mailspring_exports_1.React.createElement("div", { className: "custom-folder-context-menu", style: { left: contextMenu.x, top: contextMenu.y } },
                mailspring_exports_1.React.createElement("button", { type: "button", className: "menu-item", onClick: this._onContextMenuHide }, mailspring_exports_1.localized("Hide folder")),
                contextMenu.node.isCustom && [
                    mailspring_exports_1.React.createElement("button", { key: "create", type: "button", className: "menu-item", onClick: this._onContextMenuCreate }, mailspring_exports_1.localized("Create subfolder")),
                    mailspring_exports_1.React.createElement("div", { key: "sep", className: "menu-separator" }),
                    mailspring_exports_1.React.createElement("button", { key: "delete", type: "button", className: "menu-item menu-item-danger", onClick: this._onContextMenuDelete }, `${mailspring_exports_1.localized("Delete")} ${contextMenu.node.label}`),
                ])) : null,
            createDialog ? (mailspring_exports_1.React.createElement("div", { className: "custom-folder-create-dialog", style: { left: createDialog.x, top: createDialog.y } },
                mailspring_exports_1.React.createElement("input", { autoFocus: true, type: "text", value: createDialog.value, placeholder: mailspring_exports_1.localized("Create new subfolder"), onChange: this._onCreateDialogInputChange, onKeyDown: this._onCreateDialogKeyDown }),
                mailspring_exports_1.React.createElement("div", { className: "actions" },
                    mailspring_exports_1.React.createElement("button", { type: "button", className: "menu-item", onClick: this._onCreateDialogConfirm }, mailspring_exports_1.localized("Create")),
                    mailspring_exports_1.React.createElement("button", { type: "button", className: "menu-item", onClick: this._hideCreateDialog }, mailspring_exports_1.localized("Cancel"))))) : null));
    }
}
exports.default = AccountFoldersSidebar;
AccountFoldersSidebar.displayName = "AccountFoldersSidebar";
AccountFoldersSidebar.containerRequired = false;
AccountFoldersSidebar.containerStyles = {
    order: 0,
    flexShrink: 0,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjb3VudC1mb2xkZXJzLXNpZGViYXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvYWNjb3VudC1mb2xkZXJzLXNpZGViYXIuanN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMkRBVzRCO0FBQzVCLHVFQUF1RDtBQUV2RCxNQUFNLFdBQVcsR0FBRyx5Q0FBeUMsQ0FBQztBQUU5RCxNQUFNLE9BQU8sR0FBRztJQUNkO1FBQ0UsR0FBRyxFQUFFLE9BQU87UUFDWixLQUFLLEVBQUUsOEJBQVMsQ0FBQyxPQUFPLENBQUM7UUFDekIsZUFBZSxFQUFFLFNBQVMsQ0FBQyxFQUFFLENBQUMsdUNBQWtCLENBQUMsUUFBUSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUM7S0FDdkU7SUFDRDtRQUNFLEdBQUcsRUFBRSxNQUFNO1FBQ1gsS0FBSyxFQUFFLDhCQUFTLENBQUMsTUFBTSxDQUFDO1FBQ3hCLGVBQWUsRUFBRSxTQUFTLENBQUMsRUFBRSxDQUFDLHVDQUFrQixDQUFDLHFCQUFxQixDQUFDLENBQUMsU0FBUyxDQUFDLEVBQUUsTUFBTSxDQUFDO0tBQzVGO0lBQ0Q7UUFDRSxHQUFHLEVBQUUsUUFBUTtRQUNiLEtBQUssRUFBRSw4QkFBUyxDQUFDLFFBQVEsQ0FBQztRQUMxQixlQUFlLEVBQUUsU0FBUyxDQUFDLEVBQUUsQ0FBQyx1Q0FBa0IsQ0FBQyxTQUFTLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQztLQUN4RTtJQUNEO1FBQ0UsR0FBRyxFQUFFLFNBQVM7UUFDZCxLQUFLLEVBQUUsOEJBQVMsQ0FBQyxTQUFTLENBQUM7UUFDM0IsZUFBZSxFQUFFLFNBQVMsQ0FBQyxFQUFFLENBQzNCLHVDQUFrQixDQUFDLHFCQUFxQixDQUFDLENBQUMsU0FBUyxDQUFDLEVBQUUsU0FBUyxFQUFFLEtBQUssQ0FBQztLQUMxRTtJQUNEO1FBQ0UsR0FBRyxFQUFFLE1BQU07UUFDWCxLQUFLLEVBQUUsOEJBQVMsQ0FBQyxNQUFNLENBQUM7UUFDeEIs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