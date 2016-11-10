/**
 * The Layer widget renders a Last Message for a layer.Conversation.
 *
 * This is provided as a specialized component so that it can be easily redefined by your app to
 * provide your own Conversation Last Message rendering:
 *
 * ```
 * <script>
 * window.layerUI = {customComponents: ['layer-conversation-last-message']};
 * document.registerElement('layer-conversation-last-message', {
 *   prototype: Object.create(HTMLElement.prototype, {
 *     createdCallback: {
 *       this.innerHTML = this.item.lastMessage.parts[0].body;
 *     }
 *   })
 * });
 * </script>
 * <script src='layer-websdkui-standard.js'></script>
 * ```
 *
 * @class layerUI.components.subcomponents.ConversationLastMessage
 * @extends layerUI.components.Component
 */
import layerUI from '../../../base';
import LUIComponent from '../../../components/component';

LUIComponent('layer-conversation-last-message', {
  properties: {

    /**
     * layer.Message to be rendered
     *
     * @property {layer.Message}
     */
    item: {
      set(value) {
        // This component is not currently being used in a way where items change, so this block isn't
        // currently used, but is here as "best practice"
        if (this.properties.oldConversation) {
          this.properties.oldConversation.off(null, null, this);
          this.properties.oldConversation = null;
        }
        if (value) {
          this.properties.oldConversation = value;
          value.on('conversations:change', this.rerender, this);
        }
        this.rerender();
      },
    },

    listHeight: {},
    listWidth: {},

    /**
     * Provide a function to determine if the last message is rendered in the Conversation List.
     *
     * By default, only text/plain last-messages are rendered in the Conversation List.
     *
     * ```javascript
     * listItem.canRenderLastMessage = function(message) {
     *     return true; // Render all Last Messages
     * }
     * ```
     *
     * @property {Function}
     */
    canRenderLastMessage: {},
  },
  methods: {

    /**
     * Constructor.
     *
     * @method created
     * @private
     */
    created() {
    },

    rerender(evt) {
      if (!evt || evt.hasProperty('lastMessage')) {
        const conversation = this.item;
        const message = conversation ? conversation.lastMessage : null;
        if (!message) {
          this.innerHTML = '';
        } else {
          if (this.firstChild) this.removeChild(this.firstChild);

          let handler;
          if (message) {
            handler = layerUI.getHandler(message, this);
          }

          if (handler) {
            this.classList.add(handler.tagName);
            if (!this.canRenderLastMessage || this.canRenderLastMessage(message)) {
              const messageHandler = document.createElement(handler.tagName);

              // TODO: Need better calculations for height to allocate for rendering images
              messageHandler.listHeight = this.listHeight;
              messageHandler.listWidth = this.listWidth / 2;
              messageHandler.noPadding = true;
              messageHandler.message = message;
              this.appendChild(messageHandler);
            } else if (handler.label) {
              this.innerHTML = `<div class="layer-custom-mime-type">${handler.label}</div>`;
            }
          }
        }
      }
    },
  },
});
