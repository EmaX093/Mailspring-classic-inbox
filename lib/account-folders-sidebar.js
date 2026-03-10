"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mailspring_exports_1 = require("mailspring-exports");
const mailspring_component_kit_1 = require("mailspring-component-kit");
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
        this._onStoreChange = () => {
            this.setState(prevState => {
                const hiddenCategoryIds = Object.assign({}, prevState.hiddenCategoryIds);
                const accounts = mailspring_exports_1.AccountStore.accounts() || [];
                const activeCategoryIds = new Set();
                accounts.forEach(account => {
                    const categories = mailspring_exports_1.CategoryStore.userCategories(account) || [];
                    categories.forEach(category => {
                        if (category && category.id) {
                            activeCategoryIds.add(category.id);
                        }
                    });
                });
                Object.keys(hiddenCategoryIds).forEach(categoryId => {
                    if (!activeCategoryIds.has(categoryId)) {
                        delete hiddenCategoryIds[categoryId];
                    }
                });
                return Object.assign(Object.assign({}, this._getStateFromStores()), { collapsedNodes: prevState.collapsedNodes, contextMenu: prevState.contextMenu, createDialog: prevState.createDialog, hiddenCategoryIds });
            });
        };
        this._getStateFromStores = () => {
            return {
                accounts: mailspring_exports_1.AccountStore.accounts(),
                focusedPerspective: mailspring_exports_1.FocusedPerspectiveStore.current(),
            };
        };
        this._accountLabel = account => account.label || account.emailAddress || account.id;
        this._standardFoldersForAccount = account => {
            return FOLDERS.map(folder => {
                const perspective = folder.makePerspective(account.id);
                return {
                    key: `std-${account.id}-${folder.key}`,
                    label: folder.label,
                    perspective,
                    iconName: (perspective && perspective.iconName) || "folder.png",
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
            const categories = mailspring_exports_1.CategoryStore.userCategories(account) || [];
            return categories
                .filter(category => category && !this.state.hiddenCategoryIds[category.id])
                .map(category => {
                const parts = this._pathPartsForCategory(category);
                const baseName = parts[parts.length - 1] || category.displayName || "Folder";
                return {
                    id: category.id,
                    key: `custom-${category.id}`,
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
            const categoryId = node.category.id;
            if (categoryId) {
                this.setState(prevState => ({
                    hiddenCategoryIds: Object.assign(Object.assign({}, prevState.hiddenCategoryIds), { [categoryId]: true }),
                }));
            }
            mailspring_exports_1.Actions.queueTask(new mailspring_exports_1.DestroyCategoryTask({
                path: node.category.path,
                accountId: node.category.accountId,
            }));
        };
        this._iconNameForNode = node => {
            if (node.iconName) {
                return node.iconName;
            }
            if (node.perspective && node.perspective.iconName) {
                return node.perspective.iconName;
            }
            return "folder.png";
        };
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
        this._onContextMenuCreate = () => {
            const menu = this.state.contextMenu;
            if (!menu || !menu.node) {
                return;
            }
            this.setState({
                contextMenu: null,
                createDialog: {
                    x: menu.x,
                    y: menu.y,
                    account: menu.node.account,
                    parentPath: menu.node.category.path,
                    value: "",
                },
            });
        };
        this._onContextMenuDelete = () => {
            const menu = this.state.contextMenu;
            if (!menu || !menu.node) {
                return;
            }
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
            if (!dialog) {
                return;
            }
            this._onCreateCategoryFromAction(dialog.account, dialog.parentPath, dialog.value);
            this._hideCreateDialog();
        };
        this._onCreateDialogKeyDown = event => {
            if (!event) {
                return;
            }
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
                    if (match) {
                        return match;
                    }
                }
                node = node.parentElement;
            }
            return null;
        };
        this._onNativeContextMenuCapture = event => {
            if (!this._sidebarRef || !event || !event.target) {
                return;
            }
            const clickedInsideSidebar = this._sidebarRef.contains(event.target);
            if (!clickedInsideSidebar) {
                return;
            }
            const contextClass = this._extractContextClass(event.target);
            const node = contextClass ? this._contextMenuNodesById[contextClass] : null;
            if (!node || !node.isCustom) {
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
        this._asOutlineItem = (node, account) => {
            const accountId = account.id;
            const outlineId = `${accountId}-${node.key}`;
            const contextClass = `ctx-folder-${outlineId.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
            const hasChildren = node.children && node.children.length > 0;
            const count = node.perspective ? this._countForPerspective(node.perspective) : 0;
            const selected = node.perspective ? this._isSelected(node.perspective) : false;
            const childItems = (node.children || []).map(child => this._asOutlineItem(child, account));
            if (node.isCustom) {
                this._contextMenuNodesById[contextClass] = Object.assign(Object.assign({}, node), { account });
            }
            return {
                id: outlineId,
                name: node.label,
                iconName: this._iconNameForNode(node),
                className: node.isCustom ? contextClass : undefined,
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
            const standardItems = this._standardFoldersForAccount(account).map(folder => {
                const node = {
                    key: folder.key,
                    label: folder.label,
                    iconName: folder.iconName,
                    perspective: folder.perspective,
                    children: [],
                };
                return this._asOutlineItem(node, account);
            });
            const customTreeItems = this._customFolderTreeForAccount(account).map(node => this._asOutlineItem(node, account));
            return standardItems.concat(customTreeItems);
        };
        this._onOpenFolder = perspective => {
            mailspring_exports_1.Actions.focusMailboxPerspective(perspective);
        };
        this._isSelected = perspective => {
            const current = this.state.focusedPerspective;
            return current && current.isEqual && current.isEqual(perspective);
        };
        this._countForPerspective = perspective => {
            if (!perspective || typeof perspective.unreadCount !== "function") {
                return 0;
            }
            const count = perspective.unreadCount();
            if (!count || count < 0) {
                return 0;
            }
            return count;
        };
        this.state = Object.assign(Object.assign({}, this._getStateFromStores()), { collapsedNodes: {}, contextMenu: null, createDialog: null, hiddenCategoryIds: {} });
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
    render() {
        const { accounts, contextMenu, createDialog } = this.state;
        this._contextMenuNodesById = {};
        if (!accounts || accounts.length === 0) {
            return null;
        }
        return (mailspring_exports_1.React.createElement("div", { className: "account-folders-sidebar", ref: this._setSidebarRef },
            accounts.map(account => (mailspring_exports_1.React.createElement(mailspring_component_kit_1.OutlineView, { key: account.id, title: this._accountLabel(account), items: this._itemsForAccount(account) }))),
            contextMenu ? (mailspring_exports_1.React.createElement("div", { className: "custom-folder-context-menu", style: { left: contextMenu.x, top: contextMenu.y } },
                mailspring_exports_1.React.createElement("button", { type: "button", className: "menu-item", onClick: this._onContextMenuCreate }, mailspring_exports_1.localized("Create new item")),
                mailspring_exports_1.React.createElement("button", { type: "button", className: "menu-item", onClick: this._onContextMenuDelete }, `${mailspring_exports_1.localized("Delete")} ${contextMenu.node.label}`))) : null,
            createDialog ? (mailspring_exports_1.React.createElement("div", { className: "custom-folder-create-dialog", style: { left: createDialog.x, top: createDialog.y } },
                mailspring_exports_1.React.createElement("input", { autoFocus: true, type: "text", value: createDialog.value, placeholder: mailspring_exports_1.localized("Create new item"), onChange: this._onCreateDialogInputChange, onKeyDown: this._onCreateDialogKeyDown }),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjb3VudC1mb2xkZXJzLXNpZGViYXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvYWNjb3VudC1mb2xkZXJzLXNpZGViYXIuanN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMkRBVzRCO0FBQzVCLHVFQUF1RDtBQUV2RCxNQUFNLE9BQU8sR0FBRztJQUNkO1FBQ0UsR0FBRyxFQUFFLE9BQU87UUFDWixLQUFLLEVBQUUsOEJBQVMsQ0FBQyxPQUFPLENBQUM7UUFDekIsZUFBZSxFQUFFLFNBQVMsQ0FBQyxFQUFFLENBQUMsdUNBQWtCLENBQUMsUUFBUSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUM7S0FDdkU7SUFDRDtRQUNFLEdBQUcsRUFBRSxNQUFNO1FBQ1gsS0FBSyxFQUFFLDhCQUFTLENBQUMsTUFBTSxDQUFDO1FBQ3hCLGVBQWUsRUFBRSxTQUFTLENBQUMsRUFBRSxDQUFDLHVDQUFrQixDQUFDLHFCQUFxQixDQUFDLENBQUMsU0FBUyxDQUFDLEVBQUUsTUFBTSxDQUFDO0tBQzVGO0lBQ0Q7UUFDRSxHQUFHLEVBQUUsUUFBUTtRQUNiLEtBQUssRUFBRSw4QkFBUyxDQUFDLFFBQVEsQ0FBQztRQUMxQixlQUFlLEVBQUUsU0FBUyxDQUFDLEVBQUUsQ0FBQyx1Q0FBa0IsQ0FBQyxTQUFTLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQztLQUN4RTtJQUNEO1FBQ0UsR0FBRyxFQUFFLFNBQVM7UUFDZCxLQUFLLEVBQUUsOEJBQVMsQ0FBQyxTQUFTLENBQUM7UUFDM0IsZUFBZSxFQUFFLFNBQVMsQ0FBQyxFQUFFLENBQzNCLHVDQUFrQixDQUFDLHFCQUFxQixDQUFDLENBQUMsU0FBUyxDQUFDLEVBQUUsU0FBUyxFQUFFLEtBQUssQ0FBQztLQUMxRTtJQUNEO1FBQ0UsR0FBRyxFQUFFLE1BQU07UUFDWCxLQUFLLEVBQUUsOEJBQVMsQ0FBQyxNQUFNLENBQUM7UUFDeEIsZUFBZSxFQUFFLFNBQVMsQ0FBQyxFQUFFLENBQUMsdUNB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