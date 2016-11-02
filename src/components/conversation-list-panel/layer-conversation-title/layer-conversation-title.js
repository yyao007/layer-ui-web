/**
 * The Layer widget renders a title for a layer.Conversation.
 *
 * This is provided as a specialized component so that it can be easily redefined by your app to
 * provide your own Conversation titles:
 *
 * ```
 * <script>
 * window.layerUI = {customComponents: ['layer-conversation-title']};
 * document.registerElement('layer-conversation-title', {
 *   prototype: Object.create(HTMLElement.prototype, {
 *     createdCallback: {
 *       this.innerHTML = this.item.metadata.myCustomTitle;
 *     }
 *   })
 * });
 * </script>
 * <script src='layer-websdkui-standard.js'></script>
 * ```
 *
 * @class layerUI.components.ConversationList.ConversationTitle
 * @extends layerUI.components.Component
 */
var LUIComponent = require('../../../components/component');
LUIComponent('layer-conversation-title', {
  properties: {

    /**
     * layer.Conversation to be rendered
     *
     * @property {layer.Conversation}
     */
    item: {
      set: function(value){
        // This component is not currently being used in a way where items change, so this block isn't
        // currently used, but is here as "best practice"
        if (this.props.oldConversation) {
          this.props.oldConversation.off(null, null, this);
          this.props.oldConversation = null;
        }
        if (value) {
          this.props.oldConversation = value;
          value.on('conversations:change', this.rerender, this);
        }
        this.rerender();
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

    rerender: function(evt) {
      if (!evt || evt.hasProperty('metadata') || evt.hasProperty('participants')) {
        var conversation = this.item;
        if (!conversation) {
          this.innerHTML = '';
        } else {
          var title =  conversation.metadata.conversationName ||
            conversation.metadata.title;
          if (!title) {
            var userNames = conversation.participants
              .filter(function(user) {
                return !user.sessionOwner;
              })
              .filter(function(user) {
                return user.displayName;
              }).map(function(user) {
                return user.displayName
              });
            if (userNames.length) {
              title = userNames.join(', ').replace(/, ([^,]*)$/, " and $1")
            } else {
              title = 'No Title';
            }
          }
          if (title !== this.innerHTML) this.innerHTML = title;
        }
      }
    }
  }
});
