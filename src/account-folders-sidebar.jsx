import {
  React,
  AccountStore,
  CategoryStore,
  FocusedPerspectiveStore,
  ThreadCountsStore,
  Actions,
  MailboxPerspective,
  SyncbackCategoryTask,
  DestroyCategoryTask,
  localized,
} from "mailspring-exports";
import { OutlineView } from "mailspring-component-kit";

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

const STORAGE_KEY = "mailspring-classic-inbox-hidden-folders";

const FOLDERS = [
  {
    key: "inbox",
    label: localized("Inbox"),
    makePerspective: accountId => MailboxPerspective.forInbox([accountId]),
  },
  {
    key: "sent",
    label: localized("Sent"),
    makePerspective: accountId => MailboxPerspective.forStandardCategories([accountId], "sent"),
  },
  {
    key: "drafts",
    label: localized("Drafts"),
    makePerspective: accountId => MailboxPerspective.forDrafts([accountId]),
  },
  {
    key: "archive",
    label: localized("Archive"),
    makePerspective: accountId =>
      MailboxPerspective.forStandardCategories([accountId], "archive", "all"),
  },
  {
    key: "spam",
    label: localized("Spam"),
    makePerspective: accountId => MailboxPerspective.forStandardCategories([accountId], "spam"),
  },
  {
    key: "trash",
    label: localized("Trash"),
    makePerspective: accountId => MailboxPerspective.forStandardCategories([accountId], "trash"),
  },
];

export default class AccountFoldersSidebar extends React.Component {
  static displayName = "AccountFoldersSidebar";

  static containerRequired = false;

  static containerStyles = {
    order: 0,
    flexShrink: 0,
  };

  constructor(props) {
    super(props);
    this.state = {
      ...this._getStateFromStores(),
      collapsedNodes: {},
      collapsedAccounts: {},
      showHiddenAccounts: {},
      contextMenu: null,
      createDialog: null,
      hiddenFolderKeys: this._loadHiddenFolderKeys(),
    };
    this._contextMenuNodesById = {};
    this._sidebarRef = null;
  }

  componentDidMount() {
    this.unsubscribeAccount = AccountStore.listen(this._onStoreChange);
    this.unsubscribeCategories = CategoryStore.listen(this._onStoreChange);
    this.unsubscribePerspective = FocusedPerspectiveStore.listen(this._onStoreChange);
    this.unsubscribeCounts = ThreadCountsStore.listen(this._onStoreChange);
    document.addEventListener("contextmenu", this._onNativeContextMenuCapture, true);
    document.addEventListener("mousedown", this._onGlobalMouseDown, true);
    document.addEventListener("keydown", this._onGlobalKeyDown, true);
  }

  componentWillUnmount() {
    if (this.unsubscribeAccount) this.unsubscribeAccount();
    if (this.unsubscribeCategories) this.unsubscribeCategories();
    if (this.unsubscribePerspective) this.unsubscribePerspective();
    if (this.unsubscribeCounts) this.unsubscribeCounts();
    document.removeEventListener("contextmenu", this._onNativeContextMenuCapture, true);
    document.removeEventListener("mousedown", this._onGlobalMouseDown, true);
    document.removeEventListener("keydown", this._onGlobalKeyDown, true);
  }

  _setSidebarRef = element => {
    this._sidebarRef = element;
  };

  // ─── localStorage ────────────────────────────────────────────────────────────

