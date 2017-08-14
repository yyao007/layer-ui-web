/**
 * TextModel = client.getCardModelClassForMimeType('application/vnd.layer.card.text+json')
   ChoiceModel = client.getCardModelClassForMimeType('application/vnd.layer.card.choice+json')
   model = new ChoiceModel({
     question: "what is the airspeed velocity of an unladen swallow?",
     choices: [
        {text:  "Zero, it can not get off the ground!", id: "a"},
        {text:  "Are we using Imperial or Metric units?", id: "b"},
        {text:  "What do you mean? African or European swallow?", id: "c"},
      ]
   });
   model.generateMessage($("layer-conversation-view").conversation, message => message.send())


 */
import CardModel from 'layer-websdk/lib/models/card-model';
import { Client, MessagePart, Util, Root }  from 'layer-websdk';
import ResponseModel from '../response/response-model';
import TextModel from '../text/text-model';
import ButtonsModel from '../buttons/buttons-model';

class ChoiceModel extends CardModel {
  _generateParts(callback) {
    const body = this._initBodyWithMetadata(['question', 'action', 'choices']);
    this.part = new layer.MessagePart({
      mimeType: this.constructor.MIMEType,
      body: JSON.stringify(body),
    });
    this._buildActionModels();
    callback([this.part]);
  }

  _parseMessage() {
    super._parseMessage();

    const payload = JSON.parse(this.part.body);
    Object.keys(payload).forEach((propertyName) => {
      this[Util.camelCase(propertyName)] = payload[propertyName];
    });

    this._buildActionModels();
  }

  _buildActionModels() {
    this.actionModels = this.choices.map(item => ({
      type: 'action',
      text: item.text,
      event: 'layer-choice-select',
      data: { id: item.id },
    }));
  }

  selectAnswer(answerData) {
    if (!this.selectedAnswer) {
      const responseModel = new ResponseModel({
        responseToMessage: this.message,
        participantData: {
          selection: answerData.id,
        },
        messageModel: new TextModel({ text: this.generateResponseMessageText() }),
      });
      responseModel.send();
      this.selectedAnswer = answerData.id;
      this.trigger('change');
    }
  }

  _processNewResponses() {
    const responseObject = Object.keys(this.responses).filter(response => response.selection);
    this.selectedAnswer = responseObject ? responseObject.selection : null;
  }

  __updateSelectedAnswer(newValue) {
    this._triggerAsync('change');
  }
}

ChoiceModel.prototype.question = '';
ChoiceModel.prototype.choices = null;
ChoiceModel.prototype.responses = null;

ChoiceModel.defaultAction = 'layer-choice-select';
ChoiceModel.cardRenderer = 'layer-choice-card';
ChoiceModel.MIMEType = 'application/vnd.layer.card.choice+json';
MessagePart.TextualMimeTypes.push(ChoiceModel.MIMEType);

Root.initClass.apply(ChoiceModel, [ChoiceModel, 'ChoiceModel']);

// Register the Card Model Class with the Client
Client.registerCardModelClass(ChoiceModel, "ChoiceModel");

module.exports = ChoiceModel;

