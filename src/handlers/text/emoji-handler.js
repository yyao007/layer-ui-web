/**
 * The Layer Emoji TextHandler replaces all :smile: and :-) with emoji images
 *
 * @class layerUI.handlers.text.Emoji
 * @extends layerUI.components.Component
 */
var Twemoji = require('twemoji');
var RemarkableParser = require('remarkable-emoji/setEmoji');
var layerUI = require('../../base');

layerUI.registerTextHandler({
  name: 'emoji-handler',
  order: 300,
  requiresEnable: true,
  handler: function(textData) {
    // Bug in RemarkableParser requires extra spacing around html tags to keep them away from the emoticon.
    var text = textData.text.replace(/<br\/>/g, ' <br/> ');

    // Parse it
    var parsed = RemarkableParser(text);

    // See if its an all-emoji line
    var allEmojiLine = !Twemoji.replace(parsed, function() {return '';}).match(/\S/);

    // Render the emoji images
    text = Twemoji.parse(RemarkableParser(text), {
      size: allEmojiLine ? '36x36' : '16x16',
      className: allEmojiLine ? 'emoji emoji-line' : 'emoji'
    });

    // Undo the extra spacing we added above
    text = text.replace(/ <br\/> /g, '<br/>');
    textData.text = text;
  }
});