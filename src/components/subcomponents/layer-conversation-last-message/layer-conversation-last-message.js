/**
 * The Layer widget renders a Last Message for a layer.Conversation.
 *
 * This is provided as a specialized component so that it can be easily redefined by your app to
 * provide your own Conversation Last Message rendering:
 *
 * ```
 * layerUI.registerComponent('layer-conversation-last-message', {
 *   properties: {
 *      item: {}
 *   },
 *   methods: {
 *     created: function() {
 *       this.innerHTML = this.item.lastMessage.parts[0].body;
 *     }
 *   }
 * });
 *
 * // Call init after custom components are defined
 * layerUI.init({
 *   appId:  'layer:///apps/staging/UUID'
 * });
 * ```
 *
 * @class layerUI.components.subcomponents.ConversationLastMessage
 * @extends layerUI.components.Component
 */
import layerUI from '../../../base';
import { registerComponent } from '../../../components/component';

registerComponent('layer-conversation-last-message', {
  properties: {

    /**
     * The layer.Message to be rendered
     *
     * @property {layer.Message} [item=null]
     */
    item: {
      set(newValue, oldValue) {
        if (oldValue) oldValue.off(null, null, this);
        if (newValue) newValue.on('conversations:change', this.onRerender, this);
        this.onRender();
      },
    },

    /**
     * Provide a function to determine if the last message is rendered in the Conversation List.
     *
     * By default, only text/plain last-messages are rendered in the Conversation List.  A Message that is NOT rendered
     * is instead rendered using the MessageHandler's label: `(ICON) Image Message`
     *
     * ```javascript
     * listItem.canFullyRenderLastMessage = function(message) {
     *     return true; // Render all Last Messages
     * }
     * ```
     *
     * @property {Function} [canFullyRenderLastMessage=null]
     * @removed
     */
  },
  methods: {

    /**
     * Constructor.
     *
     * @method onCreate
     * @private
     */
    onCreate() {
    },

    onRender() {
      this.onRerender();
    },

    /**
     * Rerender this widget whenever the layer.Conversation has a change event reporting on a
     * new `lastMessage` property.
     *
     * Lookup a handler for the Message, and if one is found, see if `canFullyRenderLastMessage` allows it to be rendered.
     * If its allowed, append the Renderer as a child of this node; else set innerHTML to match the Handler's label.
     *
     * @method
     * @private
     * @param {Event} evt
     */
    onRerender(evt) {
      if (!evt || evt.hasProperty('lastMessage')) {
        const conversation = this.item;
        const message = conversation ? conversation.lastMessage : null;
        if (this.firstChild && this.firstChild.onDestroy) this.firstChild.onDestroy();
        this.innerHTML = '';
        if (message) {
          const handler = layerUI.getHandler(message, this);
          if (handler) {
            this.classList.add(handler.tagName);
            const conversationItem = this.parentComponent;
            // Create the element specified by the handler and add it as a childNode.
            if (!conversationItem || !conversationItem.canFullyRenderLastMessage || conversationItem.canFullyRenderLastMessage(message)) {
              const messageHandler = document.createElement(handler.tagName);
              messageHandler.parentComponent = this;
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
