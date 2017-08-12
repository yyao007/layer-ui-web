/*
  TextModel = client.getCardModelClassForMimeType('application/vnd.layer.card.text+json')
  CarouselModel = client.getCardModelClassForMimeType('application/vnd.layer.card.carousel+json')
  model = new CarouselModel({
    items: [
      new TextModel({text: "Carousel item 1"}),
      new TextModel({text: "Carousel item 2"}),
      new TextModel({text: "Carousel item 3"})
    ]
  });
  model.generateMessage($("layer-conversation-view").conversation, message => message.send())


  TextModel = client.getCardModelClassForMimeType('application/vnd.layer.card.text+json')
  CarouselModel = client.getCardModelClassForMimeType('application/vnd.layer.card.carousel+json')
  model = new CarouselModel({
    items: [
      new TextModel({text: "Carousel item 1", title: "Title 1"}),
      new TextModel({text: "Carousel item 2", title: "Title 2"}),
      new TextModel({text: "Carousel item 3", title: "Title 3"}),
      new TextModel({text: "Bacon ipsum dolor amet non in minim, incididunt capicola bresaola brisket exercitation commodo nulla ex chuck dolore beef ribs.  Et beef prosciutto pig pork.  Pancetta pork loin ullamco ea nostrud minim reprehenderit labore kevin, brisket est.  Short ribs nostrud ex, beef ribs dolor tenderloin swine tail.  Minim ut corned beef, prosciutto shoulder ut exercitation pig rump leberkas pork adipisicing.  Eu beef ribs aute meatball.  Pork belly sausage in sirloin excepteur laboris, non est pancetta qui leberkas anim eiusmod spare ribs.", title: "Title 4"}),
      new TextModel({text: "Carousel item 3", title: "Title 5"}),
      new TextModel({text: "Carousel item 3", title: "Title 6"})
    ]
  });
  model.generateMessage($("layer-conversation-view").conversation, message => message.send())

  // Product Carousel:

  ProductModel = client.getCardModelClassForMimeType('application/vnd.layer.card.product+json')
  ImageModel = client.getCardModelClassForMimeType('application/vnd.layer.card.image+json')
  CarouselModel = client.getCardModelClassForMimeType('application/vnd.layer.card.carousel+json')
  model = new CarouselModel({
    items: [
      new ProductModel({
        currency: 'USD',
        detailModel: new ImageModel({previewUrl:"https://farm5.staticflickr.com/4272/34912460025_be2700d3e7_k.jpg"}),
        price: 175,
        quantity: 3,
        title: "A pretty picture 1",
        subtitle: "Prettier than YOU deserve!"
      }),
      new ProductModel({
        currency: 'USD',
        detailModel: new ImageModel({previewUrl:"https://farm5.staticflickr.com/4272/34912460025_be2700d3e7_k.jpg"}),
        price: 175,
        quantity: 3,
        title: "A pretty picture 2",
        subtitle: "Prettier than YOU deserve!"
      }),
      new ProductModel({
        currency: 'USD',
        detailModel: new ImageModel({previewUrl:"https://farm5.staticflickr.com/4272/34912460025_be2700d3e7_k.jpg"}),
        price: 175,
        quantity: 3,
        title: "A pretty picture 3",
        subtitle: "Prettier than YOU deserve!"
      }),
      new ProductModel({
        currency: 'USD',
        detailModel: new ImageModel({previewUrl:"https://farm5.staticflickr.com/4272/34912460025_be2700d3e7_k.jpg"}),
        price: 175,
        quantity: 3,
        title: "A pretty picture 4",
        subtitle: "Prettier than YOU deserve!"
      }),
      new ProductModel({
        currency: 'USD',
        detailModel: new ImageModel({previewUrl:"https://farm5.staticflickr.com/4272/34912460025_be2700d3e7_k.jpg"}),
        price: 175,
        quantity: 3,
        title: "A pretty picture 5",
        subtitle: "Prettier than YOU deserve!"
      }),
      new ProductModel({
        currency: 'USD',
        detailModel: new ImageModel({previewUrl:"https://farm5.staticflickr.com/4272/34912460025_be2700d3e7_k.jpg"}),
        price: 175,
        quantity: 3,
        title: "A pretty picture 6",
        subtitle: "Prettier than YOU deserve!"
      }),
    ]
  }).generateMessage($("layer-conversation-view").conversation, message => message.send())
*/

