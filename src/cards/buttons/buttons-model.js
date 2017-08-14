/*

   TextModel = layer.Client.getCardModelClass('TextModel')
   ButtonModel = layer.Client.getCardModelClass('ButtonsModel')

  model = new ButtonModel({
    buttons: [
      {"type": "action", "text": "Kill Arthur", "event": "kill-arthur"},
      {"type": "action", "text": "Give Holy Grail", "event": "grant-grail"}
    ]
  });
  model.generateMessage($("layer-conversation-view").conversation, message => message.send())

  model = new ButtonModel({
    buttons: [
      {"type": "action", "text": "Kill Arthur", "event": "kill-arthur"},
      {"type": "action", "text": "Give Holy Grail", "event": "grant-grail"}
    ],
    contentModel: new TextModel({
      text: 'And the Lord spake, saying, "First shalt thou take out the Holy Pin. Then shalt thou count to three, no more, no less. Three shall be the number thou shalt count, and the number of the counting shall be three. Four shalt thou not count, neither count thou two, excepting that thou then proceed to three. Five is right out! Once the number three, being the third number, be reached, then lobbest thou thy Holy Hand Grenade of Antioch towards thy foe, who, being naughty in my sight, shall snuff it.',
      title: 'The Holy Hand Grenade',
      author: 'King Arthur'
    })
  });
  model.generateMessage($("layer-conversation-view").conversation, message => message.send())


// Basic List
message = conversation.createMessage({parts: [
  {
    mimeType: "application/vnd.layer.card.buttons+json; role=root; node-id=root",
    body: '{"buttons": [{"type": "action", "text": "hello", "event": "doit"} ]}'
  },
  {
    mimeType: "application/vnd.layer.card.list+json; role=content; node-id=list; parent-node-id=root",
    body: '{}'
  },
  {
    mimeType: "application/vnd.layer.card.text+json; role=list-item; parent-node-id=list",
    body: '{"text": "hello world 1"}'
  },
  {
    mimeType: "application/vnd.layer.card.text+json; role=list-item; parent-node-id=list",
    body: '{"text": "hello world 2"}'
  },
  {
    mimeType: "application/vnd.layer.card.text+json; role=list-item; parent-node-id=list",
    body: '{"text": "hello world 3"}'
  }
]});

// List of Buttons with Text Items
message = conversation.createMessage({parts: [
  {
    mimeType: "application/vnd.layer.card.buttons+json; role=root; node-id=root",
    body: '{"buttons": [{"type": "action", "text": "hello", "event": "doit"} ]}'
  },
  {
    mimeType: "application/vnd.layer.card.list+json; role=content; node-id=list; parent-node-id=root",
    body: '{}'
  },
  {
    mimeType: "application/vnd.layer.card.buttons+json; role=list-item; node-id=item1; parent-node-id=list",
    body: '{"buttons": [{"type": "action", "text": "hello 1", "event": "doit"} ]}'
  },
  {
    mimeType: "application/vnd.layer.card.text+json; role=content; parent-node-id=item1",
    body: '{"text": "hello world 1"}'
  },
  {
    mimeType: "application/vnd.layer.card.buttons+json; role=list-item; node-id=item2; parent-node-id=list",
    body: '{"buttons": [{"type": "action", "text": "hello 2", "event": "doit"} ]}'
  },
  {
    mimeType: "application/vnd.layer.card.text+json; role=content; parent-node-id=item2",
    body: '{"text": "hello world 2"}'
  },
  {
    mimeType: "application/vnd.layer.card.buttons+json; role=list-item; node-id=item3; parent-node-id=list",
    body: '{"buttons": [{"type": "action", "text": "hello 3", "event": "doit"} ]}'
  },
  {
    mimeType: "application/vnd.layer.card.text+json; role=content; parent-node-id=item3",
    body: '{"text": "hello world 3"}'
  }
]});
*/
import CardModel from 'layer-websdk/lib/models/card-model';
import { Client, MessagePart }  from 'layer-websdk';


class ButtonsModel extends CardModel {
   _generateParts(callback) {
    const body = this._initBodyWithMetadata(['buttons']);
    this.part = new layer.MessagePart({
      mimeType: this.constructor.MIMEType,
      body: JSON.stringify(body),
    });
    if (this.contentModel) {
      this._addModel(this.contentModel, 'content', (parts) => {
        callback([this.part].concat(parts));
      });
    } else {
      callback([this.part]);
    }
  }

  _parseMessage() {
    super._parseMessage();
    this.buttons = JSON.parse(this.part.body).buttons;
    const contentPart = this.childParts.filter(part => part.mimeAttributes.role === 'content')[0];
    if (contentPart) this.contentModel = this.getClient().createCardModel(this.message, contentPart);
  }

  getTitle() { return this.contentModel ? this.contentModel.getTitle() : ''; }
  getFooter() { return this.contentModel ? this.contentModel.getFooter() : ''; }
  getDescription() { return this.contentModel ? this.contentModel.getDescription() : ''; }
}
ButtonsModel.prototype.buttons = null;
ButtonsModel.prototype.contentModel = null;

ButtonsModel.cardRenderer = 'layer-buttons-card';
ButtonsModel.MIMEType = 'application/vnd.layer.card.buttons+json';
MessagePart.TextualMimeTypes.push(ButtonsModel.MIMEType);

// Register the Card Model Class with the Client
Client.registerCardModelClass(ButtonsModel, "ButtonsModel");

module.exports = ButtonsModel;

window.PollModel = ButtonsModel; // debug stuff
