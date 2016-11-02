/**
 * This file is used to create a browserified build with the following properties:
 *
 * * Initializes webcomponent-light polyfil
 * * Hooks up all methods/properties in the layerUI namespace
 * * Initializes and registers all widgets of this library
 *
 * Note that you may create your own build that includes:
 *
 * * webcomponent polyfil
 * * Hooks up all methods/properties in the layerUI namespace
 * * Pick and choose modules from the lib folder to include
 */

// Load the polyfil
require('webcomponents.js/webcomponents-lite.js');

// Load layerUI namespace methods/properties
var layerUI = require("./lib/base");
var initSettings = layerUI.init;
layerUI.init = function(settings) {
  initSettings(settings);

/*** GRUNT GENERATED CODE ***/
  require("./lib/adapters/angular");
  require("./lib/adapters/backbone");
  require("./lib/adapters/react");
  require("./lib/components/conversation-list-panel/layer-conversation-item/layer-conversation-item");
  require("./lib/components/conversation-list-panel/layer-conversation-last-message/layer-conversation-last-message");
  require("./lib/components/conversation-list-panel/layer-conversation-list/layer-conversation-list");
  require("./lib/components/conversation-list-panel/layer-conversation-title/layer-conversation-title");
  require("./lib/components/conversation-panel/layer-compose-button-panel/layer-compose-button-panel");
  require("./lib/components/conversation-panel/layer-composer/layer-composer");
  require("./lib/components/conversation-panel/layer-conversation/layer-conversation");
  require("./lib/components/conversation-panel/layer-message-item/layer-message-item");
  require("./lib/components/conversation-panel/layer-message-list/layer-message-list");
  require("./lib/components/conversation-panel/layer-typing-indicator/layer-typing-indicator");
  require("./lib/components/misc/layer-avatar/layer-avatar");
  require("./lib/components/misc/layer-date/layer-date");
  require("./lib/components/misc/layer-delete/layer-delete");
  require("./lib/components/misc/layer-file-upload-button/layer-file-upload-button");
  require("./lib/components/misc/layer-message-status/layer-message-status");
  require("./lib/components/misc/layer-notifier/layer-notifier");
  require("./lib/components/user-panel/layer-user-item/layer-user-item");
  require("./lib/components/user-panel/layer-user-list/layer-user-list");
  require("./lib/handlers/messages/layer-message-image");
  require("./lib/handlers/messages/layer-message-text-plain");
  require("./lib/handlers/messages/layer-message-unknown");
  require("./lib/handlers/messages/layer-message-video");
  require("./lib/handlers/text/autolinker");
  require("./lib/handlers/text/code-blocks");
  require("./lib/handlers/text/emoji-handler");
  require("./lib/handlers/text/image-urls");
  require("./lib/handlers/text/newline");
  require("./lib/handlers/text/youtube-urls");
  require("./lib/mixins/has-query");
  require("./lib/mixins/list-item");
  require("./lib/mixins/list");
  require("./lib/mixins/main-component");
  require("./lib/utils/files");
  require("./lib/utils/is-url");
  require("./lib/utils/sizing");
/*** GRUNT END GENERATED CODE ***/
};
module.exports = layerUI;