/**
 * The Layer Notifier widget can show Desktop Notifications when your app is in the background,
 * and Toast notifications when your app is in the foreground.
 *
 * You can customize the toast styling and layout by providing a custom Template.
 *
 * Add this to your page as:
 *
 * ```
 * <layer-notifier notify-in-foreground="toast" icon-url="https://myco.com/myimage.png"></layer-notifier>
 * ```
 *
 * Or via DOM Manipulation:
 *
 * ```javascript
 * var notifier = document.createElement('layer-notifier');
 * notifier.notifyInForeground = 'toast';
 * notifier.iconUrl = 'https://myco.com/myimage.png';
 * ```
 *
 * Note that you typically would not want to have a notification if your app is in the foreground,
 * and the new message is already visible to the user.  However,
 * this widget does not know what conversation is currently visible, so its up to you to manage this.
 *
 * Provide a layerUI.components.misc.Notifier.onMessageNotification handler to perform tests to see
 * if notifications are required, and then call `evt.preventDefault()` to prevent the notification from showing.
 *
 * @class layerUI.components.misc.Notifier
 * @extends layerUI.components.Component
 */
var Notify = require('notifyjs').default;
var LUIComponent = require('../../../components/component');
LUIComponent('layer-notifier', {
  mixins: [require('../../../mixins/main-component')],

  /**
   * Before showing any notification, this event will be triggered.
   *
   * Call `evt.preventDefault()`
   * to prevent the notification from being rendered.  Not calling `preventDefault()` allows the notification to occur.
   * This lets you customize behaviors on a per-notification basis.
   *
   * ```
   * document.body.addEventListener('layer-message-notification', function(evt) {
   *   if (evt.detail.message.conversationId === myOpenConversationId) {
   *     evt.preventDefault();
   *   }
   * ```
   *
   * @event layer-message-notification
   * @param {CustomEvent} evt
   * @param {Object} evt.detail
   * @param {layer.Message} evt.detail.message  The Message that has triggered this notification
   * @param {Boolean} evt.detail.isBackground   Is the app running in the background
   * @param {String} evt.detail.type            What type of notification has been configured for this event ("desktop" or "toast")
   */
  /**
   * Before showing any notification, this event will be triggered.
   *
   * Call `evt.preventDefault()`
   * to prevent the notification from being rendered.  Not calling `preventDefault()` allows the notification to occur.
   * This lets you customize behaviors on a per-notification basis.
   *
   * ```
   * notifier.onMessageNotification = function(evt) {
   *   if (evt.detail.message.conversationId === myOpenConversationId && !evt.detail.isBackground) {
   *     evt.preventDefault();
   *   }
   * ```
   *
   * @property {Function} onMessageNotification
   * @param {CustomEvent} evt
   * @param {Object} evt.detail
   * @param {layer.Message} evt.detail.message  The Message that has triggered this notification
   * @param {Boolean} evt.detail.isBackground   Is the app running in the background
   * @param {String} evt.detail.type            What type of notification has been configured for this event ("desktop" or "toast")
   */

  /**
   * Use this event to handle the user clicking on the notification.
   *
   * ```
   * document.body.addEventListener('layer-notification-click', function(evt) {
   *   if (evt.detail.message.conversationId !== myOpenConversationId && !evt.detail.isBackground) {
   *     // Open the Conversation:
   *     document.querySelector('layer-conversation').conversationId = evt.detail.message.conversationId;
   *   }
   * });
   * ```
   *
   * @event layer-notification-click
   * @param {CustomEvent} evt
   * @param {Object} evt.detail
   * @param {layer.Message} evt.detail.message   The Message that has triggered this notification
   */

  /**
   * Use this event to handle the user clicking on the notification.
   *
   * ```
   * notifier.onNotificationClick = function(evt) {
   *   if (evt.detail.message.conversationId !== myOpenConversationId) {
   *     // Open the Conversation:
   *     document.querySelector('layer-conversation').conversationId = evt.detail.message.conversationId;
   *   }
   * };
   * ```
   *
   * @property {Function} onNotificationClick
   * @param {CustomEvent} evt
   * @param {Object} evt.detail
   * @param {layer.Message} evt.detail.message   The Message that has triggered this notification
   */

  events: ['layer-message-notification', 'layer-notification-click'],
  properties: {
    client: {
      set: function(value) {
        value.on('messages:notify', this.notify.bind(this));
      }
    },

    /**
     * When your app is in the background, how should it show notifications of new Messages.
     *
     * Possible values:
     *
     * * desktop: Use desktop notifications when app is in the background
     * * toast: Use in-page toast notifications when app is in the background
     * * none or "": No notifications
     *
     * @property {String} [notifyInBackground=desktop]
     */
    notifyInBackground: {
      value: 'desktop',
      set: function(value) {
        if (value === 'desktop' && window.Notification) {
          Notify.requestPermission(this.onPermissionGranted.bind(this));
        }
      }
    },

    /**
     * When your app is in the foreground, how should it show notifications of new Messages.
     *
     * Possible values:
     *
     * * desktop: Use desktop notifications when app is in the foreground
     * * toast: Use in-page toast notifications when app is in the foreground
     * * none or "": No notifications
     *
     * @property {String} [notifyInForeground=none]
     */
    notifyInForeground: {
      value: 'none',
      set: function(value) {
        if (value === 'desktop' && window.Notification) {
          Notify.requestPermission(this.onPermissionGranted.bind(this));
        }
      }
    },

    /**
     * If the user hasn't granted priveledges to use desktop notifications, they won't be shown.
     *
     * @property {Boolean} [userEnabledDesktopNotifications=false]
     * @readonly
     */
    userEnabledDesktopNotifications: {
      value: false
    },

    /**
     * To provide a custom icon to render within notifications, put the URL here.
     *
     * Leave this blank to use the sender's `avatarUrl` as the notification icon.
     *
     * @property {String} [iconUrl=]
     */
    iconUrl: {
      value: ''
    },

    /**
     * Number of seconds the notification will stay before its automatically dismissed.
     *
     * @property {Number} [timeoutSeconds=30]
     */
    timeoutSeconds: {
      value: 30
    },

    /**
     * Timeout ID for clearing the toast notification
     *
     * @private
     * @property {Number}
     */
    toastTimeout: {
      value: 0
    }
  },
  methods: {

    /**
     * Constructor.
     *
     * @method created
     * @private
     */
    created: function() {
      this.addEventListener('click', this.clickToast.bind(this));
      this.addEventListener("transitionend", this.afterTransition.bind(this), true);
    },

    afterTransition: function() {
      this.classList.remove('layer-notifier-toast-fade');
    },

    /**
     * Callback indicating that the user has granted permissions for desktop notifications.
     *
     * @method onPermissionGranted
     * @private
     */
    onPermissionGranted: function() {
      this.props.userEnabledDesktopNotifications = true;
    },

    /**
     * Notify the user of a new messages.
     *
     * Determines if foreground or background notifications are being used,
     * and what type of notification is preferred for that state.
     *
     * Triggers an event so the app can confirm/block the notification.
     *
     * @method notify
     * @param {layer.LayerEvent} evt
     * @private
     */
    notify: function(evt) {
      var isBackground = window.layerUI.isInBackground();
      var notificationType = isBackground ? this.notifyInBackground : this.notifyInForeground;
      if (notificationType && notificationType !== 'none') {
        if (this.trigger('layer-message-notification', {
          message: evt.message,
          isBackground: isBackground,
          type: notificationType
        })) {
          if (notificationType === 'desktop' && this.props.userEnabledDesktopNotifications) {
            this.desktopNotify(evt.message);
          } else if (notificationType === 'toast') {
            this.toastNotify(evt.message);
          }
        }
      }
    },

    /**
     * Show a desktop notification.
     *
     * @method
     * @private
     */
    desktopNotify: function(message) {
      try {
        var text = message.getText();
        if (this.props.desktopNotify) this.closeDesktopNotify();

        this.props.desktopMessage = message;
        this.props.desktopNotify = new Notify('Message from ' + message.sender.displayName, {
          icon: this.iconUrl || message.sender.avatarUrl,
          timeout: this.timeoutSeconds,
          body: text || 'New file received',
          tag: message.conversationId || 'announcement',
          notifyClick: function() {
            window.focus();
            this.trigger('layer-notification-click', {message: message});
          }.bind(this)
        });
        this.props.desktopNotify.show();

        message.on('messages:change', function(evt) {
          if (message.isRead) {
            this.closeDesktopNotify();
          }
        }, this);
      } catch(e) {
        // do nothing
      }
    },

    closeDesktopNotify: function() {
      if (this.props.desktopNotify) {
        this.props.desktopNotify.close();
        this.props.desktopMessage.off(null, null, this);
        this.props.desktopMessage = this.props.desktopNotify = null;
      }
    },

    toastNotify: function(message) {
      var placeholder = this.querySelector('.layer-message-item-placeholder');
      if (placeholder) this.nodes.container.removeChild(placeholder);
      this.nodes.avatar.users = [message.sender];
      this.nodes.title.innerHTML = message.sender.displayName;
      var handler = layerUI.getHandler(message, this);
      if (handler) {
        if (this.props.toastTimeout) clearTimeout(this.props.toastTimeout);
        this.classList.add(handler.tagName);
        var messageHandler = document.createElement(handler.tagName);
        messageHandler.listHeight = 200;
        messageHandler.listWidth = 400;
        messageHandler.noPadding = true;
        messageHandler.message = message;
        messageHandler.classList.add('layer-message-item-placeholder');
        this.nodes.container.appendChild(messageHandler);
        this.classList.add('layer-notifier-toast-fade');
        this.classList.add('layer-notifier-toast');
        this.props.toastTimeout = setTimeout(this.clearToast.bind(this), this.timeoutSeconds * 1000);

        this.props.toastMessage = message;
        message.on('messages:change', function(evt) {
          if (message.isRead) {
            this.clearToast();
          }
        }, this);
      }
    },

    clearToast: function() {
      this.classList.add('layer-notifier-toast-fade');
      this.classList.remove('layer-notifier-toast');

      clearTimeout(this.props.toastTimeout);
      this.props.toastTimeout = 0;
      if (this.props.toastMessage) this.props.toastMessage.off(null, null, this);
      this.props.toastMessage = null;
    },

    clickToast: function(evt) {
      if (this.props.toastMessage) {
        evt.preventDefault();
        evt.stopPropagation();
        this.trigger('layer-notification-click', {message: this.props.toastMessage});
        this.clearToast();
      }
    }
  }
});

