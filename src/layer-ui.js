/**
 * Import this if you want just a basic setup without any built-in widgets.
 *
 * Import index.js instead of you want a standard setup with standard widgets installed.
 */

import 'webcomponents.js/webcomponents-lite';
import layerUI from './base';
import { registerComponent, registerAll, unregisterComponent, registerMessageComponent } from './components/component';
import './handlers/message/layer-message-unknown';

layerUI.registerComponent = registerComponent;
layerUI.registerMessageComponent = registerMessageComponent;

/**
 * Unregister a component.  Must be called before layerUI.init().
 *
 * Use this call to prevent a component from being registered with the document.
 * Currently this works only on components that have been already called with `layerUI.registerComponent`
 * but which have not yet been completed via a call to `layerUI.init()`.
 *
 * This is not typically needed, but allows you to defer creation of a widget, and then at some point later in your application lifecycle
 * define a replacement for that widget. You can not redefine an html tag that is registered with the document... but this prevents it from
 * being registered yet.
 */
layerUI.unregisterComponent = unregisterComponent;

layerUI.init = function init(settings = {}) {
  Object.keys(settings).forEach((name) => {
    layerUI.settings[name] = settings[name];
  });

  if (!layerUI.settings.mixins) layerUI.settings.mixins = [];

  // Register all widgets
  registerAll();

  // Enable the text handlers
  layerUI.settings.textHandlers.forEach((handlerName) => {
    layerUI.registerTextHandler({ name: handlerName });
  });
};

module.exports = layerUI;
