# Layer UI for Web Change Log

## 0.9.6

* Build Fixes
  * Fixes the missing `layerUI.registerComponent` method
  * Fixes missing `themes/build` folder in `npm` distribution
  * Fixes missing `build/*.js` folder in `npm` distribution
* Composer Enhancements
  * Adds a Send button
  * Adds a `ConversationPanel.send()` method to let apps send the contents of the Composer.
  * Updates design of the File Upload button
  * Adds `onComposerChangeValue` property / `layer-composer-change-value` event to the `ConversationPanel` widget.
  * Triggers a `layer-composer-change-value` event when the input changes; this helps Flux architectures to put the current value into their state.
* Adds Message parameter to the registerTextHandler callback arguments
* Fixes backbone adapter; which had errors from the introduction of ES6 syntax
* Fixes to `emptyMessageListNode` to handle rerendering better
* Theming
  * Moves most of the CSS for Layer Avatars from the template to the theme
  * Some cleanup and reworking of themes and theme variables

## 0.9.5

* Adds `composePlaceholder` property to `<layer-conversation-panel>` to control the composer's placeholder property
* Adds `emptyMessageListNode` property to `<layer-conversation-panel>` to render custom dom when the current conversation has no messages
* Theme updates
* Private properties/methods now use `_`
* Fixes '<layer-conversation-panel/>' handling of `conversationId` for unauthenticated client
* Fixes setter usage of `newValue`, `oldValue` in various setters.
* Removes (for now) `listWidth` and `listHeight` properties that are passed to List Items to help optimize rendering.
  Switches to CSS based resizing.  Primarily for Images.  See instaed `LayerUI.settings.maxSizes`.
* Fixes issue in `DragAndDropFileWatcher` that caused compiler to miscompile

## 0.9.4

* Fixes bug using the appId passed into `layerUI.init()`
* Full es6 conversation, babel compile, and eslintification of code base
* Adds verification that appId refers to a Client
* Adds a Date Separator component
* Now uses `!conversation.lastMessage.isRead` instead of `conversation.unreadCount` for flagging a conversation as unread
* Refactoring of method and property names to underscore prefix private names
* JSDoc cleanup

## 0.9.1, 0.9.2, 0.9.3

* npm unpublish is a problem

## 0.9.0

* Early Beta Released!
* Updated Changelog!
