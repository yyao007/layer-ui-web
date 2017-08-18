
import Layer from 'layer-websdk';
import { Client, MessagePart, Util, CardModel }  from 'layer-websdk';

class ResponseModel extends CardModel {
  _generateParts(callback) {
    if (this.responseTo && !this.responseToMessage) {
      this.responseToMessage = this.getClient().getMessage(this.responseTo, true);
    } else if (this.responseToMessage) {
      this.responseTo = this.responseToMessage.id;
    }

    const body = this._initBodyWithMetadata(['responseTo', 'responseToNodeId', 'participantData', 'sharedData']);

    this.part = new MessagePart({
      mimeType: this.constructor.MIMEType,
      body: JSON.stringify(body),
    });
    const parts = [this.part];

    if (this.messageModel) {
      this._addModel(this.messageModel, 'message', (moreParts) => {
        moreParts.forEach(p => parts.push(p));
        callback(parts);
      });
    } else {
      callback(parts);
    }
  }

  // Reads identity_id and data out of the MessagePart.body and into this model
  _parseMessage(payload) {
    super._parseMessage(payload);

    const messagePart = this.childParts.filter(part => part.mimeAttributes.role === 'message')[0];
    if (messagePart) {
      this.messageModel = this.getClient().createCardModel(this.message, messagePart);
    }
    if (this.responseTo) {
      this.responseToMessage = this.getClient().getMessage(this.responseTo, true);
    } else if (this.responseToMessage) {
      this.responseTo = this.responseToMessage.id;
    }
  }

  send(notification) {
    this.generateMessage(this.responseToMessage.getConversation(), message => message.send(notification));
  }
}

ResponseModel.prototype.participantData = null;
ResponseModel.prototype.sharedData = null;
ResponseModel.prototype.responseTo = null;
ResponseModel.prototype.responseToNodeId = null;
ResponseModel.prototype.responseToMessage = null;
ResponseModel.prototype.messageModel = null;

ResponseModel.cardRenderer = 'layer-response-card';
ResponseModel.MIMEType = 'application/vnd.layer.card.response+json';
Layer.MessagePart.TextualMimeTypes.push(ResponseModel.MIMEType);
Layer.MessagePart.TextualMimeTypes.push('application/vnd.layer.card.responsesummary+json');

// Register the Card Model Class with the Client
Client.registerCardModelClass(ResponseModel, 'ResponseModel');

module.exports = ResponseModel;
