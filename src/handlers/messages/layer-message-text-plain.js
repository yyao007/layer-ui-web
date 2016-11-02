/**
 * The Layer Plain Text MessageHandler renders a single text/plain message part.
 *
 * See layerUI.registerTextHandler for details on adding new text processing capabilities.
 *
 * @class layerUI.handlers.message.TextPlain
 * @extends layerUI.components.Component
 */
var layerUI = require('../../base');
var LUIComponent = require('../../components/component');
LUIComponent('layer-message-text-plain', {
  properties: {

    /**
     * The Message property provides the MessageParts we are going to render.
     *
     * @property {layer.Message}
     */
    message: {
      set: function(value){
        this.render();
      }
    }
  },
  methods: {

    /**
     * Constructor.
     *
     * @method created
     * @private
     */
    created: function() {
    },

    /**
     * Replaces any html tags with escaped html tags so that the recipient
     * sees tags rather than rendered html.
     *
     * @method
     * @private
     */
    fixHtml: function(body) {
      body = body.replace(/\</g, '&lt;');
      body = body.replace(/\>/g, '&gt;');
      return body;
    },

    /**
     * Format the text and render it.
     *
     * @method
     * @private
     */
    render: function() {
      if (!layerUI.textHandlersOrdered) this.setupOrderedHandlers();

      var text = this.message.parts[0].body;
      var textData = {
        text: this.fixHtml(text),
        afterText: []
      };

      layerUI.textHandlersOrdered.forEach(function(handler) {
        handler(textData);
      }, this);
      this.innerHTML = textData.text + (textData.afterText.length ? '<br/><br/>' + textData.afterText.join('<br/>') : '');
    },

    setupOrderedHandlers: function() {
      layerUI.textHandlersOrdered = Object.keys(layerUI.textHandlers).filter(function(handlerName) {
        return layerUI.textHandlers[handlerName].enabled;
      }).map(function(handlerName) {
        return layerUI.textHandlers[handlerName];
      }).sort(function(a, b) {
        if (a.order > b.order) return 1;
        if (b.order > a.order) return -1;
        return 0;
      }).map(function(handlerObj) {
        return handlerObj.handler;
      });
    }
  }
});

// Handle any text/plain Message
layerUI.registerMessageHandler({
  tagName: 'layer-message-text-plain',
  label: 'Text',
  handlesMessage: function(message, container) {
    return message.parts.length === 1 && message.parts[0].mimeType === 'text/plain';
  },
});

