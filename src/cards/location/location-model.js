/*
 * Generating Samples:

   LocationModel = layer.Client.getCardModelClass('LocationModel');

   model = new LocationModel({
     latitude: 37.7734858,
     longitude: -122.3916087,
     heading: 23.45,
     altitude: 35.67,
     title: "Here I am.  Right there on the dot. I'm stuck on the dot.  Please free me.",
     description: "Dot prisoner 455 has attempted to escape.  Send in the puncutation and make a very strong point about dot prisoner escapes",
     accuracy: 0.8,
     createdAt: new Date(),
  });
  model.generateMessage($("layer-conversation-view").conversation, message => message.send());

  model = new LocationModel({
      city: 'San Francisco',
      title: 'Layer Inc',
      postal_code: '94107',
      state: 'CA',
      street1: '655 4th st',
      presentation: 'address'
    });
    model.generateMessage($("layer-conversation-view").conversation, message => message.send());

  LocationModel = layer.Client.getCardModelClass('LocationModel');
  ButtonsModel = layer.Client.getCardModelClass('ButtonsModel');
  model = new ButtonsModel({
    buttons: [{"type": "action", "text": "Navigate", "event": "open-map"}]
    contentModel: new LocationModel({
      latitude: 37.7734858,
      longitude: -122.3916087,
      heading: "North",
      altitude: 35,
      title: "Here I am.  Right there on the dot. I'm stuck on the dot.  Please free me.",
      description: "Dot prisoner 455 has attempted to escape.  Send in the puncutation and make a very strong point about dot prisoner escapes",
      accuracy: 0.8,
      createdAt: new Date(),
    })
  });
  model.generateMessage($("layer-conversation-view").conversation, message => message.send());
 */
import { xhr } from 'layer-websdk';
import CardModel from 'layer-websdk/lib/models/card-model';
import { Client, MessagePart, Util }  from 'layer-websdk';


class LocationModel extends CardModel {
  _generateParts(callback) {
    const body = this._initBodyWithMetadata(['latitude', 'longitude', 'heading', 'accuracy', 'createdAt', 'altitude', 'description', 'title', 'action', 'city', 'country', 'postalCode', 'administrativeArea', 'street1', 'street2', 'presentation']);

    this.part = new layer.MessagePart({
      mimeType: this.constructor.MIMEType,
      body: JSON.stringify(body),
    });
    callback([this.part]);
  }

  _parseMessage() {
    const payload = JSON.parse(this.part.body);
    Object.keys(payload).forEach((propertyName) => {
      this[Util.camelCase(propertyName)] = payload[propertyName];
    });
  }

  getDescription() {
    if (this.presentation === 'map') {
      return this.description;
    } else {
      return this.street1 + (this.street2 ? ' ' + this.street2 : '') + `<br/> ${this.city} ${this.administrativeArea} ${this.postalCode ? ', ' + this.postalCode : ''}`;
    }
  }
}

LocationModel.prototype.latitude = 0;
LocationModel.prototype.longitude = 0;
LocationModel.prototype.zoom = 17;
LocationModel.prototype.heading = 0;
LocationModel.prototype.altitude = 0;
LocationModel.prototype.title = '';
LocationModel.prototype.accuracy = 0;
LocationModel.prototype.createdAt = null;
LocationModel.prototype.description = '';
LocationModel.prototype.city = '';
LocationModel.prototype.country = '';
LocationModel.prototype.postalCode = '';
LocationModel.prototype.administrativeArea = '';
LocationModel.prototype.street1 = '';
LocationModel.prototype.street2 = '';
LocationModel.prototype.presentation = 'map'; // alt value is "address"

LocationModel.defaultAction = 'open-map';
LocationModel.cardRenderer = 'layer-location-card';
LocationModel.MIMEType = 'application/vnd.layer.card.location+json';

MessagePart.TextualMimeTypes.push(LocationModel.MIMEType);

// Register the Card Model Class with the Client
Client.registerCardModelClass(LocationModel, "LocationModel");

module.exports = LocationModel;

