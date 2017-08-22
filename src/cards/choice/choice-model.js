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
import { Client, MessagePart, Root, CardModel } from 'layer-websdk';
import ResponseModel from '../response/response-model';
import TextModel from '../text/text-model';

class ChoiceModel extends CardModel {
  _generateParts(callback) {
    const body = this._initBodyWithMetadata(['question', 'action', 'choices']);
    this.part = new MessagePart({
      mimeType: this.constructor.MIMEType,
      body: JSON.stringify(body),
    });
    this._buildActionModels();
    callback([this.part]);
  }

  _parseMessage(payload) {
    super._parseMessage(payload);
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
      const selectedChoice = this.choices.filter(item => item.id === answerData.id)[0];
      const responseModel = new ResponseModel({
        responseToMessage: this.message,
        responseToNodeId: this.message.getPartsMatchingAttribute({ role: 'root' })[0].mimeAttributes['node-id'],
        participantData: {
          selection: answerData.id,
        },
        messageModel: new TextModel({
          text: this.getClient().user.displayName + ' selected ' + selectedChoice.text,
        }),
      });
      responseModel.send();
      this.selectedAnswer = answerData.id;
      this.trigger('change');
    }
  }

  _processNewResponses() {
    const senderId = this.message.sender.userId;
    const data = this.responses.participantData;
    let responseIdentityIds = Object.keys(data).filter(participantId => data[participantId].selection);
    if (responseIdentityIds.length > 1) {
      responseIdentityIds = responseIdentityIds.filter(id => senderId !== id);
    }
    this.selectedAnswer = responseIdentityIds.length ? data[responseIdentityIds[0]].selection : null;
  }

  __updateSelectedAnswer(newValue) {
    this._triggerAsync('change');
  }

  getOneLineSummary() {
    return this.question || this.title;
  }
}

ChoiceModel.prototype.title = 'Choose One';
ChoiceModel.prototype.question = '';
ChoiceModel.prototype.choices = null;
ChoiceModel.prototype.responses = null;

ChoiceModel.Label = 'Choose One';
ChoiceModel.defaultAction = 'layer-choice-select';
ChoiceModel.cardRenderer = 'layer-choice-card';
ChoiceModel.MIMEType = 'application/vnd.layer.card.choice+json';
MessagePart.TextualMimeTypes.push(ChoiceModel.MIMEType);

Root.initClass.apply(ChoiceModel, [ChoiceModel, 'ChoiceModel']);

// Register the Card Model Class with the Client
Client.registerCardModelClass(ChoiceModel, 'ChoiceModel');

module.exports = ChoiceModel;

