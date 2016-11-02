/**
 * The Layer Conversation List widget renders a scrollable, pagable list of Conversations.
 *
 * This Component can be added to your project directly in the HTML file:
 *
 * ```
 * <layer-conversation-list></layer-conversation-list>
 * ```
 *
 * Or via DOM Manipulation:
 *
 * ```javascript
 * var conversation = document.createElement('layer-conversation-list');
 * ```
 *
 * And then its properties can be set as:
 *
 * ```javascript
 * var list = document.querySelector('layer-conversations-list');
 * list.onConversationSelected = function(evt) {
 *    alert(evt.detail.conversation.id + ' has been selected');
 * }
 * ```
 *
 * ## Common Properties
 *
 * The most common property of this widget is layerUI.components.ConversationList.onConversationSelected, as typical use
 * of this widget is to prompt the user to select a Conversation, and use that selection elsewhere.
 *
 * Note that you can also listen for `layer-conversation-selected` to achieve the same result:
 *
 * ```
 * document.body.addEventListener('layer-conversation-selected', function(evt) {
 *    alert(evt.detail.conversation.id + ' has been selected');
 * });
 * ```
 *
 * You may also sometimes want to set which Conversation to mark as selected:
 *
 * ```javascript
 * conversationList.selectedConversationId = myConversation.id;
 * ```
 *
 * @class layerUI.components.ConversationList
 * @extends layerUI.components.Component
 * @mixin layerUI.mixins.List
 * @mixin layerUI.mixins.MainComponent
 */
