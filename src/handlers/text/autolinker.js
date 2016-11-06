var layerUI = require('../../base');
var Autolinker = require('autolinker');
var autolinker = new Autolinker( {
  truncate : {
    length   : 40,
    location : 'middle'
  }
});
/**
 * The Layer Image TextHandler replaces all image URLs with image tags
 *
 * @class layerUI.handlers.text.Autolinker
 */
layerUI.registerTextHandler({
  name: 'autolinker',
  order: 400,
  requiresEnable: true,
  handler: function(textData) {
    textData.text = autolinker.link(textData.text);
  }
});
