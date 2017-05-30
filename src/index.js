/*
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
 *
 * NOTE: JSDuck is picking up on LayerUI and defining it to be a class
 * which we don't want; do not let JSDuck parse this file.
 */

var LayerUI = require('./layer-ui');

// Load Adapters
require('./adapters/angular');
require('./adapters/backbone');
require('./adapters/react');

// Load Main Components
require('./components/conversation-list-panel/layer-conversations-list/layer-conversations-list');
require('./components/identities-list-panel/layer-identities-list/layer-identities-list');
require('./components/membership-list-panel/layer-membership-list/layer-membership-list');
require('./components/layer-conversation-panel/layer-conversation-panel');
require('./components/layer-notifier/layer-notifier');


// Load standard utilities
require('./components/subcomponents/layer-file-upload-button/layer-file-upload-button');
require('./components/subcomponents/layer-send-button/layer-send-button');
require('./handlers/message/layer-message-text-plain');
require('./handlers/message/layer-message-image/layer-message-image');
require('./handlers/message/layer-message-video');
require('./handlers/text/autolinker');
require('./handlers/text/code-blocks');
require('./handlers/text/emoji');
require('./handlers/text/images');
require('./handlers/text/newline');
require('./handlers/text/youtube');
require('./utils/date-separator');

LayerUI.files = require('./utils/files');
LayerUI.animatedScrollTo = require('animated-scrollto');

LayerUI.mixins = {
  MessageHandler: require('./mixins/message-handler'),
  HasQuery: require('./mixins/has-query'),
  MainComponent: require('./mixins/main-component'),
  List: require('./mixins/list'),
  ListItem: require('./mixins/list-item'),
  ListSelection: require('./mixins/list-selection'),
  ListItemSelection: require('./mixins/list-item-selection'),
  FocusOnKeydown: require('./mixins/focus-on-keydown'),
};

// If we don't expose global.layerUI then custom templates can not load and call window.layerUI.registerTemplate()
module.exports = global.layerUI = LayerUI;
