/**
 * The Unknown MessageHandler renders unhandled content with a placeholder politely suggesting that a developer should probably handle it.
 *
 * @class layerUI.handlers.message.Unknown
 * @extends layerUI.components.Component
 */
var LUIComponent = require('../../components/component');
LUIComponent('layer-message-unknown', {
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
     * Format the text and render it.
     *
     * @method
     * @private
     */
    render: function() {
      var mimeTypes = this.message.parts.map(function(part) {
        return part.mimeType;
      }).join(', ');
      this.innerHTML = 'Message with mimeTypes ' + mimeTypes + ' has been received but has no renderer';
    }
  }
});

// Do not register this handler

