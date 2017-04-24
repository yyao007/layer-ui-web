/**
 * The AfterTextHandler mixin can be added to your webcomponent if building a widget for rendering
 * content extracted from a plain/text message.  Examples include:
 *
 * * Articles and pictures fetched from a server
 * * Translations of messages
 * * Videos referenced from the message
 *
 * The following example registers a text handler for any message containing `ipsum lorem`,
 * and replaces it with ipsum lorem text retrieved from the server.
 * ```
 *
    layerUI.registerTextHandler({
      name: 'ipsum',
      handler: function(textData, message, isMessageListItemComponent) {
        if (isMessageListItemComponent) {
          var matches = textData.text.match(/ipsum lorem/);
          if (matches) {
            var handler = document.createElement('ipsum-lorem-handler');
            textData.afterNodes.push(handler);
          }
        }
      }
    });

    layerUI.registerComponent('ipsum-lorem-handler', {
      mixins: [layerUI.mixins.AfterTextHandler],
      style: 'ipsum-lorem-handler {display: flex; flex-direction: column; justify-content: center; overflow-y: auto;}',
      methods: {
        onAfterCreate() {
          layer.xhr({
            url: "https://baconipsum.com/api/?type=meat-and-filler&paras=1&start-with-lorem=1&format=text",
          }, this._processResult.bind(this));
          this.style.height = (this.messageWidget.clientHeight + 80) +  'px';
        },
        _processResult(result) {
            this.innerHTML = this.message.parts[0].body.replace(/ipsum lorem/, result.data);
        },
      }
    });
 * ```
 *
 * @class layerUI.mixins.AfterTextHandler
 */

module.exports = {
  properties: {
    /**
     * The layer.Message to be rendered.  Set prior to onAfterCreate.
     *
     * @property {layer.Message} message
     */
    message: {},

    /**
     * The layerUI.components.MessagesListPanel.Item widget that has rendered your message.
     *
     * This property point to the widget, and the widget's onRender method already called before
     * onAfterCreate is called.
     *
     * @property {layerUI.components.MessagesListPanel.Item} messageWidget
     */
    messageWidget: {},
  },
  methods: {
    onAfterCreate: {
      conditional() {
        return this.message && !this.message.isNew();
      },
    },
    onRender: {
      conditional() {
        return this.message && !this.message.isNew();
      },
    },
  },
};