// m = $("layer-conversation-view").conversation.createMessage({parts: [{mimeType: "application/vnd.layer.card.list+json; role=root; node-id=root", body: '{}'},{mimeType: "application/vnd.layer.card.text+json; role=carousel-item; parent-node-id=root", body: '{"text": "hello world 1"}'},{mimeType: "application/vnd.layer.card.text+json; role=carousel-item; parent-node-id=root", body: '{"text": "hello world 2"}'},{mimeType: "application/vnd.layer.card.text+json; role=carousel-item; parent-node-id=root", body: '{"text": "hello world 3"}'}]})
// {mimeType: "application/vnd.layer.card.image+json; role=carousel-item; parent-node-id=root; node-id=image1", body: '{}'}, {mimeType: 'image/png; parent-node-id=image1; role=preview', body: evt.detail.parts[1].body}
/* message = conversation.createMessage({parts: [
  {
    mimeType: "application/vnd.layer.card.carousel+json; role=root; node-id=root",
    body: '{}'
  },
  {
    mimeType: "application/vnd.layer.card.text+json; role=carousel-item; parent-node-id=root",
    body: '{"text": "hello world 1"}'
  },
  {
    mimeType: "application/vnd.layer.card.text+json; role=carousel-item; parent-node-id=root",
    body: '{"text": "hello world 2"}'
  },
  {
    mimeType: "application/vnd.layer.card.text+json; role=carousel-item; parent-node-id=root",
    body: '{"text": "hello world 3"}'
  }
]});

client.getConversation($("layer-conversation-list").selectedId).createMessage({parts: [
  {
    mimeType: "application/vnd.layer.card.carousel+json; role=root; node-id=root",
    body: '{}'
  },
  {
    mimeType: "application/vnd.layer.card.location+json; role=carousel-item; parent-node-id=root",
    body: '{"latitude": 37.7734858, "longitude": -122.3916087, "title": "Réveille Coffee Co.", "description": "Good coffee, but pricey, and when you hear people say the name, you know that they just reviled the place."}'
  },
  {
    mimeType: "application/vnd.layer.card.location+json; role=carousel-item; parent-node-id=root",
    body: '{"latitude": 37.7755211, "longitude": -122.3933923, "title": "Philz", "description": "Coffee for Philzistines and other caffinated barbarians.  Got to admit though they really philz it up!"}'
  },
  {
    mimeType: "application/vnd.layer.card.location+json; role=carousel-item; parent-node-id=root",
    body: '{"latitude": 37.7787774, "longitude": -122.3939086, "title": "Cento", "description": "Worth every cento.  And make sure to bring a lot of them.  Cause this good brew will take a bucket full of centos in exchange for one tiny little cup."}'
  },
  {
    mimeType: "application/vnd.layer.card.location+json; role=carousel-item; parent-node-id=root",
    body: '{"latitude": 37.7786884, "longitude": -122.3966928, "title": "Starbucks", "description": "Desperate for coffee! No where to turn! Who you gonna call?!? Star Chucks!"}'
  }
]}).send();

client.getConversation($("layer-conversation-list").selectedId).createMessage({parts: [
  {
    mimeType: "application/vnd.layer.card.carousel+json; role=root; node-id=root",
    body: '{}'
  },
  {
    mimeType: "application/vnd.layer.card.buttons+json; node-id=button1; role=carousel-item; parent-node-id=root",
    body: '{"buttons": [{"type": "action", "text": "Write Review", "event": "rateit"}, {"type": "action", "text": "Navigate", "event": "navigate"}]}'
  },
  {
    mimeType: "application/vnd.layer.card.location+json; role=content; parent-node-id=button1",
    body: '{"latitude": 37.7734858, "longitude": -122.3916087, "title": "Réveille Coffee Co.", "description": "Good coffee, but pricey, and when you hear people say the name, you know that they just reviled the place."}'
  },
  {
    mimeType: "application/vnd.layer.card.buttons+json; node-id=button2; role=carousel-item; parent-node-id=root",
    body: '{"buttons": [{"type": "action", "text": "Write Review", "event": "rateit"}, {"type": "action", "text": "Navigate", "event": "navigate"}]}'
  },
  {
    mimeType: "application/vnd.layer.card.location+json; role=content; parent-node-id=button2",
    body: '{"latitude": 37.7755211, "longitude": -122.3933923, "title": "Philz", "description": "Coffee for Philzistines and other caffinated barbarians.  Got to admit though they really philz it up!"}'
  },
  {
    mimeType: "application/vnd.layer.card.buttons+json; node-id=button3; role=carousel-item; parent-node-id=root",
    body: '{"buttons": [{"type": "action", "text": "Write Review", "event": "rateit"}, {"type": "action", "text": "Navigate", "event": "navigate"}]}'
  },
  {
    mimeType: "application/vnd.layer.card.location+json; role=content; parent-node-id=button3",
    body: '{"latitude": 37.7787774, "longitude": -122.3939086, "title": "Cento", "description": "Worth every cento.  And make sure to bring a lot of them.  Cause this good brew will take a bucket full of centos in exchange for one tiny little cup."}'
  },
  {
    mimeType: "application/vnd.layer.card.buttons+json; node-id=button4; role=carousel-item; parent-node-id=root",
    body: '{"buttons": [{"type": "action", "text": "Write Review", "event": "rateit"}, {"type": "action", "text": "Navigate", "event": "navigate"}]}'
  },
  {
    mimeType: "application/vnd.layer.card.location+json; role=content; parent-node-id=button4",
    body: '{"latitude": 37.7786884, "longitude": -122.3966928, "title": "Starbucks", "description": "Desperate for coffee! No where to turn! Who you gonna call?!? Star Chucks!"}'
  },
]}).send();
*/
import CardModel from 'layer-websdk/lib/models/card-model';
import { Client, MessagePart, Util }  from 'layer-websdk';


