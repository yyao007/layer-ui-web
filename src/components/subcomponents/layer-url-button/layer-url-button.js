/**
 *
 * @class
 * @extends layerUI.components.Component
 */
import { registerComponent } from '../../component';


registerComponent('layer-url-button', {
  template: '<button class="layer-button" layer-id="button"></button>',
  style: 'layer-url-button {display: inline-block;}',
  // Note that there is also a message property managed by the MessageHandler mixin
  properties: {
    text: {
      value: 'Open in Browser',
      set(value) {
        this.nodes.button.innerHTML = value;
      },
    },
    url: {},
  },
  methods: {
    /**
     * @method
     */
    onCreate() {
      this.addEventListener('click', this._onClick.bind(this));
    },

    /**
     *
     * @method
     */
    onRender() {

    },

    _onClick() {
      if (this.url) window.open(this.url);
    },
  },
});