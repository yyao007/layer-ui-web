/**
 * The Layer User List renders a pagable list of layer.Identity objects, and allows the user to select people to talk with.
 *
 * This is typically used for creating/updating Conversation participant lists.
 *
 * This Component can be added to your project directly in the HTML file:
 *
 * ```
 * <layer-user-list></layer-user-list>
 * ```
 *
 * Or via DOM Manipulation:
 *
 * ```javascript
 * var userlist = document.createElement('layer-user-list');
 * ```
 *
 * And then its properties can be set as:
 *
 * ```javascript
 * var userList = document.querySelector('layer-user-list');
 * userList.selectedUsers = [identity3, identity6];
 * userList.onUserSelected = userList.onUserDeselected = function(evt) {
 *    log("The new selected users are: ", userList.selectedUseres);
 * }
 * ```
 *
 * ## Events
 *
 * Events listed here come from either this component, or its subcomponents.
 *
 * * {@link layerUI.components.UserList#layer-user-deselected layer-user-deselected}: User has clicked to unselect a User
 * * {@link layerUI.components.UserList#layer-user-selected layer-user-selected}: User has clicked to select a User
 *
 * @class layerUI.components.UserList
 * @extends layerUI.components.Component
 * @mixin layerUI.mixins.List
 * @mixin layerUI.mixins.MainComponent
 */
