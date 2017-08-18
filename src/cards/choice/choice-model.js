/**
 * TextModel = client.getCardModelClassForMimeType('application/vnd.layer.card.text+json')
   ChoiceModel = client.getCardModelClassForMimeType('application/vnd.layer.card.choice+json')
   model = new ChoiceModel({
     title: "Trivia Question",
     question: "what is the airspeed velocity of an unladen swallow?",
     choices: [
        {text:  "Zero, it can not get off the ground!", id: "a"},
        {text:  "Are we using Imperial or Metric units?", id: "b"},
        {text:  "What do you mean? African or European swallow?", id: "c"},
      ]
   });
   model.generateMessage($("layer-conversation-view").conversation, message => message.send())
 */
import { Client, MessagePart, Util, Root, CardModel }  from 'layer-websdk';
import ResponseModel from '../response/response-model';
import TextModel from '../text/text-model';
import ButtonsModel from '../buttons/buttons-model';

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
      const selectedChoice = this.choices.filter(item => item.id == answerData.id)[0];
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
    let responseIdentityIds = Object.keys(this.responses.participantData).filter(participantId => this.responses.participantData[participantId].selection);
    if (responseIdentityIds.length > 1) {
      responseIdentityIds = responseIdentityIds.filter(id => senderId !== id);
    }
    this.selectedAnswer = responseIdentityIds.length ? this.responses.participantData[responseIdentityIds[0]].selection : null;
  }

  __updateSelectedAnswer(newValue) {
    this._triggerAsync('change');
  }
}

ChoiceModel.prototype.title = 'Survey Question';
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

