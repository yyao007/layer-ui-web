describe("Image Text Handler", function() {
  var handler;
  beforeEach(function() {
    if (layerUI.components['layer-conversation-panel'] && !layerUI.components['layer-conversation-panel'].classDef) layerUI.init({});
    handler = layerUI.textHandlers.images.handler;
  });

  it("Should replace any occurance of image url with an image tag", function() {
    var textData = {
      text: "hello http://somecrappyimageprovider.com/crap.png there",
      afterText: []
    };
    handler(textData);
    expect(textData.text).toEqual("hello http://somecrappyimageprovider.com/crap.png there");
    expect(textData.afterText).toEqual(["<img class=\"layer-parsed-image\" src=\"http://somecrappyimageprovider.com/crap.png\"></img>"]);
  });
});
