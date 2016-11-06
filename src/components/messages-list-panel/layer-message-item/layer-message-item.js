/**
 * The Layer Message Item widget renders a single Message synopsis.
 *
 * This is designed to go inside of the layerUI.MessageList widget.  This widget renders the framework of information that goes around a Message,
 * but leaves it up to custom handlers to render the contents and assorted MIME Types of the messages.
 *
 * This Component has two named templates:
 *
 * * `layer-message-item-sent`: Rendering for Messages sent by the owner of this Session
 * * `layer-message-item-received`: Rendering for Messages sent by other users
 *
 * @class layerUI.components.MessagesListPanel.Item
 * @mixins layerUI.mixins.ListItem
 * @extends layerUI.components.Component
 */
var layer = require('../../../base').layer;
var LUIComponent = require('../../../components/component');
LUIComponent('layer-message-item', {
  mixins: [require('../../../mixins/list-item')],
  properties: {

    /**
     * The layer.Message that this widget is rendering.
     *
     * @property {layer.Message}
     */
    item: {
      set: function(value){
        // Disconnect from any previous Message we were rendering
        if (this.props.priorMessage) {
          this.props.priorMessage.off(null, null, this);
          if (this.props.priorMessage.sender.sessionOwner) {
            this.removeClass('layer-message-item-sent');
          } else {
            this.removeClass('layer-message-item-received');
          }
        }
        this.props.priorMessage = value;

        if (value) {
          // Any changes to the Message should trigger a rerender
          value.on('messages:change', this.rerender, this);

          // Setup the proper sent/received class
          if (value.sender.sessionOwner) {
            this.addClass('layer-message-item-sent');
          } else {
            this.addClass('layer-message-item-received');
          }
          this.render();
        }
      }
    },

    /**
     * Deletion of this Message is enabled.
     *
     * @property {Function}
     */
    getDeleteEnabled: {
      type: Function
    },

    /**
     * HTML Tag to generate for the current content
     *
     * @private
     * @property {String}
     */
    contentTag: {
      set: function(value) {
        if (this.props.oldContentTag) {
          this.removeClass(this.contentTag);
          this.props.oldContentTag = '';
        }
        if (value) {
          this.addClass(value);
          this.props.oldContentTag = value;
        }
      }
    },

    /**
     * Provide property to override the function used to render a date for each Message Item.
     *
     * Note that changing this will not regenerate the list; this should be set when initializing a new List.
     *
     * ```javascript
     * messageItem.dateRenderer = function(date) {
     *    return date.toISOString();
     * };
     * ```
     *
     * @property {Function}
     */
    dateRenderer: {},

    /**
     * Provide property to override the function used to render a date for each Message Item.
     *
     * Note that changing this will not regenerate the list; this should be set when initializing a new List.
     *
     * ```javascript
     * messageItem.messageStatusRenderer = function(message) {
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

    /**
     * Initial rendering of static properties of the Message (sender)
     *
     * Rendering of MessageParts is handled via layerUI.MessageItem.setContentTag().
     *
     * @method
     * @private
     */
    render: function() {
      if (!this.props.item) return;
      this.innerHTML = '';

      // Select and apply the correct template
      var template = this.getTemplate(this.props.item.sender.sessionOwner ? 'layer-message-item-sent' : 'layer-message-item-received');
      if (!template) {
        template = this.getTemplate();
      }
      var clone = document.importNode(template.content, true);
      this.appendChild(clone);
      this.setupDomNodes();
      this.innerNode = this.nodes.innerNode;

      // Setup the layer-sender-name
      if (this.nodes.sender) {
        this.nodes.sender.innerHTML = this.item.sender.displayName;
      }

      if (this.nodes.avatar) {
        this.nodes.avatar.users = [this.item.sender];
      }

      // Setup the layer-date
      if (this.nodes.date) {
        if (this.dateRenderer) this.nodes.date.dateRenderer = this.dateRenderer;
        this.nodes.date.date = this.item.sentAt;
      }

      // Setup the layer-message-status
      if (this.nodes.status) {
        if (this.messageStatusRenderer) this.nodes.status.messageStatusRenderer = this.messageStatusRenderer;
        this.nodes.status.message = this.item;
      }

      // Setup the layer-delete
      if (this.nodes.delete) {
        this.nodes.delete.item = this.props.item;
        this.nodes.delete.enabled = this.getDeleteEnabled ? this.getDeleteEnabled(this.props.item) : true;
      }

      // Generate the renderer for this Message's MessageParts.
      this.applyContentTag();

      // Render all mutable data
      this.rerender();
    },

    /**
     * Render dynamic properties of the Message (message status)
     *
     * @method
     * @private
     */
    rerender: function() {
      this.toggleClass('layer-unread-message', !this.props.item.isRead);
      this.toggleClass('layer-message-status-read-by-all', this.props.item.readStatus === layer.Constants.RECIPIENT_STATE.ALL);
      this.toggleClass('layer-message-status-read-by-some', this.props.item.readStatus === layer.Constants.RECIPIENT_STATE.SOME);
      this.toggleClass('layer-message-status-read-by-none', this.props.item.readStatus === layer.Constants.RECIPIENT_STATE.NONE);

      this.toggleClass('layer-message-status-delivered-to-all', this.props.item.deliveryStatus === layer.Constants.RECIPIENT_STATE.ALL);
      this.toggleClass('layer-message-status-delivered-to-some', this.props.item.deliveryStatus === layer.Constants.RECIPIENT_STATE.SOME);
      this.toggleClass('layer-message-status-delivered-to-none', this.props.item.deliveryStatus === layer.Constants.RECIPIENT_STATE.NONE);

      this.toggleClass('layer-message-status-pending', this.props.item.isSaving());
    },

    /**
     * The MessageList passes a tagName to use for the content of the Message.
     *
     * Use that tagName to create a DOM Node to render the MessageParts.
     */
    applyContentTag: function() {
      var messageHandler = document.createElement(this.contentTag);
      messageHandler.listHeight = this.listHeight;
      messageHandler.listWidth = this.listWidth;
      messageHandler.message = this.item;

      this.nodes.content.appendChild(messageHandler);
      if (messageHandler.style.height) {
        this.nodes.content.style.height = messageHandler.style.height;
      }
    }
  }
})
