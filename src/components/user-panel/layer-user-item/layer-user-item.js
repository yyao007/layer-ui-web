/**
 * The Layer User Item represents a single user within a User List.
 *
 * This widget could be used to represent a User elsewhere, in places where a `<layer-avatar />` is insufficient.
 *
 * This widget includes a checkbox for selection.
 *
 * @class layerUI.components.UserList.UserItem
 * @extends layerUI.components.Component
 */
var layer = require('../../../base').layer;
var LUIComponent = require('../../../components/component');
LUIComponent('layer-user-item', {
  mixins: [require('../../../mixins/list-item')],
  properties: {
    item: {
      set: function(value) {
        this.render();
        value.on('identities:change', this.render, this);
      }
    },

    /**
     * Is this user item selected using the checkbox?
     *
     * @property {Boolean}
     */
    selected: {
      type: Boolean,
      set: function(value) {
        if (this.nodes.checkbox) this.nodes.checkbox.checked = value;
        this.innerNode.classList[value ? 'add' : 'remove']('layer-user-item-selected');
      },
      get: function() {
        return this.nodes.checkbox ? this.nodes.checkbox.checked : Boolean(this.props.selected);
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
      if (!this.id) this.id = layer.Util.generateUUID();
      this.nodes.checkbox.addEventListener('change', this.onChange.bind(this));
      this.nodes.checkbox.id = this.id + '-checkbox';
      this.nodes.title.setAttribute('for', this.nodes.checkbox.id);
    },

    /**
     * If the checkbox state changes, make sure that the class is updated.
     *
     * If the custom event is canceled, roll back the change.
     *
     * @method
     * @private
     */
    onChange: function(evt) {
      evt.stopPropagation();
      var checked = this.selected;

      var customEventResult = this.trigger('layer-user-item-' + (checked ? 'selected' : 'deselected'), {user: this.item});

      if (customEventResult) {
        this.innerNode.classList[checked ? 'add' : 'remove']('layer-user-item-selected');
      } else {
        this.selected = !checked;
      }
    },

    /**
     * Render/rerender the user, showing the avatar and user's name.
     *
     * @method
     * @private
     */
    render: function() {
      this.nodes.avatar.users = [this.item];
      this.nodes.title.innerHTML = this.item.displayName;
      this.toggleClass('layer-user-item-empty', !this.item.displayName);
    },

    /**
     * Run a filter on this item, and hide it if it doesn't match the filter.
     *
     * @method
     * @param {String|Regex|Function} filter
     */
    runFilter: function(filter) {
      var user = this.props.item;
      var match;
      if (!filter) {
        match = true;
      } else if (filter instanceof RegExp) {
        match = filter.test(user.displayName) || filter.test(user.firstName) || filter.test(user.lastName) || filter.test(user.emailAddress);
      } else if (typeof filter === 'function') {
        match = filter(user);
      } else {
        filter = filter.toLowerCase();
        match =
          user.displayName.toLowerCase().indexOf(filter) !== -1 ||
          user.firstName.toLowerCase().indexOf(filter) !== -1 ||
          user.lastName.toLowerCase().indexOf(filter) !== -1 ||
          user.emailAddress.toLowerCase().indexOf(filter) !== -1;
      }
      this.classList[match ? 'remove' : 'add']('layer-item-filtered');
    }
  }
})

