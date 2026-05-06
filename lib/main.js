"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.serialize = exports.activate = void 0;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLDJEQUF1RTtBQUV2RSx3RkFBOEQ7QUFFOUQsNEVBQTRFO0FBQzVFLGdEQUFnRDtBQUNoRCxFQUFFO0FBQ0YsU0FBZ0IsUUFBUTtJQUN0QixzQ0FBaUIsQ0FBQyxRQUFRLENBQUMsaUNBQXFCLEVBQUU7UUFDaEQsUUFBUSxFQUFFLG1DQUFjLENBQUMsUUFBUSxDQUFDLFdBQVc7S0FDOUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQUpELDRCQUlDO0FBRUQsa0VBQWtFO0FBQ2xFLHlFQUF5RTtBQUN6RSwyQkFBMkI7QUFDM0IsRUFBRTtBQUNGLFNBQWdCLFNBQVMsS0FBSSxDQUFDO0FBQTlCLDhCQUE4QjtBQUU5Qix1RUFBdUU7QUFDdkUsd0VBQXdFO0FBQ3hFLHdFQUF3RTtBQUN4RSw0Q0FBNEM7QUFDNUMsRUFBRTtBQUNGLFNBQWdCLFVBQVU7SUFDeEIsc0NBQWlCLENBQUMsVUFBVSxDQUFDLGlDQUFxQixDQUFDLENBQUM7QUFDdEQsQ0FBQztBQUZELGdDQUVDIn0=