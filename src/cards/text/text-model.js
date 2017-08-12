/*
 * Generating Samples:

   TextModel = layer.Client.getCardModelClass('TextModel')
   model = new TextModel({title: "this is a title", author: "some guy with a keyboard", text: "They call me Michael. I don't really know why."})
   model.generateMessage($("layer-conversation-view").conversation, message => message.send())

   model = new TextModel({
    text: 'And the Lord spake, saying, "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. Four shalt thou not count, neither count thou two, excepting that thou then proceed to three. Five is right out! Once the number three, being the third number, be reached, then lobbest thou thy Holy Hand Grenade of Antioch towards thy foe, who, being naughty in my sight, shall snuff it.',
    title: 'The Holy Hand Grenade',
    author: 'King Arthur'
  });
  model.generateMessage($("layer-conversation-view").conversation, message => message.send());

  model = new TextModel({
    text: 'And the Lord spake, saying, "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. Four shalt thou not count, neither count thou two, excepting that thou then proceed to three. Five is right out! Once the number three, being the third number, be reached, then lobbest thou thy Holy Hand Grenade of Antioch towards thy foe, who, being naughty in my sight, shall snuff it.',
    title: 'The Holy Hand Grenade',
    subtitle: 'This quote totally blows'
  });
  model.generateMessage($("layer-conversation-view").conversation, message => message.send());
 */
import CardModel from 'layer-websdk/lib/models/card-model';
import { Client, MessagePart, Util, Root }  from 'layer-websdk';

class TextModel extends CardModel {

  _generateParts(callback) {
    const body = this._initBodyWithMetadata(['text', 'author', 'summary', 'title', 'subtitle', 'action']);

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

  getDescription() { return this.subtitle; }
  getFooter() { return this.author; }
}

TextModel.prototype.text = '';
TextModel.prototype.summary = '';
TextModel.prototype.author = '';
TextModel.prototype.title = '';
TextModel.prototype.subtitle = '';
TextModel.prototype.mimeType = 'text/plain';

TextModel.MIMEType = 'application/vnd.layer.card.text+json';
TextModel.cardRenderer = 'layer-text-card';
Root.initClass.apply(TextModel, [TextModel, 'TextModel']);

MessagePart.TextualMimeTypes.push(TextModel.MIMEType);

// Register the Card Model Class with the Client
Client.registerCardModelClass(TextModel, "TextModel");

module.exports = TextModel;


