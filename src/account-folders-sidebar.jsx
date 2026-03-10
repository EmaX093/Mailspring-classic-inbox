import {
  React,
  AccountStore,
  CategoryStore,
  FocusedPerspectiveStore,
  ThreadCountsStore,
  Actions,
  MailboxPerspective,
} from "mailspring-exports";
import { OutlineView } from "mailspring-component-kit";

const FOLDERS = [
  {
    key: "inbox",
    label: "Inbox",
    makePerspective: accountId => MailboxPerspective.forInbox([accountId]),
  },
  {
    key: "sent",
    label: "Sent",
    makePerspective: accountId => MailboxPerspective.forStandardCategories([accountId], "sent"),
  },
  {
    key: "drafts",
    label: "Drafts",
    makePerspective: accountId => MailboxPerspective.forDrafts([accountId]),
  },
  {
    key: "archive",
    label: "Archive",
    makePerspective: accountId =>
      MailboxPerspective.forStandardCategories([accountId], "archive", "all"),
  },
  {
    key: "spam",
    label: "Spam",
    makePerspective: accountId => MailboxPerspective.forStandardCategories([accountId], "spam"),
  },
  {
    key: "trash",
    label: "Trash",
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
    };
  }

  componentDidMount() {
    this.unsubscribeAccount = AccountStore.listen(this._onStoreChange);
    this.unsubscribeCategories = CategoryStore.listen(this._onStoreChange);
    this.unsubscribePerspective = FocusedPerspectiveStore.listen(this._onStoreChange);
    this.unsubscribeCounts = ThreadCountsStore.listen(this._onStoreChange);
  }

  componentWillUnmount() {
    if (this.unsubscribeAccount) this.unsubscribeAccount();
    if (this.unsubscribeCategories) this.unsubscribeCategories();
    if (this.unsubscribePerspective) this.unsubscribePerspective();
    if (this.unsubscribeCounts) this.unsubscribeCounts();
  }

  _onStoreChange = () => {
    this.setState(prevState => ({
      ...this._getStateFromStores(),
      collapsedNodes: prevState.collapsedNodes,
    }));
  };

  _getStateFromStores = () => {
    return {
      accounts: AccountStore.accounts(),
      focusedPerspective: FocusedPerspectiveStore.current(),
    };
  };

  _accountLabel = account => account.label || account.emailAddress || account.id;

  _standardFoldersForAccount = account => {
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
    const categories = CategoryStore.userCategories(account) || [];
    return categories.map(category => {
      const parts = this._pathPartsForCategory(category);
      const baseName = parts[parts.length - 1] || category.displayName || "Folder";
      return {
        id: category.id,
        key: `custom-${category.id}`,
        label: baseName,
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
            pathKey,
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
          node.label = folder.label;
          node.iconName = folder.iconName;
          node.perspective = folder.perspective;
        }

        siblings = node.children;
      });
    });

    return root;
  };

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
        [key]: !prevState.collapsedNodes[key],
      },
    }));
  };

  _iconNameForNode = node => {
    if (node.iconName) {
      return node.iconName;
    }
    if (node.perspective && node.perspective.iconName) {
      return node.perspective.iconName;
    }
    return "folder.png";
  };

  _asOutlineItem = (node, accountId) => {
    const hasChildren = node.children && node.children.length > 0;
    const count = node.perspective ? this._countForPerspective(node.perspective) : 0;
    const selected = node.perspective ? this._isSelected(node.perspective) : false;

    return {
      id: `${accountId}-${node.key}`,
      name: node.label,
      iconName: this._iconNameForNode(node),
      count,
      selected,
      collapsed: hasChildren ? this._isNodeCollapsed(accountId, node.pathKey || node.key) : false,
      children: (node.children || []).map(child => this._asOutlineItem(child, accountId)),
      onCollapseToggled: hasChildren
        ? () => this._toggleNodeCollapsed(accountId, node.pathKey || node.key)
        : undefined,
      onSelect: node.perspective ? () => this._onOpenFolder(node.perspective) : undefined,
    };
  };

  _itemsForAccount = account => {
    const standardItems = this._standardFoldersForAccount(account).map(folder => {
      const node = {
        key: folder.key,
        label: folder.label,
        iconName: folder.iconName,
        perspective: folder.perspective,
        children: [],
      };
      return this._asOutlineItem(node, account.id);
    });

    const customTreeItems = this._customFolderTreeForAccount(account).map(node =>
      this._asOutlineItem(node, account.id)
    );

    return standardItems.concat(customTreeItems);
  };

  _onOpenFolder = perspective => {
    Actions.focusMailboxPerspective(perspective);
  };

  _isSelected = perspective => {
    const current = this.state.focusedPerspective;
    return current && current.isEqual && current.isEqual(perspective);
  };

  _countForPerspective = perspective => {
    if (!perspective || typeof perspective.unreadCount !== "function") {
      return 0;
    }

    const count = perspective.unreadCount();
    if (!count || count < 0) {
      return 0;
    }
    return count;
  };

  render() {
    const { accounts } = this.state;

    if (!accounts || accounts.length === 0) {
      return null;
    }

    return (
      <div className="account-folders-sidebar">
        {accounts.map(account => (
          <OutlineView
            key={account.id}
            title={this._accountLabel(account)}
            items={this._itemsForAccount(account)}
          />
        ))}
      </div>
    );
  }
}
