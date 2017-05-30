/**
 * The Layer Avatar widget renders an icon representing a user or users.
 *
 * This widget appears within
 *
 * * layerUI.components.MessagesListPanel.Item: Represents the sender of a Message
 * * layerUI.components.ConversationsListPanel.Item.Conversation: Represents the participants of a Conversation
 * * layerUI.components.IdentitiesListPanel.Item: Represents a user in a User List
 *
 * Rendering is done using data from the `layer.Identity` object for each user, using the layer.Identity.avatarUrl if available to
 * add an image, or first initials from layer.Identity.firstName, layer.Identity.lastName if no avatarUrl is available.
 * layer.Identity.displayName is used as a fallback.
 *
 * The simplest way to customize this widget is to replace it with your own implementation of the `<layer-avatar />` tag.
 *
 * ```javascript
 * layerUI.registerComponent('layer-avatar', {
 *    properties: {
 *      users: {
 *        set: function(value) {
 *           this.render();
 *        }
 *      }
 *    },
 *    methods: {
 *      render: function() {
 *        this.innerHTML = 'All Hail ' + this.properties.users[0].displayName;
 *      }
 *    }
 * });
 *
 * // Call init after custom components are defined
 * layerUI.init({
 *   appId:  'layer:///apps/staging/UUID'
 * });
 * ```
 *
 * Note that the main parameter is a `users` array, not a single user:
 *
 * * When used in a Messages List or Identities List, there will be only one user in the list
 * * When used in a Conversations List, there may be multiple users who are participants of the Conversation.
 *
 * @class layerUI.components.subcomponents.Avatar
 * @extends layerUI.components.Component
 */
import { registerComponent } from '../../../components/component';
import '../layer-presence/layer-presence';
import SizeProperty from '../../../mixins/size-property';

registerComponent('layer-avatar', {
  mixins: [SizeProperty],
  properties: {

    /**
     * Array of users to be represented by this Avatar.
     *
     * Typically this only has one user represented with a layer.Identity.
     *
     * @property {layer.Identity[]} [users=[]}
     */
    users: {
      set(newValue, oldValue) {
        if (oldValue && newValue && newValue.length === oldValue.length) {
          const matches = newValue.filter(identity => oldValue.indexOf(identity) !== -1);
          if (matches !== newValue.length) return;
        }
        if (!newValue) newValue = [];
        if (!Array.isArray(newValue)) newValue = [newValue];
        // classList.toggle doesn't work right in IE 11
        this.classList[newValue.length ? 'add' : 'remove']('layer-has-user');
        this.onRender();
      },
    },

    showPresence: {
      value: true,
      type: Boolean,
    },

    size: {
      value: 'medium',
      set(value) {
        if (this.nodes.presence) this.nodes.presence.size = value === 'larger' ? 'large' : value;
      },
    },
    supportedSizes: {
      value: ['small', 'medium', 'large', 'larger'],
    },
  },
  methods: {
    /**
     * Constructor.
     *
     * @method onCreate
     * @private
     */
    onCreate() {
      this.properties.users = [];
    },

    /**
     * Render the users represented by this widget.
     *
     * @method
     * @private
     */
    onRender() {
      // Clear the innerHTML if we have rendered something before
      if (this.users.length) {
        this.innerHTML = '';
      }

      // Render each user
      this.users.forEach(this._renderUser.bind(this));

      // Add the "cluster" css if rendering multiple users
      // No classList.toggle due to poor IE11 support
      this.classList[this.users.length > 1 ? 'add' : 'remove']('layer-avatar-cluster');
      if (this.users.length === 1 && this.showPresence && this.users[0].getClient().isPresenceEnabled) {
        this.nodes.presence = document.createElement('layer-presence');
        this.nodes.presence.item = this.users[0];
        this.nodes.presence.size = this.size === 'larger' ? 'large' : this.size;
        this.appendChild(this.nodes.presence);
      }
    },

    /**
     * Render each individual user.
     *
     * @method
     * @private
     */
    _renderUser(user, users) {
      const span = document.createElement('span');
      if (user.avatarUrl && !this.properties.failedToLoadImage) {
        span.classList.remove('layer-text-avatar');
        const img = document.createElement('img');
        span.appendChild(img);
        img.onerror = () => {
          img.parentNode.removeChild(img);
          span.innerHTML = this._getUserText(user);
          span.classList.add('layer-text-avatar');
        };
        img.src = user.avatarUrl;
      } else {
        span.classList.add('layer-text-avatar');
        span.innerHTML = this._getUserText(user);
      }
      this.appendChild(span);
    },
    _getUserText(user) {
      // Use first and last name if provided
      if (user.firstName && user.lastName) {
        return user.firstName.substring(0, 1).toUpperCase() + user.lastName.substring(0, 1).toUpperCase();
      }

      // Use displayName to try and find a first and last name
      else if (user.displayName.indexOf(' ') !== -1) {
        return user.displayName.substr(0, 1).toUpperCase() +
          user.displayName.substr(user.displayName.lastIndexOf(' ') + 1, 1).toUpperCase();
      }

      // If all else fails, use the first two letters
      else {
        return user.displayName.substring(0, 2).toUpperCase();
      }
    }
  },
});

