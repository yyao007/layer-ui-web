/**
 *
 * @class layerUI.handlers.message.CardView
 * @extends layerUI.components.Component
 */
import { registerComponent } from '../../components/component';
import CardMixin from '../card-mixin';
import CardPrimitiveMixin from '../card-primitive-mixin';

registerComponent('layer-product-card', {
  style: `layer-product-card {
    display: block;
  }
  layer-product-card > layer-card-view, layer-product-card > layer-card-view.layer-root-card {
    max-width: 100%;
    width: 100%;
  }
  `,
  mixins: [CardMixin, CardPrimitiveMixin],
  // Note that there is also a message property managed by the MessageHandler mixin
  properties: {

  },
  methods: {
    /**
     * Can be rendered in a concise format required for Conversation Last Message and Layer Notifier
     *
     * @method
     */
    canRenderConcise(message) {
      return true;
    },

    onRerender() {
      this.innerHTML = '';
      if (this.model.detailModel) {
        this.createElement('layer-card-view', {
          message: this.model.message,
          rootPart: this.model.detailModel.part,
          model: this.model.detailModel,
          //cardContainerTagName: false,
          cardBorderStyle: 'none',
          parentNode: this,
        });
      }
    },

    /**
     *
     * @method
     */
    onRender() {

    },
  },
});
