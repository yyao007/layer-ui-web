/*
ReceiptModel = client.getCardModelClassForMimeType('application/vnd.layer.card.receipt+json')
LocationModel = client.getCardModelClassForMimeType('application/vnd.layer.card.location+json')
ListModel = client.getCardModelClassForMimeType('application/vnd.layer.card.list+json')
ProductModel = client.getCardModelClassForMimeType('application/vnd.layer.card.product+json')
ImageModel = client.getCardModelClassForMimeType('application/vnd.layer.card.image+json')
new ReceiptModel({
  currency: 'USD',
  order: {
    number: 'FRODO-DODO-ONE'
  },
  paymentMethod: "VISA ****1234",
  summary: {
    subtitle: 'Your Purchase is Complete',
    shipping_cost: 350.01,
    total_tax: 0.01,
    total_cost: 350.02
  },
  shippingAddressModel: new LocationModel({
    city: 'San Francisco',
    name: 'Layer Inc',
    postal_code: '94107',
    state: 'CA',
    street1: '655 4th st',
    presentation: 'address'
  }),
  items: [
    {
      currency: 'USD',
      source_url: "https://farm5.staticflickr.com/4272/34912460025_be2700d3e7_k.jpg",
      price: 50,
      quantity: 3,
      title: "A pretty picture",
      subtitle: "Hang it on your wall"
    },
    {
      currency: 'USD',
      source_url: "https://farm5.staticflickr.com/4272/34912460025_be2700d3e7_k.jpg",
      price: 50,
      quantity: 1,
      title: "A boring picture",
      subtitle: "You hanging around near your wall"
    },
    {
      currency: 'USD',
      source_url: "https://farm5.staticflickr.com/4272/34912460025_be2700d3e7_k.jpg",
      price: 150,
      quantity: 1,
      title: "A terrifying picture",
      subtitle: "What you'd look like if you were hung from your wall"
    },
  ]
}).generateMessage($("layer-conversation-view").conversation, message => message.send());
*/
import CardModel from 'layer-websdk/lib/models/card-model';
import { Client, MessagePart, Util }  from 'layer-websdk';

class ReceiptModel extends CardModel {
  _generateParts(callback) {
    const body = this._initBodyWithMetadata(['createdAt', 'currency', 'discounts', 'paymentMethod', 'summary', 'order', 'action', 'items']);

    this.part = new MessagePart({
      mimeType: this.constructor.MIMEType,
      body: JSON.stringify(body),
    });
    const parts = [this.part];

    const expectedCount = this.constructor.modelSet.filter(modelDef => this[modelDef.model]).length;
    let currentCount = 0;

    this.constructor.modelSet.forEach((modelDef) => {
      if (this[modelDef.model]) {
        this._addModel(this[modelDef.model], modelDef.role, (moreParts) => {
          moreParts.forEach(p => parts.push(p));
          currentCount++;
          if (currentCount === expectedCount) callback(parts);
        });
      }
    });
  }

  _parseMessage() {
    const payload = JSON.parse(this.part.body);
    const summary = payload.summary;
    delete payload.summary;
    if (payload.createdAt) payload.createdAt = new Date(payload.createdAt);
    Object.keys(payload).forEach((propertyName) => {
      this[Util.camelCase(propertyName)] = payload[propertyName];
    });
    this.summary = {};
    if (summary) {
      Object.keys(summary).forEach((propertyName) => {
        this.summary[Util.camelCase(propertyName)] = summary[propertyName];
      });
    }

    this.billingAddressModel = this.getModelFromPart('billing-address');
    this.shippingAddressModel = this.getModelFromPart('shipping-address');
    this.merchantModel = this.getModelFromPart('merchant');
    this.recipientModel = this.getModelFromPart('recipient');
  }
}

ReceiptModel.prototype.billingAddressModel = null;
ReceiptModel.prototype.shippingAddressModel = null;
ReceiptModel.prototype.createdAt = null;
ReceiptModel.prototype.currency = '';
ReceiptModel.prototype.discounts = null;
ReceiptModel.prototype.items = null;
ReceiptModel.prototype.merchantModel = null;
ReceiptModel.prototype.paymentMethod = '';
ReceiptModel.prototype.recipientModel = null;

// Expected fields: number, url
ReceiptModel.prototype.order = null;

// Expected fields: subtitle, shipping_cost, total_tax, total_cost
ReceiptModel.prototype.summary = null;

ReceiptModel.modelSet = [
  {model: 'productModel', role: 'product'},
  {model: 'shippingAddressModel', role: 'shipping-address'},
  {model: 'billingAddressModel', role: 'billing-address'},
  {model: 'merchantModel', role: 'merchant'},
  {model: 'recipientModel', role: 'recipient'}
];

ReceiptModel.MIMEType = 'application/vnd.layer.card.receipt+json';
ReceiptModel.cardRenderer = 'layer-receipt-card';
MessagePart.TextualMimeTypes.push(ReceiptModel.MIMEType);

// Register the Card Model Class with the Client
Client.registerCardModelClass(ReceiptModel, 'ReceiptModel');

module.exports = ReceiptModel;
