/**
 * The Layer Conversation Item widget renders a single Conversation synopsis.
 *
 * This is designed to go inside of the layerUI.ConversationList widget, and be a concise enough summary that it can be scrolled through along
 * with hundreds of other Conversations Item widgets.
 *
 * Note that this widget is not designed to be used outside of the ConversationList; to simplify such use cases, we'd want to accept
 * `appId` and `conversationId` instead of `conversation`.
 *
 * Future Work:
 * * Badges for unread messages (currently just adds a css class so styling can change if there are any unread messages)
 *
 * @class layerUI.components.ConversationList.ConversationItem
 * @extends layerUI.components.Component
 */
var LUIComponent = require('../../../components/component');
LUIComponent('layer-conversation-item', {
  mixins: [require('../../../mixins/list-item')],
  properties: {
    item: {
      set: function(value) {
        this.render();
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
        if (this.nodes.delete) this.nodes.delete.item = value;
        if (this.nodes.title) this.nodes.title.item = value;
        if (this.nodes.lastMessage) {
          this.nodes.lastMessage.canRenderLastMessage = this.canRenderLastMessage;
          this.nodes.lastMessage.item = value;
        }
      }
    },

    /**
     * Enable deletion of this Conversation.
     *
     * This property is currently assumed to be settable at creation time only,
     * and does not rerender if changed.
     *
     * @property {Boolean}
     */
    deleteConversationEnabled: {
      type: Boolean,
      set: function(value) {
        if (this.nodes.delete) this.nodes.delete.enabled = value;
      }
    },

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
    canRenderLastMessage: {}
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
     * Generate a DOM ID for each user ID
     *
     * @method
     * @private
     * @param {String} id
     */
    getItemId: function(conversation) {
      return 'conversation-list-item-' + this.id + '-' + conversation.id.replace(/layer:\/\/\/conversations\//, '');
    },

    /**
     * Render this Conversation Item.
     *
     * @method
     * @private
     */
    render: function() {
      this.rerender();
    },

    /**
     * Update the rendering with new properties.
     *
     * @method
     * @private
     */
    rerender: function() {
      var users = this.item.participants.filter(function(user) {
        return !user.sessionOwner;
      });

      var lastMessageWidget = this.nodes.lastMessage;
      if (lastMessageWidget) {
        lastMessageWidget.listHeight = this.listHeight;
        lastMessageWidget.listWidth = this.listWidth;
      }

      this.nodes.avatar.users = users;

      // TODO: Support mode where it only looks at unread state of lastMessage
      this.classList[this.item.unreadCount ? 'add' : 'remove']('layer-conversation-unread-messages');
    },

    /**
     * Run a filter on this item, and hide it if it doesn't match the filter.
     *
     * @method
     * @param {String|Regex|Function} filter
     */
    runFilter: function(filter) {
      var conversation = this.props.item;
      var match;
      if (!filter) {
        match = true;
      } else if (typeof filter === 'function') {
        match = filter(conversation);
      } else {
        var values = [];
        if (conversation.metadata.conversationName) values.push(conversation.metadata.conversationName);
        conversation.participants.forEach(function(identity) {
          values.push(identity.displayName);
          values.push(identity.firstName);
          values.push(identity.lastName);
          values.push(identity.emailAddress);
        });
        if (filter instanceof RegExp) {
          match = values.filter(function(value) {
            return filter.test(value);
          }).length;
        } else {
          filter = filter.toLowerCase();
          match = values.filter(function(value) {
            if (value) {
              return value.toLowerCase().indexOf(filter) !== -1;
            } else {
              return false;
            }
          }).length;
        }
      }
      this.classList[match ? 'remove' : 'add']('layer-item-filtered');
    }
  }
})
