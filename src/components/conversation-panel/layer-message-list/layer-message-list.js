/**
 * The Layer Message List widget renders a scrollable, pagable list of layerUI.MessageItem widgets.
 *
 * This is designed to go inside of the layerUI.Conversation widget.
 *
 * This Component has two named templates:
 *
 * * `layer-message-item-sent`: Rendering for Messages sent by the owner of this Session
 * * `layer-message-item-received`: Rendering for Messages sent by other users
 *
 * Messages are organized into sets where a set starts with the first message from a given user, and ends when either
 * a different user sends a Message, or a long enough pause occurs.  Each Message will have firstInSeries/lastInSeries properties,
 * and these need to be maintained as new Messages are loaded, deleted, etc...
 *
 *
 * @class layerUI.components.Conversation.MessageList
 * @extends layerUI.components.Component
 */
var LUIComponent = require('../../../components/component');
var layerUI = require('../../../base');
var layer = layerUI.layer;
var animatedScrollTo = require('animated-scrollto')

// Mandatory delay between loading one page and the next.  If user is scrolling too fast, they'll have to wait at least (2) seconds.
var PAGING_DELAY = 2000;

LUIComponent('layer-message-list', {
  mixins: [require('../../../mixins/list')],
  properties: {

    /**
     * Provide property to override the function used to render a date for each Message Item.
     *
     * Note that changing this will not regenerate the list; this should be set when initializing a new List.
     *
     * ```javascript
     * messageListPanel.dateRenderer = function(message) {
     *    var date = message.sentAt;
     *    return date.toISOString();
     * };
     * ```
     *
     * @property {Function}
     */
    dateRenderer: {},

    /**
     * Provide property to override the function used to render a date for each Message Item.
     *
     * Note that changing this will not regenerate the list; this should be set when initializing a new List.
     *
     * ```javascript
     * messageList.messageStatusRenderer = function(message) {
     *    return message.readStatus === layer.Constants.RECIPIENT_STATE.ALL ? 'read' : 'processing...';
     * };
     * ```
     *
     * @property {Function}
     */
    messageStatusRenderer: {},

    /**
     * If the user scrolls within this many screen-fulls of the top of the list, page the Query.
     *
     * If value is 0, will page once the user reaches the top.  If the value is 0.5, will page once the user
     * reaches a `scrollTop` of 1/2 `clientHeight`.
     *
     * @property {Number}
     */
    screenFullsBeforePaging: {
      value: 1.5
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
      if (!this.id) this.id = layer.Util.generateUUID();
      this.props.lastPagedAt = 0;
      this.props.isSelfScrolling = false;
      this.props.stuckToBottom = true;
      this.props.lastScroll = 0;
      this.props.checkVisibilityBound = this.checkVisibility.bind(this);
      window.addEventListener('focus', this.props.checkVisibilityBound);

      this.render();
    },

    /**
     * Cleanup all pointers to self created by registering event handlers.
     *
     * @method destroyed
     * @private
     */
    destroyed: function() {
      window.removeEventListener('focus', this.props.checkVisibilityBound);
    },

    /**
     * Tests to see if we should load a new page of data.
     *
     * 1. Tests scrollTop to see if we are close enough to the top
     * 2. Tests if we are already loading that page of data
     *
     * @method
     * @return {Boolean}
     */
    shouldPage: function() {
      var pagingHeight = Math.max(this.clientHeight, 300) * this.screenFullsBeforePaging;
      return this.scrollTop <= pagingHeight && this.scrollHeight > this.clientHeight + 1 && !this.isDataLoading;
    },

    /**
     * Handler is called whenever the list is scrolled.
     *
     * Scrolling is caused by user activity, OR by setting the `scrollTop`.
     * Typically, we want to stay `stuckToButton` so that any time new Messages arrive,
     * we scroll to the bottom to see them.  Any user scrolling however may disable that behavior.
     *
     * @method
     * @private
     */
    handleScroll: function() {
      // We may set a scrollTop higher than the current scrolltop, but the only thing that changes to a lower scrollTop is
      // the user scrolling, which requires us to process it.
      var userScrolled = !this.props.isSelfScrolling || this.scrollTop < this.props.lastScroll;
      this.props.lastScroll = this.scrollTop;

      // If the user has scrolled within screenFullsBeforePaging of the top of the page... and if the page has enough contents to actually
      // be scrollable, page the Messages.
      if (this.shouldPage() && userScrolled && !this.props.delayedPagingTimeout) {
        if (this.props.lastPagedAt + PAGING_DELAY < Date.now()) {
          if (!this.query.isFiring) {
            this.query.update({paginationWindow: this.query.paginationWindow + 50});
            this.isDataLoading = this.props.query.isFiring;
          }
        } else if (!this.props.delayedPagingTimeout) {
          // User is scrolling kind of fast, lets slow things down a little
          this.props.delayedPagingTimeout = setTimeout(function() {
            this.query.update({paginationWindow: this.query.paginationWindow + 50});
            this.isDataLoading = this.props.query.isFiring;
            this.props.delayedPagingTimeout = 0;
          }.bind(this), 500);
        }
      }

      // If we have scrolled to the bottom, set stuckToBottom to true, else false.
      var stuckToBottom = this.scrollHeight - 1 <= this.clientHeight + this.scrollTop;
      if (stuckToBottom !== this.props.stuckToBottom) {
        this.props.stuckToBottom = stuckToBottom;
      }

      // Trigger checks on visibility to update read state
      this.checkVisibility();
    },

    /**
     * Scroll the list to the specified Y position.
     *
     * Will call checkVisibility() when done.
     *
     * @method
     * @param {Number} position
     */
    scrollTo: function(position) {
      if (position === this.scrollTop) return;
      this.props.isSelfScrolling = true;
      this.scrollTop = position;
      setTimeout(function() {
        this.props.isSelfScrolling = false;
        this.checkVisibility();
      }.bind(this), 200);
    },

    /**
     * Scrolls the list to the specified Y position.
     *
     * Will call checkVisibility() when done.
     *
     * @method
     * @param {Number} position
     */
    animateScrollTo: function(position) {
      if (position === this.scrollTop) return;
      this.props.isSelfScrolling = true;
      animatedScrollTo(this, position, 200, function() {
        // Wait for any onScroll events to trigger before we clear isSelfScrolling and procede
        setTimeout(function() {
          this.props.isSelfScrolling = false;
          this.checkVisibility();
        }.bind(this), 100);
      }.bind(this));
    },

    /**
     * Check which Messages are fully visible, and mark them as Read.
     *
     * TODO PERFORMANCE: Should be able to skip to the visible items and near-visible items without iterating over entire list
     *
     * NOTE: Only mark messages as read if the document has focus.  Just being visible but not in focus does not give us
     * sufficient cause to assume the user has read it.
     *
     * TODO: At some point we may need to customize whether document.hasFocus() is required; in particular, this could cause problems for anyone
     * running in an iFrame.  Is top.document.hasFocus() a suitable solution, or are there scenarios where top might not even be accessable due to
     * being a different domain?
     *
     * @method
     * @private
     */
    checkVisibility: function() {
      if (layerUI.isInBackground()) return;

      // The top that we can see is marked by how far we have scrolled.
      // However, all offsetTop values of the child nodes will be skewed by the value of this.offsetTop, so add that in.
      var visibleTop = this.scrollTop + this.offsetTop;

      // The bottom that we can see is marked by how far we have scrolled plus the height of the panel.
      // However, all offsetTop values of the child nodes will be skewed by the value of this.offsetTop, so add that in.
      var visibleBottom = this.scrollTop + this.clientHeight + this.offsetTop;
      var children = Array.prototype.slice.call(this.childNodes);
      children.forEach(function(child) {
        if (child.offsetTop >= visibleTop && child.offsetTop + child.clientHeight <= visibleBottom) {
          if (child.props && child.props.item && !child.props.item.isRead) {
            // TODO: Use a scheduler rather than many setTimeout calls
            setTimeout(function() {
              this.markAsRead(child)
            }.bind(this), layerUI.settings.markReadDelay);
          }
        }
      }, this);
    },

    /**
     * Mark a the Message associated with this item as read.
     *
     * This method validates that the Message flagged as ready to be read by `checkVisibility()` is
     * in fact still fully visible after the delay.
     *
     * @method
     * @private
     * @param {layerUI.MessageItem} child
     */
    markAsRead: function(child) {
      var visibleTop = this.scrollTop + this.offsetTop  ;
      var visibleBottom = this.scrollTop + this.clientHeight + this.offsetTop;
      if (child.offsetTop >= visibleTop && child.offsetTop + child.clientHeight <= visibleBottom) {
        child.props.item.isRead = true;
      }
    },

    getItemId: function(message) {
      return 'message-item' + this.id + '-' + message.id.replace(/layer:\/\/\/messages\//, '');
    },


    /**
     * Append a Message to the document fragment, updating the previous messages' lastInSeries property as needed.
     *
     * @method
     * @private
     */
    generateItem: function(message) {
      var handler = layerUI.getHandler(message, this);
      if (handler) {
        var messageWidget = document.createElement('layer-message-item');
        messageWidget.id = this.getItemId(message);
        messageWidget.dateRenderer = this.dateRenderer;
        messageWidget.messageStatusRenderer = this.messageStatusRenderer;

        messageWidget.contentTag = handler.tagName;
        return messageWidget;
      } else {
        return null;
      }
    },

    /**
     * Are the two Messages in the same Group?
     *
     * @method
     * @private
     * @param {layer.Message} m1
     * @param {layer.Message} m2
     */
    inSameGroup: function(m1, m2) {
      if (!m1 || !m2) return false;
      var diff = Math.abs(m1.sentAt.getTime() - m2.sentAt.getTime());
      return  (m1.sender === m2.sender && diff <  layerUI.settings.messageGroupTimeSpan);
    },

    /**
     * Whenever new message items are added to the list, we need to assign lastInSeries and firstInSeries values to them,
     * as well as update those values in nearby message items.
     *
     * @method
     * @private
     * @param {layerUI.Conversation.MessageItem[]} widgets
     */
    _processAffectedWidgets: function(widgets, isTopItemNew) {
      if (widgets.length === 0) return;
      if (isTopItemNew) widgets[0].firstInSeries = true;
      for (var i = 1; i < widgets.length; i++) {
        var sameGroup = this.inSameGroup(widgets[i - 1].item, widgets[i].item);
        widgets[i].firstInSeries = !sameGroup;
        widgets[i - 1].lastInSeries = !sameGroup;
      }
      if (!widgets[widgets.length - 1].nextSibling) widgets[widgets.length - 1].lastInSeries = true;
    },

    /**
     * Call this on any Query change events.
     *
     * @method
     * @private
     * @param {Event} evt
     */
    rerender: function(evt) {
      this._rerender(evt);
    },

    renderResetData: function() {
      this.props.listData = [];
      this.scrollTo(0);
      this.props.stuckToBottom = true;
      this.props.lastPagedAt = 0;
      this.props.isSelfScrolling = false;
      this.props.lastScroll = 0;
      this.render();
    },

    renderWithoutRemovedData: function(evt) {
      this.props.listData = [].concat(this.props.query.data).reverse();

      var messageWidget = this.querySelector('#' + this.getItemId(evt.target));
      if (messageWidget) this.removeChild(messageWidget);

      var removeIndex = this.props.listData.length - evt.index; // Inverted for reverse order
      var affectedItems = this.props.listData.slice(Math.max(0, removeIndex - 3), removeIndex + 3);
      this._gatherAndProcessAffectedItems(affectedItems, false);

    },

    renderInsertedData: function(evt) {
      var oldListData = this.props.listData;
      this.props.listData = [].concat(this.props.query.data).reverse();

      var insertIndex = oldListData.length - evt.index; // Inverted for reverse order
      var isTopItemNew = insertIndex === 0;
      var isBottomItemNew = insertIndex === oldListData.length;

      var affectedItems = this.props.listData.slice(Math.max(0, insertIndex - 3), insertIndex + 4);
      var fragment = this.generateFragment([evt.target]);
      if (insertIndex < oldListData.length) {
        var insertBeforeNode = affectedItems.length > 1 ? this.querySelector('#' + this.getItemId(oldListData[insertIndex])) : null;
        this.insertBefore(fragment, insertBeforeNode);
      } else {
        this.appendChild(fragment);
      }
      this._gatherAndProcessAffectedItems(affectedItems, isTopItemNew);
      this.updateLastMessageSent();
      if (this.props.stuckToBottom) {
        this.animateScrollTo(this.scrollHeight - this.clientHeight);
      } else {
        this.checkVisibility();
      }
    },

    /**
     * The last message sent by the session owner should show some pending/read-by/etc... status.
     *
     * Other messages may also do this, but adding the `layer-last-message-sent` css class makes it easy
     * to conditionally show status only for the last sent message.
     *
     * TODO: Review if a CSS :last-child could isolate last message sent from last message received, and be used for easily styling this.
     *
     * @method
     * @private
     */
    updateLastMessageSent: function() {
      for (var i = this.props.listData.length - 1; i >= 0; i--) {
        if (this.props.listData[i].sender.sessionOwner) {
          var item = this.querySelector('#' + this.getItemId(this.props.listData[i]));
          if (item && !item.classList.contains('layer-last-message-sent')) {
            this.querySelectorAllArray('.layer-last-message-sent').forEach(function(node) {
              node.classList.remove('layer-last-message-sent');
            });
            item.classList.add('layer-last-message-sent');
          }
          break;
        }
      }
    },

    /**
     * Identify the message-item that is fully visible and at the top of the viewport.
     *
     * @method
     * @private
     */
    findFirstVisibleItem: function() {
      var visibleTop = this.scrollTop + this.offsetTop;
      var visibleBottom = this.scrollTop + this.clientHeight + this.offsetTop;
      var children = Array.prototype.slice.call(this.childNodes);
      for (var i = 0; i < children.length; i++) {
        var child = children[i];
        if (child.offsetTop >= visibleTop && child.offsetTop + child.clientHeight <= visibleBottom) {
          if (child.props && child.props.item) {
            return child;
          }
        }
      }
      return null;
    },

    /**
     * Render a new page of data received from the Query.
     *
     * @method
     * @private
     */
    renderPagedData: function(evt) {
      if (evt.data.length === 0) {
        this.isDataLoading = this.props.query.isFiring;
        return;
      }

      // Set this so that if the user is clinging to the scrollbar forcing it to stay at the top,
      // we know we just paged and won't page again.
      this.props.lastPagedAt = Date.now();

      // Get both the query data and the event data
      var oldListData = this.props.listData;
      this.props.listData = [].concat(this.props.query.data).reverse();
      var newData = [].concat(evt.data).reverse();

      // Get the affected items
      var affectedItems = [].concat(newData);
      if (oldListData.length) affectedItems = affectedItems.concat(oldListData.slice(0, 3));

      var fragment;

      // Append only a few items at a time, with pauses to keep browser running smoothly.
      // Don't append anything to the document until its all generated
      // TODO: This sucks.  For 100 items, it takes 5 iterates of 20ms each, so it adds 100ms lag to render,
      // and the only good news is that this 100ms lag results in performance of the rest of the browser not degrading.
      var appendMore = function appendMore() {
        var processItems = newData.splice(0, 20);
        fragment = this.generateFragment(processItems, fragment);
        if (newData.length) {
          setTimeout(function() {
            appendMore.call(this);
          }.bind(this), 20);
        } else {
          this.renderPagedDataDone(affectedItems, fragment, evt);
        }
      }.bind(this);
      appendMore();
    },

    /**
     * After we have rendered the newly paged in messages, some post processing is needed.
     *
     * 1. Call processAffectedWidgets
     * 2. Scroll to maintain an appropriate position
     * 3. Insert the document fragment into our widget
     * 4. Check visibility on newly rendered items
     */
    renderPagedDataDone: function(affectedItems, fragment, evt) {
      // Find the nodes of all affected items in both the document and the fragment,
      // and call processAffectedWidgets on them
      if (affectedItems.length) {
        var affectedWidgetsQuery = '#' + affectedItems.map(function(message) {
          return this.getItemId(message);
        }, this).join(', #');
        var affectedWidgets = this.querySelectorAllArray(affectedWidgetsQuery);
        if (fragment) {
          var fragmentWidgets = Array.prototype.slice.call(fragment.querySelectorAll(affectedWidgetsQuery));
          affectedWidgets = fragmentWidgets.concat(affectedWidgets);
        }
        try {
          // When paging new data, top item should always be new
          this.processAffectedWidgets(affectedWidgets, true);
        } catch(e) {
          console.error(e)
        }
      }

      var firstVisibleItem = this.findFirstVisibleItem();
      var initialOffset = firstVisibleItem ? firstVisibleItem.offsetTop - this.offsetTop - this.scrollTop : 0;

      // Now that DOM manipulation is completed,
      // we can add the document fragments to the page
      var nextItem = this.nodes.loadIndicator.nextSibling;
      this.insertBefore(fragment, nextItem);

      // TODO PERFORMANCE: We should not need to do this as we page UP; very wasteful
      this.updateLastMessageSent();

      if (this.props.stuckToBottom) {
        this.scrollTo(this.scrollHeight - this.clientHeight);
      } else if (firstVisibleItem && evt.type === 'data' && evt.data.length !== 0) {
        this.scrollTo(firstVisibleItem.offsetTop - this.offsetTop - initialOffset);
      }

      this.isDataLoading = this.props.query.isFiring;
      this.checkVisibility();
    }
  }
});
