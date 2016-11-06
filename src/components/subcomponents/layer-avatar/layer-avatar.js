/**
 * The Layer Avatar widget renders an icon representing a user or users.
 *
 * This widget appears within
 *
 * * layerUI.MessageItem: Represents the sender of a Message
 * * layerUI.ConversationItem: Represents the participants of a Conversation
 * * layerUI.UserItem: Represents a user in a User List
 *
 * Rendering is done using the `layer.Identity` object for each user, using the layer.Identity.avatarUrl if available to
 * add an image, or layer.Identity.firstName, layer.Identity.lastName if no avatarUrl is available.
 * layer.Identity.displayName is used as a fallback.
 *
 * The simplest way to customize this widget is to replace it with your own implementation of the `<layer-avatar />` tag.
 *
 * Note that the main parameter is a `users` array, not a single user:
 *
 * * When used in a Message List or User List, there will be only one user in the list
 * * When used in a Conversation List, there may be multiple users who are participants of the Conversation.
 *
 * @class layerUI.components.subcomponents.Avatar
 * @extends layerUI.components.Component
 */
var LUIComponent = require('../../../components/component');
LUIComponent('layer-avatar', {
  properties: {

    /**
     * Array of users to be represented by this Avatar
     *
     * @property {layer.Identity[]}
     */
    users: {
      set: function(value){
        if (!value) value = [];
        if (!Array.isArray(value)) value = [value];
        this.users = value;
        this.classList[value.length ? 'add' : 'remove']('layer-has-user');
        this.render();
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
      this.props.users = [];
    },

    /**
     * Render the users represented by this widget.
     *
     * @method
     * @private
     */
    render: function() {
      // Clear the innerHTML if we have rendered something before
      if (this.childNodes.length) {
        this.innerHTML = '';
      }

      // Render each user
      this.users.forEach(this.renderUser.bind(this));

      // Add the "cluster" css if rendering multiple users
      this.classList[this.users.length > 1 ? 'add' : 'remove']('layer-avatar-cluster');
    },

    /**
     * Render each individual user.
     *
     * @method
     * @private
     */
    renderUser: function(user) {
      if (user.avatarUrl) {
        var img = document.createElement('img');
        img.onerror = function() {img.style.display='none';};
        img.src = user.avatarUrl;
        this.appendChild(img);
      } else {
        var span = document.createElement('span');
        if (user.firstName && user.lastName) {
          span.innerHTML =  user.firstName.substring(0,1).toUpperCase() + user.lastName.substring(0,1).toUpperCase();
        } else if (user.displayName.indexOf(' ') !== -1) {
          span.innerHTML = user.displayName.substr(0, 1) + user.displayName.substr(user.displayName.indexOf(' ') + 1, 1);
        } else {
          span.innerHTML = user.displayName.substring(0,2).toUpperCase();
        }
        this.appendChild(span);
      }
    }
  }
});

