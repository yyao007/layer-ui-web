/**
 * The Layer Date widget renders a date.
 *
 * This is provided as a specialized component so that it can be easily redefined by your app to
 * provide your own date formatting.
 *
 * @class layerUI.components.misc.MessageStatus
 * @extends layerUI.components.Component
 */
var LUIComponent = require('../../../components/component');
LUIComponent('layer-message-status', {
  properties: {

    /**
     * Message whose status is to be rendered
     *
     * @property {layer.Message}
     */
    message: {
      set: function(value){
        if (this.props.oldMessage) {
          this.props.oldMessage.off(null, null, this);
          this.props.oldMessage = null;
        }
        if (value) {
          this.props.oldMessage = value;
          value.on('messages:change', this.rerender, this);
          this.rerender();
        }
      }
    },

    /**
     * Provide property to override the function used to render a date for each Message Item.
     *
     * Note that changing this will not regenerate the list; this should be set when initializing a new List.
     *
     * ```javascript
     * statusItem.messageStatusRenderer = function(message) {
     *    return message.readStatus === layer.Constants.RECIPIENT_STATE.ALL ? 'read' : 'processing...';
     * };
     * ```
     *
     * @property {Function}
     */
    messageStatusRenderer: {}
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

    rerender: function(evt) {
      if (!evt || evt.hasProperty('recipientStatus')) {
        var message = this.message,
          text = '';
        if (this.messageStatusRenderer) {
          this.innerHTML = this.messageStatusRenderer(message);
        } else {
          if (message.isSaving()) {
            text = 'pending';
          } else if (message.deliveryStatus === layer.Constants.RECIPIENT_STATE.NONE) {
            text = 'sent';
          } else if (message.readStatus === layer.Constants.RECIPIENT_STATE.NONE) {
            text = 'delivered';
          } else if (message.readStatus === layer.Constants.RECIPIENT_STATE.ALL) {
            text = 'read';
          } else {
            text = 'read by some';
          }
          this.innerHTML = text;
        }
      }
    }
  }
});