class CarouselModel extends CardModel {
  _generateParts(callback) {
    const body = this._initBodyWithMetadata(['action']);

    this.part = new layer.MessagePart({
      mimeType: this.constructor.MIMEType,
      body: JSON.stringify(body),
    });
    const rootId = this.part.mimeAttributes['node-id'];

    let asyncCount = 0;
    let parts = [this.part];
    this.items.forEach((item) => {
      this._addModel(item, 'carousel-item', (moreParts) => {
        moreParts.forEach(p => parts.push(p));
        asyncCount++;
        if (asyncCount === this.items.length) {
          callback(parts);
        }
      });
    });
    this.items.forEach(item => item.mergeAction(this.action));
  }

  _parseMessage() {

    // Gather all of the parts that represent a high level list element (ignoring any subparts they may bring with them)
    // Exclucde our main list part that defines the list rather than its list items
    const parts = this.childParts.filter(part => part.mimeAttributes.role === 'carousel-item');
    this.items = parts.map(part => this.getClient().createCardModel(this.message, part));
    this.items.forEach(item => item.mergeAction(this.action));
  }

  __updateAction(newValue) {
    if (this.items) this.items.forEach(item => item.mergeAction(newValue));
  }
}

CarouselModel.prototype.action = null;
CarouselModel.prototype.items = null;

CarouselModel.cardRenderer = 'layer-carousel-card';
CarouselModel.MIMEType = 'application/vnd.layer.card.carousel+json';
MessagePart.TextualMimeTypes.push(CarouselModel.MIMEType);

// Register the Card Model Class with the Client
Client.registerCardModelClass(CarouselModel, "CarouselModel");

module.exports = CarouselModel;

