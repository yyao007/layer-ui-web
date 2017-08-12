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
require('./components/conversation-list/layer-conversation-list/layer-conversation-list');
require('./components/identity-list/layer-identity-list/layer-identity-list');
require('./components/membership-list-panel/layer-membership-list/layer-membership-list');
require('./components/layer-conversation-view/layer-conversation-view');
require('./components/layer-notifier/layer-notifier');
require('./components/subcomponents/layer-presence/layer-presence');


// Load standard utilities
require('./components/subcomponents/layer-file-upload-button/layer-file-upload-button');
require('./components/subcomponents/layer-send-button/layer-send-button');
require('./handlers/message/layer-card-view');
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

// Load standard cards
require('./cards/text/text-model');
require('./cards/text/layer-text-card');

import './cards/response/response-model';
import './cards/response/layer-response-card';

import './cards/receipt/receipt-model';
import './cards/receipt/layer-receipt-card';

import './cards/choice/choice-model';
import './cards/choice/layer-choice-card';

import './cards/layer-standard-card-container';
import './cards/layer-titled-card-container';
//import './cards/layer-list-item-container';
import './cards/text/layer-text-card';
import './cards/text/text-model';

import './cards/image/image-model';
import './cards/image/layer-image-card';

// import './cards/list/list-model';
// import './cards/list/layer-list-card';

import './cards/carousel/carousel-model';
import './cards/carousel/layer-carousel-card';

import './cards/buttons/buttons-model';
import './cards/buttons/layer-buttons-card';

import './cards/file/file-model';
import './cards/file/layer-file-card';

import './cards/link/link-model';
import './cards/link/layer-link-card';

import './cards/location/location-model';
import './cards/location/layer-location-card';

// import './cards/address/address-model';
// import './cards/address/layer-address-card';

import './cards/product/product-model';
import './cards/product/layer-product-card';

import './cards/models/person-model';
import './cards/models/organization-model';

LayerUI.files = require('./utils/files');
LayerUI.animatedScrollTo = require('./utils/animated-scroll').animatedScrollTo;
LayerUI.animatedScrollLeftTo = require('./utils/animated-scroll').animatedScrollLeftTo;

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
