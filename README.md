# Layer UI for Web

The Layer UI for Web provides a library of widgets to simplify adding chat capabilities into your application.

It is implemented using the [Webcomponents Polyfill](https://github.com/WebComponents/webcomponentsjs); in particular, this project uses the "light" version of the polyfill which means we do not use Shadow Dom.

## Why use Layer UI?

1. It handles a lot of capabilities for you:
  * Sends read receipts on any message that has scrolled into view, and remained visible for 2.5s
  * Sends typing indicators to other participants
  * Renders typing indicators from other participants
  * Pages your queries as the user scrolls
  * Handles a variety of common text processing tasks (emoticons for example), and provides plugins for adding more
  * Handles a variety of Message Types and provides plugins for adding more
2. It is highly customizable
  * You may replace a stylesheet for a given widget with your own stylesheet
  * You may replace the HTML Template for a given widget with your own template
  * You may replace an entire widget class with your own definition of that class

You can build all these things on your own using only [Layer WebSDK](https://github.com/layerhq/layer-websdk); but that shifts a lot more development and maintenance onto you.

## Beta Release

This is a Beta Release.  We welcome feedback, and look forwards to working with customers who have issues.

Feedback can be sent via https://github.com/layerhq/layer-ui-web/issues

## Installation

Layer UI for Web depends upon the [Layer WebSDK](https://github.com/layerhq/layer-websdk), and provides an `init` method for providing a Layer Client,
as well as access to the WebSDK library itself.  How to use this depends on your installation method.

### CDN


```html
<script src='https://cdn.layer.com/sdk/3.0/layer-websdk.js'></script>
<script src='https://cdn.layer.com/ui/0.9/layer-ui-web.js'></script>
<link rel='stylesheet' href='https://cdn.layer.com/ui/0.9/themes/basic-bubbles.css' />
<script>
window.layerUI.init({
  layer: window.layer,
  appId: 'layer:///apps/staging/UUID'
});
</script>
```

Alternatively, a separate theme and templates can be loaded using:

```html
<link rel='stylesheet' href='https://cdn.layer.com/ui/0.9/themes/basic-group.css' />
<link rel='import' href="https://cdn.layer.com/ui/0.9/themes/basic-group-templates.html">
```

More information on creating/customizing themes is in the [Themes](#themes) section.

### NPM

```console
npm install layer-websdk layer-ui-web --save
```

```javascript
var layer = require('layer-websdk');
var layerUI = require('layer-ui-web');
layerUI.init({
  layer: layer,
  appId: 'layer:///apps/staging/UUID'
});
```

```html
<link rel='stylesheet' href='node_modules/layer-ui-web/themes/build/basic-group.css' />
<link rel='import' href="node_modules/layer-ui-web/themes/build/basic-group-templates.html">
```

Note that you can create a custom build that does not compile in all components; this would replace use of the index.js file in this repository with your own:

```javascript
// Load the polyfill
require('webcomponents.js/webcomponents-lite.js');

// Register the components we want
require("layer-ui-web/lib/components/conversation-panel/layer-compose-button-panel/layer-compose-button-panel");
require("layer-ui-web/lib/components/conversation-panel/layer-composer/layer-composer");
require("layer-ui-web/lib/components/conversation-panel/layer-conversation/layer-conversation");
require("layer-ui-web/lib/components/conversation-panel/layer-message-item/layer-message-item");
require("layer-ui-web/lib/components/conversation-panel/layer-message-list/layer-message-list");
require("layer-ui-web/lib/components/conversation-panel/layer-typing-indicator/layer-typing-indicator");
require("layer-ui-web/lib/components/misc/layer-avatar/layer-avatar");
require("layer-ui-web/lib/components/misc/layer-date/layer-date");
require("layer-ui-web/lib/components/misc/layer-delete/layer-delete");
require("layer-ui-web/lib/components/misc/layer-message-status/layer-message-status");
require("layer-ui-web/lib/handlers/messages/layer-message-image");
require("layer-ui-web/lib/handlers/messages/layer-message-text-plain");
require("layer-ui-web/lib/handlers/messages/layer-message-unknown");
require("layer-ui-web/lib/handlers/messages/layer-message-video");
require("layer-ui-web/lib/mixins/list-item");
require("layer-ui-web/lib/mixins/list");
require("layer-ui-web/lib/mixins/main-component");
require("layer-ui-web/lib/utils/files");
require("layer-ui-web/lib/utils/is-url");
require("layer-ui-web/lib/utils/sizing");

var layer = require('layer-websdk');
var layerUI = require('layer-ui-web/lib/base');

layerUI.init({
  layer: layer,
  appId: 'layer:///apps/staging/UUID'
});
```

### Install from Github

Clone the repo, install dependencies and build it:

```console
git clone git@github.com:layerhq/layer-ui-web.git
cd layer-ui-web
npm install
grunt
```

```html
<script src='https://cdn.layer.com/sdk/3.0/layer-websdk.js'></script>
<script src='layer-ui-web/build/layer-ui-web.js'></script>
```

## Reference

A full API reference for all widgets can be seen at:

* [Beta API Reference](http://static.layer.com/layer-ui-web-beta/docs/)

## Using the Widget Library

Using the Widget Library is as simple as adding an html tag to your page.  The following would generate a suitable
UI assuming some CSS to size and position the widgets:

```html
<html>
  <head>
    <script src='http://cdn.layer.com/sdk/3.0/layer-websdk.js'></script>
    <script src='https://cdn.layer.com/ui/0.9/layer-ui-web.js'></script>

    <!-- Code for instantiating a layer.Client and authenticating it: -->
    <script src='my-client-initializer.js'></script>
    <script>
      layerUI.init({layer: window.layer, appId: 'layer:///apps/staging/UUID'});
    </script>
  </head>
  <body>
    <layer-user-list></layer-user-list>
    <layer-conversation-list></layer-conversation-list>
    <layer-conversation ></layer-conversation>
  </body>
</html>
```

Using a basic Webcomponent Polyfill and implementation means that you can _also_ create an element simply with:

```javascript
var conversationWidget = document.createElement('layer-conversation');
document.body.appendChild(conversationWidget);
```

## The Widget library

There are many widgets in this framework, but mostly you only need to work with the Main Components; these are high level widgets that wrap and manage a set of subcomponents.  Typically you would not directly interact with the subcomponents.

* `<layer-conversation />`: Manages a message list, a typing indicator panel, and a compose bar for typing a message
  * This could be your entire UI, a single `layer-conversation` widget hardcoded to a single conversation with a customer support user; no other widgets needed.
  * The key property for this widget is `conversationId` (or used as an attribute: `conversation-id`), which lets you configure which Conversation its being used to interact with.
* `<layer-conversation-list />`: Manages a Conversation List
  * Use this present a list of Conversations, and use the `layer-conversation-selected` event to set the `layer-conversation` `conversationId` property to render the selected Conversation.
* `<layer-user-list />`: Manages a User list
  * Use this to present a list of users to create a Conversation with, and when the user is done, you can call `var conversation = myLayerClient.createConversation([list.selectedUsers]); myConversationList.conversationId = conversation.id;`
* `<layer-notifier />`: Creates desktop and toast notifications for new messages

See the [API Documentation](http://static.layer.com/layer-ui-web-beta/docs/) for more information on the parameters of each of these widgets.

## Customizing the Widgets

A primary goal of this library is ease of customization so that both look-and-feel as well as behaviors can match
your design goals.  The main customization mechanisms include:

* Events: listen for events use them to override default handling of events with your custom handling of events
* Themes: select from pre-built themes, or provide your own
* Custom Templates: Change the layout/structure of a widget by providing custom html templates for widgets
* Custom Components: Replace entire widget definitions with your own widget definitions

### Events

Most widgets have some custom events that they generate.  A typical event is typically followed by some default handling:

* User clicks on the Conversation Delete button.  User is asked to confirm deletion using `window.confirm`, and then the Conversation is deleted (or not)
* User clicks to select a Conversation in the `<layer-conversation-list />` and the `selectedConversationId` property value is updated
* User types in a message to send and hits ENTER; and then the Message is sent.

Wherever there is a default behavior baked in, the component will also respond to `evt.preventDefault()`, causing the default behavior NOT to execute.

* This can be used to provide a custom Conversation Delete confirmation... or bypass confirmation or deletion entirely.
* This can be used to proivde a handler to examine the Conversation selected, and decide if selection is enabled and can procede.
* This can be used to do some preprocessing on the Message before it is sent, or to decide that the message should not be sent.

As these are standard DOM events, they bubble up, and can be listened for at whatever parent node is reasonable for the application.

```javascript
document.body.addEventListener('layer-delete-conversation-click', function(evt) {
  var conversation = evt.detail.conversation;

  // If your application wanted to manage a `metadata.delete` property to determine if a user can delete this Conversation,
  // you might then want a custom event handler when the user tries to delete the Conversation that uses that metadata property.
  if (conversation.metadata.deletable === 'true') {
    conversation.delete(layer.Constants.DELETION_MODE.ALL);
  }
  evt.preventDefault();
});
```

A full list of available events for each Main Component can be viewed in the [API Reference](http://static.layer.com/layer-ui-web-beta/docs/).

### Themes

The only styling that should be baked into a widget is the layout.  Generally this does not include margin, padding or border, but does include use of flexbox or other techniques to control where in the widget each node will go with respect to each other node.

That leaves it up to a Theme to control colors, margins, padding and borders, and other effects.

Layer provides themes using [Less](http://lesscss.org/).  If you want to adopt and adjust a theme from this repository, it should be easy to copy a theme, and then use Less to build a `css` file.  You may also generate a `css` file any way that works for your environment.

Within this repo, the themes folder contains a `src` folder with one folder per theme, and a `build` folder that contains the CSS and [Custom Templates](#custom_templates) for each theme.

Each theme folder in `src` consists of:

* A `variables.less` file defining colors used in multiple files
* One `less` file for each widget
* A `theme.less` file to stitch them all together
* Optional [Custom Templates](#custom-templates)

To learn how to theme a component, such as `<layer-avatar />`:

* Open up the theme file for it: `themes/src/basic-bubbles/layer-conversation-item.less` for examples
* Open up the Component Template for it: `src/conversation-list-panel/layer-conversation-item/layer-conversation-item.html` to see the HTML and CSS Classes available for styling

It is not required that each Component have its own CSS or LESS file, but simply an approach we have taken to help developers understand the theme and build their own.

If building themes within this repository, using the grunt build, The Gruntfile.js `less` task will need you to add your theme's folder to the list.


### Custom Templates

Most Components of this library come with a Template, and this Template can be replaced without changing the Component code.  This is useful if you want to style, arrange and layout a component differently from the default, but the basic behaviors remain unchanged.  If you need to change the behaviors, then see [Custom Components](#custom-components).

A basic customization can be shown by customizing the way a Conversation is rendered in the `<layer-conversation-list />`.  Our task: remove `last_message` and the delete button, and put a menu button in its place.

The original template:

```html
<template>
  <style>
  /* original CSS rules */
  </style>
  <div class='layer-list-item' layer-id='innerNode'>
    <layer-avatar layer-id='avatar'></layer-avatar>
    <div class='layer-conversation-item-content'>
      <layer-conversation-title layer-id='title'></layer-conversation-title>
      <layer-conversation-last-message layer-id='lastMessage'></layer-conversation-last-message>
    </div>
    <layer-delete layer-id='delete'></layer-delete>
  </div>
</template>
<script>
  window.layerUI.registerTemplate('layer-conversation-item');
</script>
```

Lets create a new file, called `my-conversation-item.html`:

```html
<template id='my-conversation-item'>
  <style>
  /* your CSS rules */
  </style>
  <div class='layer-list-item' layer-id='innerNode'>
    <layer-avatar layer-id='avatar'></layer-avatar>
    <div class='layer-conversation-item-content'>
      <div class='layer-conversation-item-title' layer-id='title'></div>
    </div>
    <span class='custom-conversation-item-menu' layer-id='menu'>Menu</span>
  </div>
</template>
<script>
  // Or just document.getElementById if this template is embedded in your index.html file
  // TODO: See slacklike theme's use of `null`
  window.layerUI.registerTemplate('layer-conversation-item');
</script>
```

> Note: if you are using a template file with multiple templates, change the `registerTemplate` call to:

```javascript
var template = document._currentScript.ownerDocument.getElementById('my-conversation-item');
window.layerUI.registerTemplate('layer-conversation-item', template);
```

Lets break this down a bit:

* This template is given an ID; this is not required, but it does allow you to create a single file with all of your templates and then easily identify them.
* List Item templates expect to have an outer node `<div class='layer-list-item' layer-id='innerNode'>`; this should be maintained in any template you make for any type of List Item.
* The `layer-id` attribute allows each widget to find key named components without having to query its children to find a child.  By having `layer-id="title"`, we have told the widget to setup `widget.nodes.title` to access the `layer-conversation-item-title` node.  By adding `layer-id='menu'` we have made it so we can write `widget.nodes.menu` to access our new button.
  * Building a template requires you to know what `layer-id` names the widget expects to have available. Most widgets will test for their existence before using them, but you must insure that required ones have been defined in your html file.
* Each template within the file has its own `<styles/>` section
* As we do NOT at this time use Shadow DOM, you should prefix all of your css rules with the component name.  So if your targeting `.custom-conversation-item-menu` in your rule, it should be `layer-conversation-item .custom-conversation-item-menu` in your rule.
* This example replaces the template but NOT the component.  Adding a custom component would be more elegant for handling a Menu Button, instead, one must wire up event listeners for onClick events on the buttons.
* A template allows us to customize layout, but for a task such as adding an unread badge count into the dom, the Component would need javascript that knows to set that value for that node... so a Custom Component would then be needed.

#### Customizing Components with Multiple Templates

A common customization task is to customize the templates for how a Message is rendered.

The `<layer-message-item />` is a Component that uses two templates:

* `src/conversation-panel/layer-message-item/layer-message-item-received.html`: Renders Messages sent by other users
* `src/conversation-panel/layer-message-item/layer-message-item-sent.html`: Renders Messages sent by the current user

The default design for these components allows us to differentiate between these two types of messages in the following ways:

* Received items have Avatar, name and timestamp on the left, message body on the right; Sent items reverse this order
* Only sent items have a Delete button
* Only sent items display a `pending/sent/read status`

Suppose we want to customize messages-received:

```html
<template id='my-messages-received'>
  <style>
  /* your CSS rules */
  </style>
  <div class='layer-list-item' layer-id='innerNode'>
    <div class='layer-list-item-container'>
      <layer-avatar layer-id='avatar'></layer-avatar>
      <div class='layer-message-item-main'>
        <div class='layer-message-item-content' layer-id='content'></div>
      </div>
    </div>
    <div class='layer-sender-info'>
      <div class='layer-sender-name' layer-id='sender'></div>
      <layer-date layer-id='date'></layer-date>
    </div>
  </div>
</template>
<script>
  var template = document._currentScript.ownerDocument.getElementById('my-messages-received');

  // Register this template for use with received messages
  window.layerUI.registerTemplate('layer-conversation-item', template, 'layer-message-item-received');

  // The same template could be registered for use on sent messages as well:
  window.layerUI.registerTemplate('layer-conversation-item', template, 'layer-message-item-sent');
</script>
```

* This template is given an ID; this is not required, but it does allow you to create a single file with all of your templates and then easily identify them.  If you decided to go with one file per template, you can pass `null` instead of a `template`.
* The third argument identifies what the template will be used for.  There are two supported template names for `<layer-message-item />`: `layer-message-item-received` and `layer-message-item-sent`.


### Custom Components

There are two ways to provide a custom component:

1. Load an existing build but tell it to ignore the built-in definition for a component and use your custom component definition instead
2. Create a custom build that includes just the components you want

Most developers we expect to use the simpler path.  Lets say we want to replace `<layer-avatar />` with an entirely different way of presenting and interacting with the Avatar.

#### Existing build

Tell the build to NOT register the built-in definition of `<layer-avatar />` within the `init()` method:

```javascript
layerUI.init({
  layer: window.layer,
  appId:  'layer:///apps/staging/UUID',
  customComponents: ['layer-avatar']
});
```

#### Custom build

Create your own `layer-avatar`.  This can be loaded before or after loading this library.  If you want to use this library to help create your component, then after is recommended.  If you want to use some other JS framework or no framework at all to build your component, your component should still work, as long as you still register `layer-avatar` as your Tag Name.  This example will use this framework to register your component.

Step 1: In your HTML file, load your custom component:

```html
<link rel="import" href="my-layer-avatar.html">
```

Step 2: Define your component in `my-layer-avatar.html` (or any name you choose).  Note that the registerComponent is documented extensively at [API Reference](http://static.layer.com/layer-ui-web-beta/docs/#!/api/layerUI.components.Component).

```html
<template>
  <style>
    layer-avatar {
      border: solid 1px #ccc;
      padding: 5px 8px;
      height: 1.3em;
      border-radius: 4px;
      box-shadow: 2px 2px 6px #ccc;
      cursor: pointer;
    }
    layer-avatar:hover {
      box-shadow: 2px 2px 3px #ccc;
    }
  </style>
  <div class='name' layer-id='myname'></div>
  <button class='zoom' layer-id='mybutton'>More Info</button>
</template>
<script>
layerUI.registerComponent('layer-avatar', {
  properties: {
    // Avatar takes an array of Users as its key property. Before replacing a component you need to know what properties will be passed to it
    // from its parent components.
    users: {
      set: function(value) {
        this.renderUsers();
      }
    }
  },
  methods: {
    // This method is called by the constructor
    created: function() {
      // the nodes object is setup using the layer-id attribute
      this.nodes.mybutton.addEventListener('click', this.onClick.bind(this));
    },

    // Called when the user clicks the button
    onClick: function() {
      var user = this.users[0].toObject();
      var text = '';
      Object.keys(user).forEach(function(keyName) {
        text += keyName + ': ' + user[keyName] + '\n';
      });

      // Show an alert with all known info about this user.  OK, a dialog Would be nicer here...
      alert(text);
    },

    // Called any time the `users` is set (should only happen once in a Message Item, but many times for a Conversation Item
    renderUsers: function() {
      var user = this.props.users[0];
      if (user) {
        this.nodes.myname.innerHTML = user.firstName || user.displayName.replace(/\S.*$/, '');
      }
    }
  }
}, true);

// Initialize the template for this component. See examples elsewhere for full registerTemplate usage.
layerUI.registerTemplate('layer-avatar');
</script>
```

## Handling custom MIME Types

Each `<layer-message-item />` renders its message contents to `this.nodes.content`; it does this by finding a suitable subcomponent capable of rendering that type of Message.  A suitable subcomponent is found by iterating over all registered handlers for one that is willing to handle the message given its set of MIME Types. Some default handlers come with this framework for rendering `text/plain` messages, and images that are sent alone or via the Atlas 3-message-part images.  You can register a custom handler as easily as:

```javascript
layerUI.registerMessageHandler({
  tagName: 'text-mountain-part',
  label: 'Mountain received',
  handlesMessage: function(message) {
    return message.parts.length === 1 && message.parts[0].mimeType === 'text/mountain';
  }
});
```

The call has the following properties:

* `tagName`: HTML component name to create for messages matching this handler; in this case: <text-mountain-part />
* `label`: Label to use when there isn't space to render the full content
* `handlesMessage`: Returns true/false to indicate it knows how to render this message.

After registering the above handler, for any Message that passes the `handlesMessage` test, the following call will be made:

```javascript
var messageHandler = document.createElement('text-mountain-part');
messageHandler.message = message;
this.nodes.content.appendChild(messageHandler);
```

For the above code to work, you must have registered a tag name of `text-mountain-part`, which you can do using any Webcomponents framework.  This example uses this framework:

```javascript
layerUI.registerComponent('text-mountain-part', {
  properties: {
    message: {
      set: function(value){
        this.props.mountain = value.parts[0].body;
        this.render();
      }
    }
  },
  methods: {
    created: function() {
    },
    render: function() {
      this.innerHTML = 'Mountains ' + this.props.mountain + ' are taller than Plains';
    }
  }
});
```

## Custom Processing of Text

There is a lot processing that can be done to text.  This framework ships with some of these; all of these are pre-enabled:

* Turning emojis into images
* Turning URLs to images into actual images
* Turning Youtube video links into Youtube Video Player
* Rendering urls as hyperlinked urls

There are two types of configuration you may want to do with text processing:

1. Select handlers other than the set that has been preselected for you
2. Defining new text processors

### Selecting default handlers

If you don't like the default set of handlers being used for your app (perhaps rendering of youtube videos is distracting for your users), you can name which handlers are used in your `init()` call:

```javascript
layerUI.init({
  layer: window.layer,
  appId: 'layer:///apps/staging/UUID',
  textHandlers: ['emoji-handler', 'autolinker']
});
```

This specifies that emojis and linked url processing will be done, but that other text processors will not be used.

You can find the available text processors in `src/handlers/text`, and the names used to enable them should match the file name.

### Defining new handlers

Any text processor you register via `layerUI.registerTextHandler` will be enabled regardless of what parameters are used in the `init()` method.

A text processor can affect the result in two ways:

1. It can update the text of the message (i.e. replace a url with an anchor tag)
2. It can specify something to be rendered after the Message (i.e. an image, video, etc...)

#### Updating the message text

To illustrate the first, lets suppose we wanted to replace the word Layer with the Layer Logo everywhere it appears within a Message:

```javascript
window.layerUI.registerTextHandler({
  name: 'layer-logo-replacer',
  order: 300,
  handler: function(textData) {
    textData.text = textData.text.replace(/\blayer\b/gi, ' <img src="https://cdn.layer.com/web/logo-black.svg" /> ');
  }
});
```

This updates the textData object's text property which is the text that will be rendered after all text processors have updated the property.

#### Appending new content to show after the text

This youtube parser pushes its html into the `textData.afterText` array; it will be rendered after the text portion of the message.

```javascript
window.layerUI.registerTextHandler({
  name: 'my-youtube-processor',
  order: 300,
  handler: function(textData) {
    var matches = textData.text.match(/https:\/\/youtu\.be\/([a-zA-Z0-9\-]+)/g) || [];
    matches.forEach(function(match) {
      var videoId;
      var matches = match.match(/https:\/\/youtu\.be\/(.*)$/);
      if (matches) videoId = matches[1];
      if (videoId) {
        textData.afterText.push('<iframe width="560" height="315" src="https://www.youtube.com/embed/' + videoId + '" frameborder="0" allowfullscreen></iframe>');
      }
    });
  }
});
```

## Design Philosophy

1. Main Components which may get their properties set via attributes must have a means of accepting complex properties as strings.  This is done for example by accepting a `query-id` rather than a `query`, or an `app-id` instead of a `client`.  Booleans need to accept the string "false" and "0" as `false`.  Strings representing strings may need to be *evaled*.
2. Subcomponents will get their properties via DOM  manipulation, and not via attributes, and therefore do not need to expose properties such as `query-id` when `query` will suffice.
3. There is a trade-off between performance and customizability when defining a tiny subcomponent such as `<layer-date />` that must be created and rendered repeatedly.  But by abstracting date into its own widget, a developer can easily replace `<layer-date />` with a custom component without any changes to the parent components.  Customizability as long as performance doesn't cause noticable problems is worth pursuing.

## Future Work

* This project does not use Shadow Dom due to performance implications of the Shadow Dom polyfill.  The Shadow Dom API provides an ideal
mechanism for passing subcomponents such as buttons for the composer, and other custom elements as inputs.  Currently, this can only be done
via dom manipulation; even in the case of `ConversationPanel.composeButtons` one must dom create elements,
put them in an array and then set `composeButtons` to refer to them.  This is especially bad in React.  A better mechanism should be discussed,
and implemented.
* Inclusion of standard dom nodes that go between messages, such as Date headers, Headers indicating "read up to here", etc...  For now we just include the capability to build your own.
* Border radius on the you-tube embedded iframe is pretty sketchy during initialization of the Player
