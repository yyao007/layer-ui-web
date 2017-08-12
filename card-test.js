import LayerUI from './lib-es5/index.js';
import Layer from 'layer-websdk';
import Files from './lib-es5/utils/files';
import TextModel from './lib-es5/cards/text/text-model';

var APP_ID = "layer:///apps/staging/2f1707c0-fd2f-11e6-ae72-c27751092ce1";
  var USER_ID = "michael@layer.com";
  var PASSWORD = "mkantor1";
  var PROVIDER_URL = "https://layer-quickstart-michael.herokuapp.com";
  var conversationPanel;

  document.addEventListener('DOMContentLoaded', function() {
      conversationPanel = document.querySelector('layer-conversation-view');
      var uploadButton = document.createElement('layer-file-upload-button');
      uploadButton.accept = 'image/*';
      conversationPanel.composeButtons = [uploadButton];

      var client = window.client = new Layer.Client({
        appId: APP_ID
      });
      client.connect();

      client.on('challenge', function(evt) {
        Layer.xhr({
          url: PROVIDER_URL + '/authenticate',
          headers: {
            'Content-type': 'application/json',
            'Accept': 'application/json'
          },
          method: 'POST',
          data: {
            nonce: evt.nonce,
            email: USER_ID,
            password: PASSWORD
          }
        }, function(res) {
          if (res.success && res.data.identity_token) {
            console.log('challenge: ok');

            evt.callback(res.data.identity_token);
          } else {
            alert('Login failed; please check your user id and password');
          }
        });
      });

      client.on('ready', function() {
        var presenceWidget = document.querySelector('layer-presence');
        presenceWidget.item = client.user;
        presenceWidget.onPresenceClick = function(evt) {
          if (client.user.status === Layer.Identity.STATUS.AVAILABLE) {
            client.user.setStatus(Layer.Identity.STATUS.BUSY);
          } else {
            client.user.setStatus(Layer.Identity.STATUS.AVAILABLE);
          }
        };

        var userNameDiv = document.querySelector('.user-name');
        userNameDiv.innerHTML = client.user.displayName || client.user.userId;
      });

      var dropWatcher = new Files.DragAndDropFileWatcher({
        node: conversationPanel,
        callback: (parts) => {
          debugger;
          const Model = client.getCardModelClassForMimeType('application/vnd.layer.card.image+json');
          new Model({
            source: parts[1].body,
            preview: parts[2].body,
            metadata: {
              artist: 'PNG Generator',
              size: parts[1].body.size,
              title: 'This is an image',
              subtitle: 'A beautiful image full of many many glorious pixels',
              width: JSON.parse(parts[0].body).width,
              height: JSON.parse(parts[0].body).height,
              orientation: JSON.parse(parts[0].body).orientation,
            },
          conversation: conversationPanel.conversation,
        });

          if (conversationPanel.trigger('sending', { parts })) {
            model.message.send();
          }
        },
        allowDocumentDrop: false
      });

      document.body.addEventListener('kill-arthur', function() {
        alert('Hah! Tis only a flesh wound!');
      });

      document.body.addEventListener('grant-grail', function() {
        alert("We've already got one!");
      });
  });



  LayerUI.init({
    appId: APP_ID,
  });

  // document.addEventListener('layer-send-message', function(evt) {
  //   if (evt.detail.parts[0].mimeType === 'text/plain' && evt.detail.parts.length === 1) {
  //     evt.preventDefault();
  //     const text = evt.detail.parts[0].body;
  //     var matches = text.match(/(.*?):(.*)/) || ['', '', text];
  //     new TextModel({
  //       text: matches[2],
  //       title: matches[1],
  //     }).generateMessage(evt.detail.conversation, message => message.send());
  //   }
  // });

  /* Demo Async Message Handler called Ipsum Lorem Handler; creates an <ipsum-lorum-handler /> node for any message containing "ipsum lorum" */
  LayerUI.registerTextHandler({
    name: 'ipsum',
    handler: function(textData, message, isMessageListItemComponent) {
      if (isMessageListItemComponent) {
        var matches = textData.text.match(/ipsum lorem/);
        if (matches) {
          textData.afterText.push('<ipsum-lorem-handler></ipsum-lorem-handler>');
        }
      }
    }
  });

  /* Define the ipsum-lorum-handler Component; comes with message and messageWidget properties
    * refering to the layer.Message and the <layer-message-item-sent /> (or received) widget its associated with.
    * Height MUST be locked no later than the `onAfterCreate` call.  Content of unknown height is tricky, and must
    * allow for, or UI for expanding to full height.  We may build UI for expanding to full height in at some point.
    */
  LayerUI.registerComponent('ipsum-lorem-handler', {
    style: 'ipsum-lorem-handler {height: 100px; display: flex; flex-direction: column; justify-content: center; overflow-y: auto;}',
    methods: {
      onAfterCreate() {
        layer.xhr({
          url: "https://baconipsum.com/api/?type=meat-and-filler&paras=1&start-with-lorem=1&format=text",
        }, this._processResult.bind(this));
      },
      _processResult(result) {
        setTimeout(function() {
          this.innerHTML = this.parentComponent.message.parts[0].body.replace(/ipsum lorem/, result.data);
        }.bind(this), 1000);
      },
    }
  });

  var presendMessage;
  document.addEventListener('layer-send-message', function(evt) {
    if (presendMessage && evt.detail.parts[0].body === presendMessage.parts[0].body) {
      presendMessage.send();
      evt.preventDefault();
    }
  });

  document.addEventListener('layer-composer-change-value', function(evt) {
    var text = evt.detail.value;
    if (!text && presendMessage) {
      presendMessage.destroy();
      presendMessage = null;
    } else {
      if (!presendMessage) {
        presendMessage = conversationPanel.conversation.createMessage();
        presendMessage.addPart({mimeType: "text/plain", body: ""});
        presendMessage.presend();
      }
      presendMessage.parts[0].body = text;
    }
  });