var layer = require('../../../base').layer;
var LUIComponent = require('../../../components/component');
LUIComponent('layer-user-list', {
  mixins: [require('../../../mixins/list'), require('../../../mixins/main-component')],


  /**
     * The user has clicked to select a user in the user list.
     *
     * ```javascript
     *    userList.onUserSelected = function(evt) {
     *      var userAdded = evt.detail.user;
     *      var selectedUsers = evt.target.selectedUsers;
     *
     *      // To prevent the UI from proceding to add the user to the selectedUsers:
     *      // Note that userAdded is not yet in selectedUsers so that you may prevent it from being added.
     *      evt.preventDefault();
     *    };
     * ```
     *
     *  OR
     *
     * ```javascript
     *    document.body.addEventListener('layer-user-selected', function(evt) {
     *      var userAdded = evt.detail.user;
     *      var selectedUsers = evt.target.selectedUsers;
     *
     *      // To prevent the UI from proceding to add the user to the selectedUsers:
     *      // Note that userAdded is not yet in selectedUsers so that you may prevent it from being added.
     *      evt.preventDefault();
     *    });
     * ```
     *
     * @event layer-user-selected
     * @param {Event} evt
     * @param {Object} evt.detail
     * @param {layer.Identity} evt.detail.user
     */
    /**
     * A user selection change has occurred
     *
     * See the {@link layerUI.components.UserList#layer-user-selected layer-user-selected} event for more detail.
     *
     * @property {Function} onUserSelected
     * @param {Event} evt
     * @param {Object} evt.detail
     * @param {layer.Identity} evt.detail.user
     */

    /**
     * The user has clicked to deselect a user in the user list.
     *
     *    userList.onUserDeselected = function(evt) {
     *      var userRemoved = evt.detail.user;
     *      var selectedUsers = evt.target.selectedUsers;
     *
     *      // To prevent the UI from proceding to add the user to the selectedUsers:
     *      // Note that userRemoved is still in selectedUsers so that you may prevent it from being removed.
     *      evt.preventDefault();
     *    };
     *
     *  OR
     *
     *    document.body.addEventListener('layer-user-deselected', function(evt) {
     *      var userRemoved = evt.detail.user;
     *      var selectedUsers = evt.target.selectedUsers;
     *
     *      // To prevent the UI from proceding to add the user to the selectedUsers:
     *      // Note that userRemoved is still in selectedUsers so that you may prevent it from being removed.
     *      evt.preventDefault();
     *    });
     *
     * @event layer-user-deselected
     * @param {Event} evt
     * @param {Object} evt.detail
     * @param {layer.Identity} evt.detail.user
     */
    /**
     * A user selection change has occurred
     *
     * See the {@link layerUI.components.UserList#layer-user-deselected layer-user-deselected} event for more detail.
     *
     * @property {Function} onUserDeselected
     * @param {Event} evt
     * @param {Object} evt.detail
     * @param {layer.Identity} evt.detail.user
     */

  events: ['layer-user-selected', 'layer-user-deselected'],
  properties: {

    /**
     * Array of layer.Identity objects representing the users who should be rendered as Selected.
     *
     * This property can be used both get and set the selected users; however, if setting you should not be manipulating
     * the existing array, but rather setting a new array:
     *
     * Do NOT do this:
     *
     * ```javascript
     * list.selectedUsers.push(identity1); // DO NOT DO THIS
     * ```
     *
     * Instead, Please do this:
     *
     * ```javascript
     * var newList = list.selectedUsers.concat([]);
     * newList.push(identity1);
     * list.selectedUsers = newList;
     * ```
     *
     * @property {layer.Identity[]}
     */
    selectedUsers: {
      set: function(value) {
        if (!value) value = [];
        if (!Array.isArray(value)) return;
        if (!value) value = [];
        this.props.selectedUsers = value.map(function(user) {
          if (!(user instanceof layer.Identity)) return this.props.client.getIdentity(user.id);
          return user;
        }, this);
        this.renderSelection();
      }
    },

    /**
     * String, Regular Expression or Function for filtering Conversations.
     *
     * Defaults to filtering by `conversation.metadata.conversationName`, as well as `displayName`, `firstName`, `lastName` and `emailAddress`
     * of every participant.  Provide your own Function to change this behavior
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
      value: layer.Query.Identity
    }
  },
  methods: {

    /**
     * Generate a DOM ID for each user ID
     *
     * @method
     * @private
     * @param {String} id
     */
    getItemId: function(user) {
      return 'user-list-item-' + this.id + '-' + user.id.replace(/layer:\/\/\/identities\//, '');
    },

    /**
     * Constructor.
     *
     * @method created
     * @private
     */
    created: function() {
      if (!this.id) this.id = layer.Util.generateUUID();
      this.props.selectedUsers = [];

      this.render();
      this.addEventListener('layer-user-item-selected', this.handleUserSelect.bind(this));
      this.addEventListener('layer-user-item-deselected', this.handleUserDeselect.bind(this));
    },

    /**
     * Handle a user Selection event triggered by a layerUI.UserItem.
     *
     * Adds the user to the selectedUsers array.
     *
     * @method
     * @private
     * @param {Event} evt
     */
    handleUserSelect: function(evt) {
      evt.stopPropagation();
      var user = evt.detail.user;

      var index = this.selectedUsers.indexOf(user)

      // If the item is not in our selectedUsers array, add it
      if (index === -1) {
        // If app calls prevent default, then don't add the user to our selectedUsers list, just call preventDefault on the original event.
        if (this.trigger('layer-user-selected', { user: user })) {
          this.selectedUsers.push(user);
        } else {
          evt.preventDefault();
        }
      }
    },

    /**
     * Handle a user Deselection event triggered by a layerUI.UserItem
     *
     * Removes the user from the selectedUsers array.
     *
     * @method
     * @private
     * @param {Event} evt
     */
    handleUserDeselect: function(evt) {
      evt.stopPropagation();
      var user = evt.detail.user;
      var index = this.selectedUsers.indexOf(user)

      // If the item is in our selectedUsers array, remove it
      if (index !== -1) {
        // If app calls prevent default, then don't remove the user, just call preventDefault on the original event.
        if (this.trigger('layer-user-deselected', { user: user })) {
          this.selectedUsers.splice(index, 1);
        } else {
          evt.preventDefault();
        }
      }
    },

    /**
     * Append a layerUI.UserItem to the Document Fragment
     *
     * @method
     * @private
     */
    generateItem: function(user) {
      var userWidget = document.createElement('layer-user-item');
      userWidget.item = user;
      userWidget.id = this.getItemId(user);
      userWidget.selected = this.selectedUsers.indexOf(user) !== -1;
      userWidget.runFilter(this.filter);
      return userWidget;
    },

    /**
     * Call this on any Query change events.
     *
     * @method
     * @private
     * @param {Event} evt
     */
    rerender: function(evt) {
      this._rerender(evt);
      switch(evt.type) {
        // If its a remove event, find the user and remove its widget.
        case 'remove':
          var removalIndex = this.selectedUsers.indexOf(evt.target);
          if (removalIndex !== -1) this.selectedUsers.splice(removalIndex, 1);
          break;

        // If its a reset event, all data is gone, rerender everything.
        case 'reset':
          this.selectedUsers = [];
          break;
      }
    },

    /**
     * Update the selected property of all User Items based on the selectedUsers property.
     *
     * @method
     * @private
     */
    renderSelection: function() {
      var selectedNodes = this.querySelectorAllArray('.layer-user-item-selected').map(function(node) {
        return node.parentNode;
      });;
      var nodesToSelect = this.selectedUsers.length ? this.querySelectorAllArray(this.selectedUsers.map(function(user) {
        return '#' + this.getItemId(user);
      }, this).join(', ')) : [];
      selectedNodes.forEach(function(node) {
        if (nodesToSelect.indexOf(node) === -1) node.selected = false;
      });
      nodesToSelect.forEach(function(node) {
        if (selectedNodes.indexOf(node) === -1) node.selected = true;
      });
    },

    /**
     * Run the filter on all User Items.
     *
     * @method
     * @private
     */
    runFilter: function() {
      if (!this.filter) {
        this.querySelectorAllArray('.layer-item-filtered').forEach(function(item) {
          item.removeClass('layer-item-filtered');
        }, this);
      } else {
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

