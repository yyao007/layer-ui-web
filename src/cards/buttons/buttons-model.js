/*
   TODO: use of selectedAnswer within a choice causes problems when combined with allowDeselect

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
      {"type": "action", "text": "Kill Arthur, all his friends, his horse and his dog", "event": "kill-arthur"},
      {"type": "action", "text": "Give Holy Grail", "event": "grant-grail"}
    ]
  });
  model.generateMessage($("layer-conversation-view").conversation, message => message.send())

     ButtonModel = layer.Client.getCardModelClass('ButtonsModel')
  model = new ButtonModel({
    buttons: [
      {"type": "choice", "choices": [{"text": "like", "id": "like", "tooltip": "like"}, {"text": "dislike", "id": "dislike", "tooltip": "dislike"}], "data": {"responseName": "satisfaction", selectedAnswer: 'dislike', allowReselect: true}},
      {"type": "action", "text": "do nothing"},
      {"type": "choice", "choices": [{"text": "helpful", "id": "helpful", "tooltip": "helpful"}, {"text": "unhelpful", "id": "unhelpful", "tooltip": "unhelpful"}], "data": {"responseName": "helpfulness", allowReslect: true}},
    ]
  });
  model.generateMessage($("layer-conversation-view").conversation, message => message.send())

ProductModel = client.getCardModelClassForMimeType('application/vnd.layer.card.product+json')
   ImageModel = client.getCardModelClassForMimeType('application/vnd.layer.card.image+json')
   ButtonModel = layer.Client.getCardModelClass('ButtonsModel')
  model = new ButtonModel({
    buttons: [
      {
        "type": "choice",
        "choices": [{"text": "like", "id": "like", "tooltip": "like", "icon": "custom-like-button"}, {"text": "dislike", "id": "dislike", "tooltip": "dislike", "icon": "custom-dislike-button"}],
        "data": {"responseName": "satisfaction", selectedAnswer: 'dislike', allowReselect: true}
      },
      {
        "type": "choice",
        "choices": [{"text": "\uD83D\uDC4D", "id": "like", "tooltip": "like", "icon": "custom-like-button"}, {"text": "\uD83D\uDC4E", "id": "dislike", "tooltip": "dislike", "icon": "custom-dislike-button"}],
        "data": {"responseName": "thumborientation", allowReselect: true, allowDeselect: false}
      },
      {
        "type": "choice",
        "choices": [{"text": "helpful", "id": "helpful", "tooltip": "helpful"}, {"text": "unhelpful", "id": "unhelpful", "tooltip": "unhelpful"}],
        "data": {"responseName": "helpfulness", allowReselect: false}
      },
    ],
    contentModel: new ProductModel({
      currency: 'USD',
      price: 175,
      quantity: 3,
      brand: "randomcrap.com",
      name: "A pretty picture",
      imageUrls: [ "https://farm5.staticflickr.com/4272/34912460025_be2700d3e7_k.jpg" ],
    })
  });
  model.generateMessage($("layer-conversation-view").conversation, message => message.send());



ProductModel = client.getCardModelClassForMimeType('application/vnd.layer.card.product+json')
   ImageModel = client.getCardModelClassForMimeType('application/vnd.layer.card.image+json')
   ButtonModel = layer.Client.getCardModelClass('ButtonsModel')
  model = new ButtonModel({
    buttons: [
      {
        "type": "choice",
        "choices": [{"text": "like", "id": "like", "tooltip": "like", "icon": "custom-like-button"}, {"text": "dislike", "id": "dislike", "tooltip": "dislike", "icon": "custom-dislike-button"}],
        "data": {"responseName": "satisfaction", selectedAnswer: 'dislike', allowReselect: true}
      },
      {
        "type": "choice",
        "choices": [{"text": "\uD83D\uDC4D", "id": "like", "tooltip": "like", "icon": "custom-like-button"}, {"text": "\uD83D\uDC4E", "id": "dislike", "tooltip": "dislike", "icon": "custom-dislike-button"}],
        "data": {"responseName": "thumborientation", allowReselect: true, allowDeselect: false, customResponseData: {howdy: "ho der"}}
      },
      {
        "type": "choice",
        "choices": [{"text": "helpful", "id": "helpful", "tooltip": "helpful"}, {"text": "unhelpful", "id": "unhelpful", "tooltip": "unhelpful"}],
        "data": {"responseName": "helpfulness", allowReselect: false}
      },
    ],
    contentModel: new ProductModel({
      currency: 'USD',
      price: 175,
      quantity: 3,
      brand: "randomcrap.com",
      name: "A pretty picture",
      imageUrls: [ "https://farm5.staticflickr.com/4272/34912460025_be2700d3e7_k.jpg" ],
    })
  });
  model.generateMessage($("layer-conversation-view").conversation, message => message.send());

  ProductModel = client.getCardModelClassForMimeType('application/vnd.layer.card.product+json')
   ImageModel = client.getCardModelClassForMimeType('application/vnd.layer.card.image+json')
   ButtonModel = layer.Client.getCardModelClass('ButtonsModel')
  model = new ButtonModel({
    buttons: [
      {
        "type": "choice",
        "choices": [
          {
            "text": "like",
            "id": "like",
            "tooltip": "like",
            "style": "style name supported by UI Framework or provided by customer",
            "states": {
              "default": {
                "text": "love",
                "tooltip": "love",
                "style": "override the base style"
              },
              "selected": {
                "text": "please deselect me"
              },
              "disabled": {
                "text": "Feature not enabled",
                "style": "warning_button"
              }
            }
          },
          {
            "text": "dislike",
            "id": "dislike",
            "tooltip": "dislike"
          }],
        "data": {"responseName": "satisfaction", allowReselect: true}
      },
      {
        "type": "choice",
        "choices": [{"text": "\uD83D\uDC4D", "id": "up", "tooltip": "like", "icon": "custom-like-button"}, {"text": "\uD83D\uDC4E", "id": "down", "tooltip": "dislike", "icon": "custom-dislike-button"}],
        "data": {"responseName": "thumborientation", allowReselect: true, allowDeselect: false, customResponseData: {howdy: "ho der"}}
      },
      {
        "type": "choice",
        "choices": [{"text": "helpful", "id": "helpful", "tooltip": "helpful"}, {"text": "unhelpful", "id": "unhelpful", "tooltip": "unhelpful"}],
        "data": {"responseName": "helpfulness", allowReselect: false}
      },
    ],
    contentModel: new ProductModel({
      currency: 'USD',
      price: 175,
      quantity: 3,
      brand: "randomcrap.com",
      name: "A pretty picture",
      imageUrls: [ "https://farm5.staticflickr.com/4272/34912460025_be2700d3e7_k.jpg" ],
    })
  });
  model.generateMessage($("layer-conversation-view").conversation, message => message.send());



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



model = new ButtonModel({
  buttons: [
    {"type": "url", "text": "Open Layer", "url": "https://layer.com"},
    {"type": "action", "text": "Give Holy Grail", "event": "grant-grail"}
  ]
});
model.generateMessage($("layer-conversation-view").conversation, message => message.send());

* @class layerUI.cards.ButtonsModel
* @extends layer.model
*/
import { Client, MessagePart, CardModel } from '@layerhq/layer-websdk';
import ChoiceModel from '../choice/choice-model';

