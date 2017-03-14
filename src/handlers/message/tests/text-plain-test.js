describe("Text Plain Handler", function() {

  var client, message, textHandler, el;

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
    client._clientAuthenticated();
    var conversation = client.createConversation({
      participants: ['layer:///identities/FrodoTheDodo', 'layer:///identities/SaurumanTheMildlyAged']
    });
    message = conversation.createMessage({parts: [{mimeType: "text/plain", body: "howdy ho"}]});

    if (layerUI.components['layer-conversation-panel'] && !layerUI.components['layer-conversation-panel'].classDef) layerUI.init({layer: layer});

    textHandler = layerUI.handlers.filter(function(handler) {
      return handler.tagName === 'layer-message-text-plain';
    })[0];

    layerUI.registerTextHandler({
      name: 'test1',
      order: 200,
      handler: function(textData, message) {
        textData.text += ", test1";
        textData.afterText.push("test1");
      }
    });

    layerUI.registerTextHandler({
      name: 'test2',
      order: 100,
      handler: function(textData, message) {
        textData.text += ", test2";
        textData.afterText.push("test2");
      }
    });

    layerUI.registerTextHandler({
      name: 'test3',
      handler: function(textData, message) {
        textData.text += ", test3";
        textData.afterText.push("test3");
      }
    });

    layerUI.registerTextHandler({
      name: 'test4',
      order: 400,
      handler: function(textData, message) {
        textData.text += ", test4";
        textData.afterText.push("test4");
      }
    });

    layerUI.registerTextHandler({
      name: 'test5',
      requiresEnable: true,
      order: 500,
      handler: function(textData, message) {
        textData.text += ", test5";
        textData.afterText.push("test5");
      }
    });

    el = document.createElement('layer-message-text-plain');

    layer.Util.defer.flush();
    jasmine.clock().tick(500);
  });

  afterEach(function() {
    jasmine.clock().uninstall();
    el.onDestroy();
    client.destroy();
  });

  describe("The _setupOrderedHandlers() method", function() {
    it("Should return an array of functions", function() {
      layerUI.textHandlersOrdered = null;
      el._setupOrderedHandlers();
      expect(layerUI.textHandlersOrdered.length > 0).toBe(true);
      layerUI.textHandlersOrdered.forEach(function(handler) {
        expect(handler).toEqual(jasmine.any(Function));
      });
    });

    it("Should order the functions", function() {
      layerUI.textHandlersOrdered = null;
      el._setupOrderedHandlers();
      var data = {text: "", afterText: []};
      layerUI.textHandlersOrdered.forEach(function(handler) {
        handler(data);
      });
      expect(data).toEqual({
        text: ", test2, test1, test4, test3",
        afterText: ["test2", "test1", "test4", "test3"]
      });
    });
  });



  describe("The onRender() method", function() {
    it("Should correctly escape html tags", function() {
      el.properties.message = message;
      message.parts[0].body = "<hey></ho>";
      el.onRender();
      expect(el.innerHTML).toMatch(/^&lt;hey&gt;&lt;\/ho&gt;/);
    });

    it("Should call each handler", function() {
      el.properties.message = message;
      message.parts[0].body = "heyho";
      el.onRender();
      expect(el.innerHTML).toMatch(/^heyho, test2, test1, test4, test3/);
    });

    it("Should carry modifications to the text property through each handler", function() {
      layerUI.textHandlersOrdered = null;
      el._setupOrderedHandlers();
      layerUI.textHandlersOrdered[2] = jasmine.createSpy('handler').and.callFake(layerUI.textHandlersOrdered[2]);

      el.message = message;
      expect(layerUI.textHandlersOrdered[2]).toHaveBeenCalledWith(jasmine.objectContaining({
        text: message.parts[0].body + ", test2, test1, test4, test3"
      }), jasmine.any(layer.Message));
    });

    it("Should carry modifications to the afterText property through each handler", function() {
      layerUI.textHandlersOrdered = null;
      el._setupOrderedHandlers();
      layerUI.textHandlersOrdered[2] = jasmine.createSpy('handler').and.callFake(layerUI.textHandlersOrdered[2]);

      el.message = message;
      expect(layerUI.textHandlersOrdered[2]).toHaveBeenCalledWith(jasmine.objectContaining({
        afterText: ["test2", "test1", "test4", "test3"]
      }), jasmine.any(layer.Message));
    });

    it("Should render the text", function() {
      el.properties.message = message;
      message.parts[0].body = "heyho";
      el.onRender();
      expect(el.innerHTML).toMatch(/^heyho, test2, test1, test4, test3/);
    });

    it("Should render the afterText", function() {
      el.properties.message = message;
      el.onRender();
      var afterTextNodes = el.querySelectorAllArray('.layer-message-text-plain-after-text');
      expect(afterTextNodes.length).toEqual(4);
      expect(afterTextNodes[0].innerHTML).toEqual("test2");
      expect(afterTextNodes[1].innerHTML).toEqual("test1");
      expect(afterTextNodes[2].innerHTML).toEqual("test4");
      expect(afterTextNodes[3].innerHTML).toEqual("test3");
    });
  });
});