var layer = require('../../../base').layer;
var LUIComponent = require('../../../components/component');
LUIComponent('layer-conversation-list', {
  mixins: [require('../../../mixins/list'), require('../../../mixins/main-component')],


  /**
   * Configure a custom action when a Conversation is selected;
   *
   * Use `evt.preventDefault()` to prevent default handling from occuring.
   *
   * ```javascript
   *    document.body.addEventListener('layer-conversation-selected', function(evt) {
   *      var conversation = evt.detail.conversation;
   *
   *      // To prevent the UI from proceding to select this conversation:
   *      evt.preventDefault();
   *    });
   * ```
   *
   * OR
   *
   * ```javascript
   *    converationList.onConversationSelected = function(evt) {
   *      var conversation = evt.detail.conversation;
   *
   *      // To prevent the UI from proceding to select this conversation:
   *      evt.preventDefault();
   *    });
   * ```
   *
   * @property {Function} onConversationSelected
   * @param {Event} evt
   * @param {Object} evt.detail
   * @param {layer.Conversation} evt.detail.conversation   The selected Conversation
   * @param {Event} evt.detail.originalEvent               The click event that selected the Conversation
   */

  /**
   * See layerUI.components.ConversationList.onConversationSelected.
   *
   * @event layer-conversation-selected
   * @param {Event} evt
   * @param {Object} evt.detail
   * @param {layer.Conversation} evt.detail.conversation   The selected Conversation
   * @param {Event} evt.detail.originalEvent               The click event that selected the Conversation
   */

  /**
   * The user has clicked to delete a conversation.
   *
   * ```javascript
   *    conversationListNode.onConversationDeleted = function(evt) {
   *      var conversation = evt.detail.conversation;
   *
   *      // To prevent the UI from proceding to delete this conversation (perhaps you want
   *      // to leave the Conversation instead of delete it):
   *      evt.preventDefault();
   *      conversation.leave();
   *    };
   * ```
   *
   *  OR
   *
   * ```javascript
   *    document.body.addEventListener('layer-conversation-deleted', function(evt) {
   *      var conversation = evt.detail.conversation;
   *
   *      // To prevent the UI from proceding to delete this conversation (perhaps you want
   *      // to leave the Conversation instead of delete it):
   *      evt.preventDefault();
   *      conversation.leave();
   *    });
   * ```
   *
   * @property {Function} onConversationDeleted
   * @param {Event} evt
   * @param {Object} evt.detail
   * @param {layer.Conversation} evt.detail.conversation
   */

  /**
   * See layerUI.components.ConversationList.onConversationDeleted.
   *
   * @event layer-conversation-deleted
   * @param {Event} evt
   * @param {Object} evt.detail
   * @param {layer.Conversation} evt.detail.conversation
   */

  events: ['layer-conversation-selected', 'layer-conversation-deleted'],
  properties: {

    /**
     * Get/Set the selected Conversation by ID.
     *
     * ```javascript
     * conversationList.selectedConversationId = myConversation.id;
     * ```
     *
     * Or if using a templating engine:
     *
     * ```html
     * <layer-conversation-list selected-conversation-id={{selectedConversation.id}}></layer-conversation-list>
     * ```
     *
     * The above code will set the selected Conversation and render the conversation as selected.
     *
     * @property {String}
     */
    selectedConversationId: {
      set: function(value) {
        this.renderSelection();
      }
    },

    /**
     * Function allows for control over which Conversations can be deleted and which can not.
     *
     * Return true means enabled, false is disabled.
     *
     *  ```javascript
     * conversationPanel.deleteConversationEnabled = function(conversation) {
     *     return conversation.metadata.category !== 'adminStuff';
     * });
     * ```
     *
     * If delete is enabled, the layerUI.components.misc.Delete.enabled property is changed, causing
     * the `layer-delete-enabled` css class to be added/removed on that widget.
     *
     * @property {Function} deleteConversationEnabled
     * @property {layer.Conversation} deleteConversationEnabled.conversation
     * @property {Boolean} deleteConversationEnabled.return
     */
    deleteConversationEnabled: {
      type: Function
    },

    /**
     * Set a filter to control which Conversations should be listed.
     *
     * NOTE: This filters the data that the query has retreived, it does not change the query,
     * so you may filter out all results, even though there are matching results waiting on the server.
     * Take control of the layerUI.components.ConversationList.query property if you need complete results.
     *
     * Accepted values for the filter property include:
     *
     * * A function that looks at each Conversation and returns a Boolean
     * * A Regular Expression that will be tested against each
     * layer.Conversation's `metadata.conversationName` property, and each particpants
     * `displayName`, `firstName`, `lastName` and `emailAddress` properties.
     * * A string to compare against the same list of properties as the RegEx.
     *
     * @property {String|RegEx|Function}
     */
    filter: {
      set: function(value) {
        this.runFilter();
      }
    },

    /**
     * The model to generate a Query for if a Query is not provided.
     *
     * @readonly
     * @private
     * @property {String}
     */
    queryModel: {
      value: layer.Query.Conversation
    },

    /**
     * Provide a function to determine if the last message is rendered in the Conversation List.
     *
     * By default, only text/plain last-messages are rendered in the Conversation List.
     *
     * ```javascript
     * list.canRenderLastMessage = function(message) {
     *     return message.parts[0].mimeType === 'text/mountain' ||
     *            message.parts[0].mimeType === 'text/plain';
     * }
     * ```
     *
     * If you enable rendering of images for example, you would be enabling the handler that renders image messages
     * in the Message List to render that same image in the Conversation List.
     *
     * If you prevent rendering of a Message, it will instead render the `label` attribute for that message handler;
     * see layerUI.registerMessageHandler for more info on the `label`.
     *
     * @property {Function}
     */
    canRenderLastMessage: {
      type: Function,
      value: function(message) {
        return (message.parts.length === 1 && message.parts[0].mimeType === 'text/plain');
      }
    }
  },
  methods: {
    /**
     * Generate a unique but consistent DOM ID for each layerUI.ConversationItem.
     *
     * @method
     * @private
     */
    getItemId: function(conversation) {
      return 'conversation-list-item-' + this.id + '-' + conversation.id.replace(/layer:\/\/\/conversations\//, '');
    },

    /**
     * Constructor.
     *
     * @method created
     * @private
     */
    created: function() {
      if (!this.id) this.id = layer.Util.generateUUID();
      this.render();
      this.addEventListener('click', this.onClick.bind(this));
    },

    /**
     * User has selected something in the Conversation List that didn't handle that click event.
     *
     * Find the Conversation Item selected and generate a `layer-conversation-selected` event.
     * Click events do NOT bubble up; they must either be handled by the layerUI.ConversationItem or
     * they are treated as a selection event.
     *
     * Listening to `layer-conversation-selected` you will still receive the original click event
     * in case you wish to process that futher; see `originalEvent` below.
     *
     * Calling `evt.preventDefault()` will prevent selection from occuring.
     *
     * @method onClick
     * @private
     * @param {Event} evt
     */
    onClick: function(evt) {
      var target = evt.target;
      while(target && target !== this && !target.item) {
        target = target.parentNode;
      }

      if (target.item) {
        evt.preventDefault();
        evt.stopPropagation();
        if (this.trigger('layer-conversation-selected', {conversation: target.item, originalEvent: evt} )) {
          this.selectedConversationId = target.item.id;
        }
      }
    },

    /**
     * Generate a `layer-conversation-item` widget.
     *
     * @method
     * @private
     * @param {layer.Conversation} conversation
     */
    generateItem: function(conversation) {
      var conversationWidget = document.createElement('layer-conversation-item');
      conversationWidget.id = this.getItemId(conversation);
      conversationWidget.deleteConversationEnabled = typeof this.deleteConversationEnabled === 'function' ?
        this.deleteConversationEnabled(conversation) : true;
      conversationWidget.canRenderLastMessage = this.canRenderLastMessage;
      conversationWidget.item = conversation;
      if (this.filter) conversationWidget.runFilter(this.filter);
      return conversationWidget;
    },

    /**
     * Handle Query data changes.
     *
     * Updates rendering of the list, and then updates rendering of the list selection.
     *
     * @method
     * @private
     */
    rerender: function(evt) {
      this._rerender(evt);
      this.renderSelection();
    },

    /**
     * Render the currently selected Conversation; remove any selection rendering from formerly selected Conversations.
     *
     * @method
     * @private
     */
    renderSelection: function() {
      var selectedNodes = this.querySelectorAllArray('.layer-conversation-item-selected');
      var nodeToSelect = this.selectedConversationId ? this.querySelector('#' + this.getItemId({id: this.selectedConversationId})) : null;

      // Deselect everything if the selected nodes are not the node to select...
      // assumes only one item would ever be selected at a time.
      if (selectedNodes.length !== 1 || selectedNodes[0] !== nodeToSelect) {
        if (selectedNodes) selectedNodes.forEach(function(node) {
          node.removeClass('layer-conversation-item-selected');
        });

        // Select the new item
        if (nodeToSelect) nodeToSelect.addClass('layer-conversation-item-selected');
      }
    },

    /**
     * Run the filter on all Conversation Items.
     *
     * @method
     * @private
     */
    runFilter: function() {
      // If the filter has been reset, remove all filtering
      if (!this.filter) {
        this.querySelectorAllArray('.layer-item-filtered').forEach(function(item) {
          item.removeClass('layer-item-filtered');
        }, this);
      }

      // Run all filtering
      else {
        for (var i = 0; i < this.childNodes.length; i++) {
          var listItem = this.childNodes[i];
          if (listItem.item instanceof layer.Root) {
            listItem.runFilter(this.filter);
          }
        }
      }
    }
  }
});
