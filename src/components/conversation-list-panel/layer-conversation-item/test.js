describe('layer-conversation-item', function() {
  var el, testRoot, client, conversation, user;

  afterEach(function() {
    jasmine.clock().uninstall();
  });

  beforeEach(function() {
    jasmine.clock().install();

    client = new layer.Client({
      appId: 'layer:///apps/staging/Fred'
    });
    client.user = new layer.Identity({
      client: client,
      userId: 'FrodoTheDodo',
      displayName: 'Frodo the Dodo',
      id: 'layer:///identities/FrodoTheDodo',
      isFullIdentity: true,
      sessionOwner: true
    });

    user = new layer.Identity({
      client: client,
      userId: 'GandalfTheGruesome',
      displayName: 'Gandalf the Gruesome',
      id: 'layer:///identities/GandalfTheGruesome',
      isFullIdentity: true
    });

    client._clientAuthenticated();


    layerUI.init({layer: layer});
    testRoot = document.createElement('div');
    document.body.appendChild(testRoot);
    el = document.createElement('layer-conversation-item');
    testRoot.appendChild(el);
    conversation = client.createConversation({
      participants: ['layer:///identities/FrodoTheDodo']
    });
  });

  afterEach(function() {
    document.body.removeChild(testRoot);
  });

  describe('The item property', function() {
    it("Should update layer-delete, layer-conversation-last-message and layer-conversation-title", function() {
      var c2 = client.createConversation({
        participants: ['layer:///identities/GolumTheCutie']
      });
      el.item = c2;
      expect(el.nodes.delete.item).toBe(c2);
      expect(el.nodes.lastMessage.item).toBe(c2);
      expect(el.nodes.title.item).toBe(c2);
    });

    it("Should wire up the rerender event", function() {
      spyOn(el, "rerender");
      el.item = conversation;
      el.rerender.calls.reset();
      conversation.trigger('conversations:change', {property: 'unreadCount', oldValue: 5, newValue: 6});
      expect(el.rerender).toHaveBeenCalledWith(jasmine.any(layer.LayerEvent));
    });

    it("Should unwire up the rerender event if prior Conversation", function() {
      spyOn(el, "rerender");
      el.item = conversation;
      el.item = null;
      el.rerender.calls.reset();
      conversation.trigger('conversations:change', {property: 'unreadCount', oldValue: 5, newValue: 6});
      expect(el.rerender).not.toHaveBeenCalled();
    });
  });

  describe("The deleteConversationEnabled property", function() {
    it("Should pass value on to layer-delete", function() {
      el.deleteConversationEnabled = true;
      expect(el.nodes.delete.enabled).toBe(true);

      el.deleteConversationEnabled = false;
      expect(el.nodes.delete.enabled).toBe(false);
    });
  });

  describe("The rerender() method", function() {
    it("Should update layer-conversation-last-message listHeight and width", function(){
      el.item = conversation;
      var lastMessageWidget = el.querySelector('layer-conversation-last-message');
      expect(lastMessageWidget).not.toBe(null);
      expect(lastMessageWidget.listHeight).toEqual(el.listHeight);

      el.listHeight = 80;
      el.listWidth = 65;
      el.rerender();
      expect(lastMessageWidget.listHeight).toEqual(80);
      expect(lastMessageWidget.listWidth).toEqual(65);
    });

    it("Should update layer-avatar users", function() {
      el.item = conversation;
      conversation.addParticipants(['layer:///identities/GandalfTheGruesome']);
      el.rerender();
      expect(el.nodes.avatar.users).toEqual([client.getIdentity('layer:///identities/GandalfTheGruesome')]);
    });

    it("Should update layer-conversation-unread-messages class", function() {
      el.item = conversation;
      conversation.unreadCount = 0;
      el.rerender();
      expect(el.classList.contains('layer-conversation-unread-messages')).toBe(false);

      conversation.unreadCount = 1;
      el.rerender();
      expect(el.classList.contains('layer-conversation-unread-messages')).toBe(true);
    });
  });

  describe("The runFilter() method", function() {
    beforeEach(function() {
      el.item = conversation;
    });
    it("Should add layer-item-filtered if not a match", function() {
      expect(el.classList.contains('layer-item-filtered')).toBe(false);
      el.runFilter('Samwise');
      expect(el.classList.contains('layer-item-filtered')).toBe(true);
    });

    it("Should remove layer-item-filtered if it is a match", function() {
      el.classList.add('layer-item-filtered');
      el.runFilter('Frodo');
      expect(el.classList.contains('layer-item-filtered')).toBe(false);
    });

    it("Should match on substring against metadata.conversationName, displayName, firstName, lastName and emailAddress", function() {
      conversation.setMetadataProperties({conversationName: 'AraAcorn, returning king of squirrels'});
      el.runFilter('araacorn');
      expect(el.classList.contains('layer-item-filtered')).toBe(false);
      el.runFilter('WringRaith');
      expect(el.classList.contains('layer-item-filtered')).toBe(true);

      client.user.firstName = 'Mojo';
      el.runFilter('MoJo');
      expect(el.classList.contains('layer-item-filtered')).toBe(false);
      el.runFilter('POJO');
      expect(el.classList.contains('layer-item-filtered')).toBe(true);

      client.user.lastName = 'pojO';
      el.runFilter('POJO');
      expect(el.classList.contains('layer-item-filtered')).toBe(false);
      el.runFilter('pojo@layer');
      expect(el.classList.contains('layer-item-filtered')).toBe(true);

      client.user.emailAddress = 'pojo@layer.com';
      el.runFilter('pojo@layer');
      expect(el.classList.contains('layer-item-filtered')).toBe(false);
    });

    it("Should match on RegEx against displayName, firstName, lastName and emailAddress", function() {
      conversation.setMetadataProperties({conversationName: 'AraAcorn, returning king of squirrels'});
      el.runFilter(/Araacorn/);
      expect(el.classList.contains('layer-item-filtered')).toBe(true);
      el.runFilter(/AraAcorn/i);
      expect(el.classList.contains('layer-item-filtered')).toBe(false);
      el.runFilter(/moJo/i);
      expect(el.classList.contains('layer-item-filtered')).toBe(true);

      client.user.firstName = 'Mojo';
      el.runFilter(/moJo/i);
      expect(el.classList.contains('layer-item-filtered')).toBe(false);
      el.runFilter(/POJO/i);
      expect(el.classList.contains('layer-item-filtered')).toBe(true);

      client.user.lastName = 'pojO';
      el.runFilter(/POJO/i);
      expect(el.classList.contains('layer-item-filtered')).toBe(false);
      el.runFilter(/pojo@layer/);
      expect(el.classList.contains('layer-item-filtered')).toBe(true);

      client.user.emailAddress = 'pojo@layer.com';
      el.runFilter(/pojo@layer/);
      expect(el.classList.contains('layer-item-filtered')).toBe(false);
    });

    it("Should match on Callback against displayName, firstName, lastName and emailAddress", function() {
      conversation.setMetadataProperties({conversationName: 'AraAcorn, returning king of squirrels'});

      function test(conversation) {
        return conversation.metadata.conversationName == 'AraAcorn, returning king of squirrels';
      }
      el.runFilter(test);
      expect(el.classList.contains('layer-item-filtered')).toBe(false);
      conversation.setMetadataProperties({conversationName: 'Frodo ala Modo'});
      el.runFilter(test);
      expect(el.classList.contains('layer-item-filtered')).toBe(true);
    });

    it("Should match if no filter", function() {
      el.runFilter(null);
      expect(el.classList.contains('layer-item-filtered')).toBe(false);
    });
  });
});