class ButtonsModel extends CardModel {
  _generateParts(callback) {
    const body = this._initBodyWithMetadata(['buttons', 'states']);
    this.part = new MessagePart({
      mimeType: this.constructor.MIMEType,
      body: JSON.stringify(body),
    });
    this._setupButtonModels();
    if (this.contentModel) {
      this._addModel(this.contentModel, 'content', (parts) => {
        callback([this.part].concat(parts));
      });
    } else {
      callback([this.part]);
    }
  }

  _parseMessage(payload) {
    super._parseMessage(payload);

    const contentPart = this.childParts.filter(part => part.mimeAttributes.role === 'content')[0];
    if (contentPart) this.contentModel = this.getClient().createCardModel(this.message, contentPart);
    this._setupButtonModels();
  }

  _setupButtonModels() {
    if (!this.choices) this.choices = {};
    const choices = this.buttons.filter(button => button.type === 'choice');
    choices.forEach((button) => {
      const obj = {
        parentNodeId: this.nodeId,
        choices: button.choices,
        message: this.message,
        responses: this.responses,
      };
      if ('responseName' in button.data) obj.responseName = button.data.responseName;
      if ('allowDeselect' in button.data) obj.allowDeselect = button.data.allowDeselect;
      if ('allowReselect' in button.data) obj.allowReselect = button.data.allowReselect;
      if ('selectedAnswer' in button.data) obj.selectedAnswer = button.data.selectedAnswer;
      if ('customResponseData' in button.data) obj.customResponseData = button.data.customResponseData;
      if ('states' in button.data) obj.states = button.data.states;

      // Generate the model and add it to this.choices[model.responseName]
      const model = new ChoiceModel(obj);
      if (!this.choices[model.responseName]) {
        this.choices[model.responseName] = model;
        model.on('change', () => this.on('change'));

        // Update the selectedAnswer based on any responses
        if (model.responses) {
          model._processNewResponses();
        }
      } else {
        // the ChoiceModel already exists; lets update its properties
        Object.keys(obj).forEach((prop) => {
          this.choices[model.responseName][prop] = obj[prop];
        });
      }
    });
  }

  getTitle() { return this.contentModel ? this.contentModel.getTitle() : ''; }
  getFooter() { return this.contentModel ? this.contentModel.getFooter() : ''; }
  getDescription() { return this.contentModel ? this.contentModel.getDescription() : ''; }

  getOneLineSummary() {
    if (this.contentModel) {
      return this.contentModel.getOneLineSummary();
    }
  }
}
ButtonsModel.prototype.buttons = null;
ButtonsModel.prototype.contentModel = null;
ButtonsModel.prototype.choices = null;
ButtonsModel.prototype.states = null;

ButtonsModel.Label = 'Buttons';
ButtonsModel.cardRenderer = 'layer-buttons-card';
ButtonsModel.MIMEType = 'application/vnd.layer.card.buttons+json';
MessagePart.TextualMimeTypes.push(ButtonsModel.MIMEType);

// Register the Card Model Class with the Client
Client.registerCardModelClass(ButtonsModel, 'ButtonsModel');

module.exports = ButtonsModel;

