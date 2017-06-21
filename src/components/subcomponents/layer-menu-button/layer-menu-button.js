/**
 * The Layer Menu Button renders a menu button and has associated menu items.
 *
 * This is provided as a specialized component so that it can be easily redefined by your app to
 * provide your own menu capability.
 *
 * Note that the `item` property can refer to any type of data Layer data including layer.Message and layer.Conversation.
 *
 * ```
 * var menuButton = document.createElement('layer-menu-button');
 * menuButton.item = message;
 * menuButton.options = [
 *   {text: "delete", method: function(item) {item.delete(Layer.Constants.DELETION_MODE.ALL);}
 * ];
 * ```
 *
 * @class layerUI.components.subcomponents.MenuButton
 * @extends layerUI.components.Component
 */
import Layer from 'layer-websdk';
import { registerComponent } from '../../../components/component';
import '../layer-menu/layer-menu';
import MainComponent from '../../../mixins/main-component';

registerComponent('layer-menu-button', {
  mixins: [MainComponent],
  properties: {
    getMenuOptions: {
      type: Function,
    },

    // Automatically set if within a List
    item: {},

    /**
     * Different buttons may need menus of differing widths; set it here and its applied by the button, not style sheet.
     *
     * @proeprty {Number} [menuWidth=100]
     */
    menuWidth: {
      value: 100,
      type: Number,
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
      this.addEventListener('click', this.onButtonClick, this);
    },

    /**
     * Mixin Hook: Override this method to have your own menuing system kick in.
     *
     * @param {Event} evt
     */
    onButtonClick(evt) {
      evt.preventDefault();
      evt.stopPropagation();
      const options = this.getMenuOptions(this.item);
      if (options) {
        let menuNode = document.querySelector('layer-menu');
        if (!menuNode) {
          menuNode = document.createElement('layer-menu');
          document.body.appendChild(menuNode);
        }
        if (!menuNode.isShowing || menuNode.near !== this) {
          menuNode.options = options;
          menuNode.width = this.menuWidth;
          menuNode.near = this;
          menuNode.isShowing = true;
        }
      }
    },
  },
});
