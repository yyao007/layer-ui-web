/**
 * A List Item Mixin that provides common properties, shortcuts and code.
 *
 * This Mixin requires a template that provides a `layer-list-item` class
 *
 * @class layerUI.mixins.ListItem
 */
module.exports = {
  properties: {
    /**
     * A custom DOM node added by your application; this is not the prior List Item.
     *
     * You can set this to a DOM Node or html string
     *
     * @property {HTMLElement | String}
     */
    customNodeAbove: {
      set: function(node) {
        if (this.props._customNodeAbove) this.removeChild(this.props._customNodeAbove);
        if (node && typeof node === 'string') {
          var realNode = document.createElement('div');
          realNode.innerHTML = node;
          node = realNode;
          this.props.customNodeAbove = node;
        }
        if (node) {
          this.insertBefore(node, this.querySelector('.layer-list-item'));
        } else {
          this.props.customNodeAbove = null;
        }
        this.props._customNodeAbove = node;
      }
    },

    /**
     * A custom DOM node added by your application; this is not the prior List Item.
     *
     * You can set this to a DOM Node or html string
     *
     * @property {HTMLElement | String}
     */
    customNodeBelow: {
      set: function(node) {
        if (this.props._customNodeBelow) this.removeChild(this.props._customNodeBelow);
        if (node && typeof node === 'string') {
          var realNode = document.createElement('div');
          realNode.innerHTML = node;
          node = realNode;
          this.props.customNodeBelow = node;
        }
        if (node) {
          this.appendChild(node);
        } else {
          this.props.customNodeBelow = null;
        }
        this.props._customNodeBelow = node;
      }
    },

    /**
     * Shortcut to the `.layer-list-item` node
     *
     * @property {HTMLElement}
     * @private
     */
    innerNode: {},

    /**
     * Sets whether this widget is the first in a series of layerUI.MessageItem set.
     *
     * @property {Boolean}
     */
    firstInSeries: {
      type: Boolean,
      value: false,
      set: function(value) {
        this.toggleClass('layer-list-item-first', value);
      }
    },

    /**
     * Sets whether this widget is the last in a series of layerUI.MessageItem set.
     *
     * @property {Boolean}
     */
    lastInSeries: {
      type: Boolean,
      value: false,
      set: function(value) {
        this.toggleClass('layer-list-item-last', value);
      }
    },

    /**
     * Height of the list; needed for some of the renderers to determine layout.
     *
     * @property {Number}
     */
    listHeight: {},

    /**
     * Width of the list; needed for some of the renderers to determine layout.
     *
     * @property {Number}
     */
    listWidth: {},

    /**
     * The item of data in a list of data that this List Item will render.
     *
     * @property {layer.Root}
     */
    item: {}
  },
  methods: {
    created: function() {
      this.innerNode = this.querySelector('.layer-list-item');
    },
    addClass: function(className) {
      this.classList.add(className);
    },
    removeClass: function(className) {
      this.classList.remove(className);
    },
    toggleClass: function(className, arg2) {
      this.classList[arg2 ? 'add' : 'remove'](className);
    }
  }
};