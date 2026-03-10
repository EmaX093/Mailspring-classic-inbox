"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mailspring_exports_1 = require("mailspring-exports");
const account_folders_sidebar_1 = __importDefault(require("./account-folders-sidebar"));
// Activate is called when the package is loaded. If your package previously
// saved state using `serialize` it is provided.
//
function activate() {
    mailspring_exports_1.ComponentRegistry.register(account_folders_sidebar_1.default, {
        location: mailspring_exports_1.WorkspaceStore.Location.RootSidebar,
    });
}
exports.activate = activate;
// Serialize is called when your package is about to be unmounted.
// You can return a state object that will be passed back to your package
// when it is re-activated.
//
function serialize() { }
exports.serialize = serialize;
// This **optional** method is called when the window is shutting down,
// or when your package is being updated or disabled. If your package is
// watching any files, holding external resources, providing commands or
// subscribing to events, release them here.
//
function deactivate() {
    mailspring_exports_1.ComponentRegistry.unregister(account_folders_sidebar_1.default);
}
exports.deactivate = deactivate;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsMkRBQXVFO0FBRXZFLHdGQUE4RDtBQUU5RCw0RUFBNEU7QUFDNUUsZ0RBQWdEO0FBQ2hELEVBQUU7QUFDRixTQUFnQixRQUFRO0lBQ3RCLHNDQUFpQixDQUFDLFFBQVEsQ0FBQyxpQ0FBcUIsRUFBRTtRQUNoRCxRQUFRLEVBQUUsbUNBQWMsQ0FBQyxRQUFRLENBQUMsV0FBVztLQUM5QyxDQUFDLENBQUM7QUFDTCxDQUFDO0FBSkQsNEJBSUM7QUFFRCxrRUFBa0U7QUFDbEUseUVBQXlFO0FBQ3pFLDJCQUEyQjtBQUMzQixFQUFFO0FBQ0YsU0FBZ0IsU0FBUyxLQUFJLENBQUM7QUFBOUIsOEJBQThCO0FBRTlCLHVFQUF1RTtBQUN2RSx3RUFBd0U7QUFDeEUsd0VBQXdFO0FBQ3hFLDRDQUE0QztBQUM1QyxFQUFFO0FBQ0YsU0FBZ0IsVUFBVTtJQUN4QixzQ0FBaUIsQ0FBQyxVQUFVLENBQUMsaUNBQXFCLENBQUMsQ0FBQztBQUN0RCxDQUFDO0FBRkQsZ0NBRUMifQ==