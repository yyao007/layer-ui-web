/**
 * The Layer Composer widget provides the text area for the layerUI.Conversation widget.
 *
 * It provides a self-resizing text area that resizes to the size of the entered text, and sends typing indicators as the user types.
 *
 * Note that this widget is not designed to be used outside of the LayerUI.Conversation widget; to simplify such use cases, we'd want to accept
 * `appId` and `conversationId` instead of `client` and `conversation`.
 *
 * TODO: Support file attachments
 * TODO: Refactor out a resizable-text-area Component
 *
 * @class layerUI.components.subcomponents.Composer
 * @extends layerUI.components.Component
 */
var layer = require('../../../base').layer;
var LUIComponent = require('../../../components/component');
var ENTER = 13;
var TAB = 9;
LUIComponent('layer-composer', {
  properties: {

    /**
     * What Conversation are we sending messages and typing indicators to?
     *
     * @property {layer.Conversation}
     */
    conversation: {
      set: function(value){
        this.client = value.getClient();
        this.updateTypingIndicator();
      }
    },

    /**
     * The Client are we using to communicate.
     *
     * @property {layer.Client}
     */
    client: {
      set: function(value) {
        // debug; REMOVE THIS before GA
        if (!this.nodes.input) alert("NO INPUT FOR COMPOSER");
        this.props.typingListener = this.props.client.createTypingListener(this.nodes.input);
        this.updateTypingIndicator();
      }
    },

    /**
     * Custom buttons to put in the panel.
     *
     * @property {HTMLElement[]}
     */
    buttons: {
      set: function(value) {
        this.nodes.buttonPanel.buttons = value;
      }
    },

    /**
     * The text shown in the editor; editor value.
     *
     * @property {String}
     */
    value: {
      set: function(value) {
        this.nodes.input.value = value;
        this.resizeNode();
      },
      get: function() {
        return this.nodes.input.value;
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
      this.classList.add('layer-composer-one-line-of-text');

      // Setting this in the template causes errors in IE 11.
      this.nodes.input.placeholder = "Enter a message";
      this.nodes.input.addEventListener('keydown', this.onKeyDown.bind(this));

      // Event handlers
      this.addEventListener('layer-file-selected', this.handleAttachments.bind(this));
    },

    /**
     * Focus on the textarea.
     *
     * @method
     */
    focus: function() {
      this.nodes.input.focus();
    },

    /**
     * Update the Conversation that our Typing Listener is using to send typing indicator events.
     *
     * @method
     * @private
     */
    updateTypingIndicator: function() {
      this.props.typingListener.setConversation(this.conversation);
    },

    /**
     * Send the Message that the user has typed in.
     *
     * @method
     * @param {layer.MessagePart[]} optionalParts
     */
    send: function(optionalParts) {
      var parts = [];
      if (optionalParts) {
        parts = optionalParts;
      } else if (this.nodes.input.value) {
        parts.push(new layer.MessagePart({
          type: 'text/plain',
          body: this.nodes.input.value
        }));
        this.nodes.input.value = '';
      }

      if (parts.length === 0) return;

      var message = this.conversation.createMessage({ parts: parts });

      /**
       * This event is triggered before any Message is sent; used to control notifications and override sending.
       *
       * You can use this event to control the notifications by modifying the `evt.detail.notification` object.
       * Note that you should modify the object but not try to replace the object.
       *
       * ```javascript
       * document.body.addEventListener('layer-send-message', function(evt) {
       *   var message = evt.detail.message;
       *   var notification = evt.detail.notification;
       *   notification.title = 'You have a new Message from ' + message.sender.displayName;
       *   notification.sound = 'sneeze.aiff';
       *   if (message.parts[0].mimeType === 'text/plain') {
       *     notification.text = evt.detail.message.parts[0].body;
       *   } else {
       *     notification.text = 'You have received a file';
       *   }
       * }
       * ```
       *
       * You can also use this event to provide your own logic for sending the Message.
       *
       * ```javascript
       * document.body.addEventListener('layer-send-message', function(evt) {
       *   evt.preventDefault();
       *   myAsyncLookup(function(result) {
       *     var part = new layer.MessagePart({
       *       mimeType: 'application/json',
       *       body: result
       *     });
       *     message.addPart(part);
       *     message.send();
       *   });
       * });
       * ```
       *
       * @event layer-send-message
       * @param {Event} evt
       * @param {Object} evt.detail
       * @param {layer.Message} evt.detail.message
       * @param {Object} evt.detail.notification
       * @param {String} evt.detail.notification.text
       * @param {String} evt.detail.notification.title
       * @param {String} evt.detail.notification.sound
       */
      var textPart = message.parts.filter(function(part) {return part.mimeType === 'text/plain'});
      var notification = {
        text: textPart ? textPart.body : 'File received',
        title: 'New Message from ' + message.sender.displayName
      };
      if (this.trigger('layer-send-message', {
        message: message,
        notification: notification
      })) {
        message.send(notification);
      }
    },

    /**
     * On ENTER call `send()`; on TAB enter some spacing rather than leaving the text area.
     *
     * @method
     * @private
     */
    onKeyDown: function(event) {
      if (event.keyCode === ENTER) {
        if (!event.shiftKey && !event.ctrlKey && !event.metaKey) {
          event.preventDefault();
          this.send();
        } else {
          event.target.value += '\n';
        }
      } else if (!layerUI.settings.disableTabAsWhiteSpace && event.keyCode === TAB && !event.shiftKey) {
        event.preventDefault();
        event.target.value += '\t  ';
      }
      this.resizeNode();
    },

    /**
     * On any change in value, recalculate our height and lineHeight to fit the contents.
     *
     * @method
     * @private
     */
    resizeNode: function() {
      setTimeout(function() {
        this.nodes.resizer.innerHTML = this.nodes.input.value.replace(/\n/g, '<br/>') || '&nbsp;';
        this.nodes.lineHeighter.innerHTML = this.nodes.input.value.replace(/\n/g, '<br/>') || "&nbsp;";
        var wasOneLine = this.classList.contains('layer-composer-one-line-of-text');
        var willBeOneLine = this.nodes.resizer.clientHeight - this.nodes.lineHeighter.clientHeight < 10;

        // Prevent scrollbar flickering in and then out
        if (willBeOneLine) {
          this.nodes.input.style.overflow = 'hidden';
          setTimeout(function() {
            this.nodes.input.style.overflow = '';
          }.bind(this), 1);
        }
        this.classList[willBeOneLine ? 'add' : 'remove']('layer-composer-one-line-of-text');

      }.bind(this), 10);
    },

    /**
     * If a file event was detected, send some attachments.
     *
     * @method
     * @private
     */
    handleAttachments: function(evt) {
      var parts = evt.detail.parts;
      this.send(parts);
    }
  }
})
