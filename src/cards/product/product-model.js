/*
   ProductModel = client.getCardModelClassForMimeType('application/vnd.layer.card.product+json')
   ImageModel = client.getCardModelClassForMimeType('application/vnd.layer.card.image+json')
   model = new ProductModel({
      currency: 'USD',
      price: 175,
      quantity: 3,
      title: "A pretty picture",
      subtitle: "Prettier than YOU deserve!",
      detailModel: new ImageModel({
        sourceUrl: "https://farm5.staticflickr.com/4272/34912460025_be2700d3e7_k.jpg"
      })
  });
  model.generateMessage($("layer-conversation-view").conversation, message => message.send());
  */

/**
 * A Product model, typically used within a Recipt Model, but usable anywhere that you want to display simple product information.
 */

import CardModel from 'layer-websdk/lib/models/card-model';
import { Client, MessagePart, Root, Util }  from 'layer-websdk';

class ProductModel extends CardModel {
  _generateParts(callback) {
    const body = this._initBodyWithMetadata(['currency', 'price', 'quantity', 'url', 'subtitle', 'title', 'action']);
    this.part = new layer.MessagePart({
      mimeType: this.constructor.MIMEType,
      body: JSON.stringify(body),
    });
    if (this.detailModel) {
      this.detailModel._generateParts((parts) => {
        parts[0].mimeAttributes['parent-node-id'] = this.part.mimeAttributes['node-id'];
        parts[0].mimeAttributes.role = 'product-detail';
        callback([this.part].concat(parts));
      });
    } else {
      callback([this.part]);
    }
  }

  _parseMessage() {
    const payload = JSON.parse(this.part.body);
    Object.keys(payload).forEach((propertyName) => {
      this[Util.camelCase(propertyName)] = payload[propertyName];
    });

    const detailPart = this.childParts.filter(part => part.mimeAttributes.role === 'product-detail')[0];
    if (detailPart) {
      this.detailModel = this.getClient().createCardModel(this.message, detailPart);
    }
  }

  __getCurrentCardRenderer(pKey) {
    return this.detailModel ? this.detailModel.currentCardRenderer : this[pKey];
  }
  getDescription() { return this.subtitle; }
  getFooter() {
    const price = new Number(this.price).toLocaleString(navigator.language, {
      currency: this.currency,
      style: "currency",
    });
    const total = new Number(this.price * this.quantity).toLocaleString(navigator.language, {
      currency: this.currency,
      style: "currency",
    });;
    return (this.quantity > 1 ? `Quantity: ${this.quantity}; Per Unit Cost: ${price}; Total: ${total}`  : `Price: ${total}`);
  }
}

ProductModel.prototype.detailModel = null; // product-detail
ProductModel.prototype.currency = 'USD';
ProductModel.prototype.price = null;
ProductModel.prototype.quantity = null;
ProductModel.prototype.title = '';
ProductModel.prototype.subtitle = '';
ProductModel.prototype.url = ''; // Where to go for more information on this product
ProductModel.defaultAction = 'open-url';

ProductModel.cardRenderer = 'layer-product-card';
ProductModel.MIMEType = "application/vnd.layer.card.product+json";

MessagePart.TextualMimeTypes.push(ProductModel.MIMEType);

// Register the Card Model Class with the Client
Client.registerCardModelClass(ProductModel, "ProductModel");

Root.initClass.apply(ProductModel, [ProductModel, 'ProductModel']);
module.exports = ProductModel;
