/**
 * The Layer Image TextHandler replaces all image URLs with image tags
 *
 * @class layerUI.handlers.text.Emoji
 * @extends layerUI.components.Component
 */
var layerUI = require('../../base');
layerUI.registerTextHandler({
  name: 'image-urls',
  order: 100,
  requiresEnable: true,
  handler: function(textData) {
    var isUrl = require('../../utils/is-url');
    var matches = textData.text.match(isUrl(['png', 'jpg', 'jpeg', 'gif']));
    if (matches) {
      matches.forEach(function(match) {
        textData.afterText.push('<img class="layer-parsed-image" src="' + match + '"></img>');
      });
    }
  }
});
