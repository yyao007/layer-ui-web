window.layerUI.setupMixins({
  'layer-messages-list': {
    properties: {
      replaceableContent: {
        value: {
          messageRowRightSide: function() {
            var menu = document.createElement('layer-menu-button');
            return menu;
          },
          messageRowHeader: function(messageWidget) {
            var sender = messageWidget.item.sender;
            var parent = document.createElement('div');

            var name = document.createElement('span');
            name.innerHTML = sender.displayName;
            name.classList.add('layer-sender-name');
            parent.appendChild(name);

            var dateWidget = document.createElement('layer-date');
            dateWidget.setAttribute('layer-id', 'date');
            parent.appendChild(dateWidget);

            return parent;
          },
          messageRowFooter: function(messageWidget) {
            var status = document.createElement('layer-message-status');
            status.setAttribute('layer-id', 'status');
            return status;
          },
        }
      }
    }
  }
});