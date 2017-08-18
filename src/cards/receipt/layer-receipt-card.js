/**
 *
 * @class layerUI.handlers.message.CardView
 * @extends layerUI.components.Component
 */
import { registerComponent } from '../../components/component';
import CardMixin from '../card-mixin';

registerComponent('layer-receipt-card-item', {
  template: `
    <img layer-id='img' />
    <div class='layer-receipt-card-item-right'>
      <div layer-id="title" class="layer-card-title"></div>
      <div layer-id="description" class="layer-card-description"></div>
      <div layer-id="footer" class="layer-card-footer"></div>
    </div>
  `,
  style: `layer-receipt-card-item {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
  }
  `,
  properties: {
    item: {},
  },
  methods: {
    onRender() {
      this.onRerender();
    },
    onRerender() {
      this.nodes.img.src = this.item.source_url;
      this.nodes.title.innerHTML = this.item.title;
      this.nodes.description.innerHTML = this.item.subtitle;
      this.nodes.footer.innerHTML = this.item.quantity !== 1 ? 'Qty: ' + this.item.quantity : '';
    },
  },
});

registerComponent('layer-receipt-card', {
  template: `
  <div class="layer-receipt-for-products" layer-id="products"></div>
  <div class='layer-receipt-details'>
    <div class='layer-paid-with layer-receipt-detail-item'>
      <label>Paid with</label>
      <div class="layer-receipt-paid-with layer-card-description" layer-id='paidWith'></div>
    </div>
    <div class='layer-address layer-receipt-detail-item'>
      <label>Ship to</label>
      <layer-card-view layer-id='shipTo' hide-map='true'></layer-card-view>
    </div>
    <div class='layer-receipt-summary layer-receipt-detail-item'>
      <label>Total</label>
      <span class='layer-receipt-price' layer-id='total'></span>
    </div>
  </div>
  `,
  style: `layer-receipt-card {
    display: block;
  }
  layer-card-view.layer-receipt-card {
    padding-bottom: 0px;
  }
  `,
  mixins: [CardMixin],
  // Note that there is also a message property managed by the MessageHandler mixin
  properties: {
    cardContainerTagName: {
      noGetterFromSetter: true,
      value: 'layer-titled-card-container',
    },
  },
  methods: {
    /**
     * Can be rendered in a concise format required for Conversation Last Message and Layer Notifier
     *
     * @method
     */
    canRenderConcise(message) {
      return false;
    },

    getIconClass() {
      return 'layer-receipt-card-icon';
    },
    getTitle() {
      return 'Order Confirmation';
    },

    /**
     *
     * @method
     */
    onRender() {

    },

    onRerender() {
      this.nodes.products.innerHTML = '';
      this.model.items.forEach((item) => {
        this.createElement('layer-receipt-card-item', {
          item,
          parentNode: this.nodes.products,
        });
      });

      if (this.model.shippingAddressModel) {
        const shipTo = this.nodes.shipTo;
        this.model.shippingAddressModel.showAddress = true;
        shipTo.rootPart = this.model.shippingAddressModel.part;
        shipTo.model = this.model.shippingAddressModel;

        shipTo.message = this.model.message;
        shipTo.cardBorderStyle = 'none';
        shipTo._onAfterCreate();

        shipTo.nodes.ui.hideMap = true;
      }

      this.nodes.total.innerHTML = new Number(this.model.summary.totalCost)
        .toLocaleString(navigator.language, {
          currency: this.model.currency,
          style: 'currency',
        });
      this.nodes.paidWith.innerHTML = this.model.paymentMethod || 'Unknown';
    },
  },
});