  _loadHiddenFolderKeys = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  };

  _saveHiddenFolderKeys = keys => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
    } catch (e) {}
  };

  _hideFolderKey = key => {
    this.setState(prevState => {
      const hiddenFolderKeys = { ...prevState.hiddenFolderKeys, [key]: true };
      this._saveHiddenFolderKeys(hiddenFolderKeys);
      return { hiddenFolderKeys };
    });
  };

  _showFolderKey = key => {
    this.setState(prevState => {
      const hiddenFolderKeys = { ...prevState.hiddenFolderKeys };
      delete hiddenFolderKeys[key];
      this._saveHiddenFolderKeys(hiddenFolderKeys);
      return { hiddenFolderKeys };
    });
  };

  // ─── Store changes ────────────────────────────────────────────────────────────

  _onStoreChange = () => {
    this.setState(prevState => ({
      ...this._getStateFromStores(),
      collapsedNodes: prevState.collapsedNodes,
      collapsedAccounts: prevState.collapsedAccounts,
      showHiddenAccounts: prevState.showHiddenAccounts,
      contextMenu: prevState.contextMenu,
      createDialog: prevState.createDialog,
      hiddenFolderKeys: prevState.hiddenFolderKeys,
    }));
  };

  _getStateFromStores = () => {
    return {
      accounts: AccountStore.accounts(),
      focusedPerspective: FocusedPerspectiveStore.current(),
    };
  };

  // ─── Account helpers ──────────────────────────────────────────────────────────

  _accountLabel = account => account.label || account.emailAddress || account.id;

  _toggleAccountCollapsed = accountId => {
    this.setState(prevState => ({
      collapsedAccounts: {
        ...prevState.collapsedAccounts,
        [accountId]: !prevState.collapsedAccounts[accountId],
      },
    }));
  };

  _isAccountCollapsed = accountId => !!this.state.collapsedAccounts[accountId];

  _toggleShowHidden = accountId => {
    this.setState(prevState => ({
      showHiddenAccounts: {
        ...prevState.showHiddenAccounts,
        [accountId]: !prevState.showHiddenAccounts[accountId],
      },
    }));
  };

  // ─── Folder builders ──────────────────────────────────────────────────────────

  _stdFolderKey = (accountId, folderKey) => `std-${accountId}-${folderKey}`;

  _standardFoldersForAccount = account => {
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

  _pathPartsForCategory = category => {
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

  _customFoldersForAccount = account => {
    const { hiddenFolderKeys } = this.state;
    const categories = CategoryStore.userCategories(account) || [];
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
          perspective: MailboxPerspective.forCategory(category),
        };
      });
  };

  _customFolderTreeForAccount = account => {
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
  _hiddenFoldersForAccount = account => {
    const { hiddenFolderKeys } = this.state;
    const result = [];

    FOLDERS.forEach(folder => {
      const key = this._stdFolderKey(account.id, folder.key);
      if (hiddenFolderKeys[key]) {
        result.push({ key, folderKey: key, label: folder.label });
      }
    });

    const categories = CategoryStore.userCategories(account) || [];
    categories.forEach(category => {
      if (category && hiddenFolderKeys[category.id]) {
        const label = category.displayName || category.name || category.path || "Folder";
        result.push({ key: category.id, folderKey: category.id, label });
      }
    });

    return result;
  };

  // ─── Node state ───────────────────────────────────────────────────────────────

  _nodeStateKey = (accountId, pathKey) => `${accountId}:${pathKey}`;

  _isNodeCollapsed = (accountId, pathKey) => {
    const key = this._nodeStateKey(accountId, pathKey);
    if (this.state.collapsedNodes[key] === undefined) {
      return true;
    }
    return !!this.state.collapsedNodes[key];
  };

  _toggleNodeCollapsed = (accountId, pathKey) => {
    const key = this._nodeStateKey(accountId, pathKey);
    this.setState(prevState => ({
      collapsedNodes: {
        ...prevState.collapsedNodes,
        [key]:
          prevState.collapsedNodes[key] === undefined
            ? false
            : !prevState.collapsedNodes[key],
      },
    }));
  };

  // ─── Drag & drop ─────────────────────────────────────────────────────────────

  _shouldAcceptThreadDrop = (targetPerspective, event) => {
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

    const accountsType = event.dataTransfer.types.find(type =>
      type.startsWith("mailspring-accounts=")
    );
    const accountIds = (accountsType || "").replace("mailspring-accounts=", "").split(",");
    return targetPerspective.canReceiveThreadsFromAccountIds(accountIds);
  };

  _onDropThreads = (targetPerspective, event) => {
    if (!targetPerspective || !event || !event.dataTransfer) {
      return;
    }
    const jsonString = event.dataTransfer.getData("mailspring-threads-data");
    let jsonData = null;
    try {
      jsonData = JSON.parse(jsonString);
    } catch (err) {
      return;
    }
    if (!jsonData || !jsonData.threadIds) {
      return;
    }
    targetPerspective.receiveThreadIds(jsonData.threadIds);
  };

  // ─── Category CRUD ────────────────────────────────────────────────────────────

  _onCreateCategory = account => {
    return (displayName, parentPath = null) => {
      const rawName = (displayName || "").trim();
      const name = parentPath ? `${parentPath}/${rawName}` : rawName;
      if (!name) {
        return;
      }
      Actions.queueTask(
        SyncbackCategoryTask.forCreating({
          name,
          accountId: account.id,
        })
      );
    };
  };

  _onCreateCategoryFromAction = (account, parentPath = null, displayName = "") => {
    const name = (displayName || "").trim();
    if (!name) {
      return;
    }
    this._onCreateCategory(account)(name, parentPath);
  };

  _onDeleteCategory = node => {
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
        const hiddenFolderKeys = { ...prevState.hiddenFolderKeys, [categoryId]: true };
        this._saveHiddenFolderKeys(hiddenFolderKeys);
        return { hiddenFolderKeys };
      });
    }

    Actions.queueTask(
      new DestroyCategoryTask({
        path: node.category.path,
        accountId: node.category.accountId,
      })
    );
  };

  // ─── Misc helpers ─────────────────────────────────────────────────────────────

  _iconNameForNode = node => {
    if (node.iconName) return node.iconName;
    if (node.perspective && node.perspective.iconName) return node.perspective.iconName;
    return "folder.png";
  };

  // ─── Context menu & dialogs ───────────────────────────────────────────────────

  _hideContextMenu = () => {
    if (this.state.contextMenu) {
      this.setState({ contextMenu: null });
    }
  };

  _hideCreateDialog = () => {
    if (this.state.createDialog) {
      this.setState({ createDialog: null });
    }
  };

  _onGlobalMouseDown = event => {
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

  _onGlobalKeyDown = event => {
    if (event && event.key === "Escape") {
      this._hideContextMenu();
      this._hideCreateDialog();
    }
  };

  _onContextMenuHide = () => {
    const menu = this.state.contextMenu;
    if (!menu || !menu.node) return;
    this._hideContextMenu();
    const node = menu.node;

    if (node.isGroup) {
      // Hide all categories whose path starts with this group's path
      const prefix = node.path.toLowerCase();
      const account = node.account;
      const categories = CategoryStore.userCategories(account) || [];
      const toHide = {};
      categories.forEach(category => {
        const catPath = String(category.path || category.displayName || category.name || "").toLowerCase();
        if (catPath === prefix || catPath.startsWith(prefix + "/")) {
          toHide[category.id] = true;
        }
      });
      if (Object.keys(toHide).length > 0) {
        this.setState(prevState => {
          const hiddenFolderKeys = { ...prevState.hiddenFolderKeys, ...toHide };
          this._saveHiddenFolderKeys(hiddenFolderKeys);
          return { hiddenFolderKeys };
        });
      }
    } else {
      const key = node.folderKey || node.key;
      this._hideFolderKey(key);
    }
  };

  _onContextMenuCreate = () => {
    const menu = this.state.contextMenu;
    if (!menu || !menu.node) return;
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

  _onContextMenuDelete = () => {
    const menu = this.state.contextMenu;
    if (!menu || !menu.node) return;
    this._hideContextMenu();
    this._onDeleteCategory(menu.node);
  };

  _onCreateDialogInputChange = event => {
    const value = event && event.target ? event.target.value : "";
    this.setState(prevState => ({
      createDialog: prevState.createDialog
        ? { ...prevState.createDialog, value }
        : null,
    }));
  };

  _onCreateDialogConfirm = () => {
    const dialog = this.state.createDialog;
    if (!dialog) return;
    this._onCreateCategoryFromAction(dialog.account, dialog.parentPath, dialog.value);
    this._hideCreateDialog();
  };

  _onCreateDialogKeyDown = event => {
    if (!event) return;
    if (event.key === "Enter") {
      event.preventDefault();
      this._onCreateDialogConfirm();
    }
  };

  _extractContextClass = target => {
    let node = target;
    while (node) {
      if (node.classList && node.classList.length > 0) {
        const match = Array.from(node.classList).find(name => name.indexOf("ctx-folder-") === 0);
        if (match) return match;
      }
      node = node.parentElement;
    }
    return null;
  };

  _onNativeContextMenuCapture = event => {
    if (!this._sidebarRef || !event || !event.target) return;

    const clickedInsideSidebar = this._sidebarRef.contains(event.target);
    if (!clickedInsideSidebar) return;

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

  _asOutlineItem = (node, account) => {
    const accountId = account.id;
    const outlineId = `${accountId}-${node.key}`;
    const contextClass = `ctx-folder-${outlineId.replace(/[^a-zA-Z0-9_-]/g, "_")}`;

    const hasChildren = node.children && node.children.length > 0;
    const count = node.perspective ? this._countForPerspective(node.perspective) : 0;
    const selected = node.perspective ? this._isSelected(node.perspective) : false;
    const childItems = (node.children || []).map(child => this._asOutlineItem(child, account));

    // Register all nodes (standard + custom) so any can be right-clicked
    if (node.isCustom || node.isStandard) {
      this._contextMenuNodesById[contextClass] = { ...node, account };
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

  _itemsForAccount = account => {
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

    const customTreeItems = this._customFolderTreeForAccount(account).map(node =>
      this._asOutlineItem(node, account)
    );

    return standardItems.concat(customTreeItems);
  };

  // ─── Focus / counts ───────────────────────────────────────────────────────────

  _onOpenFolder = perspective => {
    Actions.focusMailboxPerspective(perspective);
  };

  _isSelected = perspective => {
    const current = this.state.focusedPerspective;
    return current && current.isEqual && current.isEqual(perspective);
  };

  _countForPerspective = perspective => {
    if (!perspective || typeof perspective.unreadCount !== "function") return 0;
    const count = perspective.unreadCount();
    if (!count || count < 0) return 0;
    return count;
  };

  // ─── Render ───────────────────────────────────────────────────────────────────

  render() {
    const { accounts, contextMenu, createDialog } = this.state;
    this._contextMenuNodesById = {};

    if (!accounts || accounts.length === 0) {
      return null;
    }

    return (
      <div className="account-folders-sidebar" ref={this._setSidebarRef}>
        {accounts.map(account => {
          const collapsed = this._isAccountCollapsed(account.id);
          const showHidden = !!this.state.showHiddenAccounts[account.id];
          const hiddenFolders = this._hiddenFoldersForAccount(account);
          const hasHidden = hiddenFolders.length > 0;

          return (
            <div key={account.id} className="account-section">
              <div
                className={`account-section-header${collapsed ? " collapsed" : ""}`}
                onClick={() => this._toggleAccountCollapsed(account.id)}
              >
                <span className="account-section-arrow">{collapsed ? "▶" : "▼"}</span>
                <span className="account-section-label">{this._accountLabel(account)}</span>
                {hasHidden && (
                  <button
                    type="button"
                    className={`account-section-eye${showHidden ? " active" : ""}`}
                    title={showHidden ? t("Hide hidden folders") : t("Show hidden folders")}
                    onClick={e => { e.stopPropagation(); this._toggleShowHidden(account.id); }}
                  >
                    👁
                  </button>
                )}
              </div>
              {!collapsed && (
                <OutlineView
                  key={account.id}
                  title=""
                  items={this._itemsForAccount(account)}
                />
              )}
              {!collapsed && showHidden && hasHidden && (
                <div className="hidden-folders-section">
                  <div className="hidden-folders-title">{t("Hidden folders")}</div>
                  {hiddenFolders.map(item => (
                    <div key={item.key} className="hidden-folder-row">
                      <span className="hidden-folder-name">{item.label}</span>
                      <button
                        type="button"
                        className="hidden-folder-restore"
                        onClick={() => this._showFolderKey(item.folderKey)}
                      >
                        {t("Show")}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {contextMenu ? (
          <div
            className="custom-folder-context-menu"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button type="button" className="menu-item" onClick={this._onContextMenuHide}>
              {t("Hide folder")}
            </button>
            {contextMenu.node.isCustom && !contextMenu.node.isGroup && [
              <button key="create" type="button" className="menu-item" onClick={this._onContextMenuCreate}>
                {t("Create subfolder")}
              </button>,
              <div key="sep" className="menu-separator" />,
              <button key="delete" type="button" className="menu-item menu-item-danger" onClick={this._onContextMenuDelete}>
                {`${localized("Delete")} ${contextMenu.node.label}`}
              </button>,
            ]}
          </div>
        ) : null}
        {createDialog ? (
          <div
            className="custom-folder-create-dialog"
            style={{ left: createDialog.x, top: createDialog.y }}
          >
            <input
              autoFocus
              type="text"
              value={createDialog.value}
              placeholder={t("Create new subfolder")}
              onChange={this._onCreateDialogInputChange}
              onKeyDown={this._onCreateDialogKeyDown}
            />
            <div className="actions">
              <button type="button" className="menu-item" onClick={this._onCreateDialogConfirm}>
                {t("Create")}
              </button>
              <button type="button" className="menu-item" onClick={this._hideCreateDialog}>
                {t("Cancel")}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    );
  }
}
