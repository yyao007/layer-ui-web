/**
 * A List Mixin that provides common list patterns
 *
 * @class layerUI.mixins.List
 */
import { layer as LayerAPI } from '../base';

module.exports = {
  properties: {

    /**
     * The Client is needed in order for the list to get a Query from a queryId
     *
     * TODO: Insure this does not conflict with main-component's client property!
     *
     * @property {layer.Client} [client=null]
     */
    client: {
      set(value) {
        if (value) {
          if (this.queryId) {
            this.query = value.getQuery(this.queryId);
          } else if (this.isMainComponent) {
            this.scheduleGeneratedQuery();
          }
        }
      },
    },

    /**
     * The ID for the Identity Query providing the User list to render.
     *
     * Note that you can directly set the query property as well.
     *
     * Leaving this and the query properties empty will cause a Query to be generated for you.
     *
     * @property {String} [queryId='']
     */
    queryId: {
      set(value) {
        if (value && value.indexOf('layer:///') !== 0) this.properties.queryId = '';
        if (this.client && this.queryId) {
          this.query = this.client.getQuery(this.queryId);
        }
      },
    },

    /**
     * A Query identifies the data we are to render and page through.
     *
     * Suggested practices:
     *
     * * If your not using this query elsewhere in your app, let this widget generate its own Query
     * * If setting this from an html template, use layerUI.components.ConversationPanel.queryId instead.
     * * Special case for layerUI.components.ConversationPanel: if providing your own query, you must update its predicate in addition to
     *   setting the layerUI.components.ConversationPanel.conversationId.
     *
     * @property {layer.Query} [query=null]
     */
    query: {
      set(value, oldValue) {
        if (value instanceof LayerAPI.Query) {
          if (this.hasGeneratedQuery) {
            this.hasGeneratedQuery = false;
            oldValue.destroy();
          }
          this.updateQuery();
        } else {
          this.properties.query = null;
        }
      },
    },

    /**
     * Set/get state related to whether the Query data is loading data from the server.
     *
     * @property {Boolean} [isDataLoading=false]
     */

    isDataLoading: {
      set(value) {
        this.classList[value ? 'add' : 'remove']('layer-loading-data');
      },
    },

    /**
     * Any time we are about to render an object, call any provided onRenderListItem function to see if there
     * are nodes to be inserted before/after the User Item.
     *
     * ```javascript
     * userList.onRenderListItem = function(widget, dataArray, index, isTopItemNew) {
     *     var conversation = widget.item;
     *     var priorConversation = dataArray[index - 1];
     *     if (index > 0 && conversation.metadata.category !== priorConversation.metadata.category) {
     *        widget.customNodeAbove = '<div class="my-separator">' + widget.user.metadata.category + '</div>';
     *     }
     * });
     * ```
     *
     * Typical actions on receiving a widget is to set its customNodeAbove and/or customNodeBelow to either a DOM node or an HTML String.
     *
     * @property {Function} [onRenderListItem=null]      Function to call on each rendered item.
     * @property {layer.Root} onRenderListItem.widget    Current user/message/conversation/list-item widget that has been created from the Query.
     * @property {layer.Root[]} onRenderListItem.items   Full set of users/messages/conversations have been/will be rendered
     * @property {Number} onRenderListItem.index         Index of the user/message/conversation in the items array
     * @property {Boolean} onRenderListItem.isTopItemNew If the top item is index 0, and its newly added rather than just affected by changes
     *           around it, this is often useful to know.
     */
    onRenderListItem: {
      type: Function,
    },

    /**
     * How many items to page in each time we page the Query.
     *
     * @property {Number} [pageSize=50]
     */
    pageSize: {
      value: 50,
    },

    /**
     * A throttler is used to prevent excessive scroll events.
     *
     * This timeout indicates how frequently scroll events are allowed to fire in miliseconds.
     * This value should not need to be tinkered with.
     *
     * @property {Number} [throttlerTimeout=66]
     */
    throttlerTimeout: {
      value: 66,
    },
  },
  methods: {
    created() {
      this.properties.listData = [];
      this.addEventListener('scroll', this._onScroll.bind(this));
    },

    /**
     * The _onScroll method throttles calls to the handleScroll method.
     *
     * @method _onScroll
     * @param {Event} evt
     * @private
     */
    _onScroll(evt) {
      if (this.properties.isSelfScrolling) {
        evt.preventDefault();
      } else {
        this.throttler(this.handleScroll.bind(this));
      }
    },

    /**
     * Simple throttler to avoid too many events while scrolling.
     *
     * Not at this time safe for handling multiple types of events at the same time.
     *
     * @method throttler
     * @private
     */
    throttler(callback) {
      if (!this.properties.throttleTimeout) {
        this.properties.throttleTimeout = setTimeout(() => {
          this.properties.throttleTimeout = null;
          callback();
        }, this.throttlerTimeout);
      }
    },

    /**
     * Any time we get a new Query assigned, wire it up.
     *
     * @method updateQuery
     * @private
     */
    updateQuery() {
      // Allow this dom to finish being inserted into parent node so that size info can be available before rendering the items
      setTimeout(this.render.bind(this), 1);
      this.query.on('change', this.rerender, this);
      this.client = this.query.client;
    },

    /**
     * If the user scrolls to the bottom of the list, page the Query.
     *
     * @method handleScroll
     * @private
     */
    handleScroll() {
      if (this.scrollTop >= this.scrollHeight - this.clientHeight - 20 && this.scrollTop > 0) {
        this.query.update({ paginationWindow: this.query.paginationWindow + this.pageSize });
        this.isDataLoading = this.properties.query.isFiring;
      }
    },

    /**
     * Scroll the list to the specified Y position.
     *
     * @method scrollTo
     * @param {Number} position
     */
    scrollTo(position) {
      if (position === this.scrollTop) return;
      this.scrollTop = position;
    },

    /**
     * Render the User List.  Called any time there is a Query is reset, or when we get assigned a new Query.
     *
     * @method render
     * @private
     */
    render() {
      // Reset the query to initial state by cloning the template
      const clone = document.importNode(this.getTemplate().content, true);
      this.innerHTML = '';
      this.appendChild(clone);
      this.setupDomNodes();

      // Render any data in the query
      if (this.query && this.query.size) {
        this.rerender({ type: 'data', data: this.query.data });
      }
    },

    /**
     * Generate a document fragment with all the newly added Users.
     *
     * @method generateFragment
     * @private
     */
    generateFragment(data, fragment) {
      if (!fragment) fragment = document.createDocumentFragment();
      data.forEach((item, index) => {
        this.generateFragmentItem(item, fragment);
      }, this);
      return fragment;
    },

    /**
     * Generate an list-item for one query result.
     *
     * @method generateFragmentItem
     * @private
     */
    generateFragmentItem(item, fragment) {
      const itemInstance = item instanceof LayerAPI.Root ? item : this.client._getObject(item.id);
      if (itemInstance) {
        const widget = this.generateItem(itemInstance);

        if (widget) {
          // TODO: Handle resizing of window/panels
          widget.listHeight = this.clientHeight;
          widget.listWidth = this.clientWidth;
          widget.item = itemInstance;
          fragment.appendChild(widget);
        }
      }
    },

    /**
     * Find the widgets associated with each affected item and feed it to processAffectedWidgets.
     *
     * @method _gatherAndProcessAffectedItems
     * @private
     */
    _gatherAndProcessAffectedItems(affectedItems, isTopItemNew) {
      if (affectedItems.length) {
        const itemIds = affectedItems.map(message => this.getItemId(message));
        const affectedWidgets = this.querySelectorAllArray('#' + itemIds.join(', #'));
        this.processAffectedWidgets(affectedWidgets, isTopItemNew);
      }
    },

    /**
     * For all newly added items, as well as items near them,
     * call onRenderListItem and _processAffectedWidgets to udpate
     * any rendering state needed.
     *
     * widgets are assumed to be sequential within the list.
     *
     * @method processAffectedWidgets
     * @private
     */
    processAffectedWidgets(widgets, isTopItemNew) {
      // Get the index of our first widget within listData
      let firstIndex;
      for (let i = 0; i < this.properties.listData.length; i++) {
        if (widgets.length && widgets[0].item.id === this.properties.listData[i].id) {
          firstIndex = i;
          break;
        }
      }

      // Do our internal processing of these widgets
      this._processAffectedWidgets(widgets, firstIndex, isTopItemNew);

      // Allow external processing of the widgets
      widgets.forEach((widget, index) => {
        if (this.properties.onRenderListItem) {
          try {
            this.properties.onRenderListItem(widget, this.properties.listData, firstIndex + index, isTopItemNew);
          } catch (err) {
            console.error(`Error in onRenderListItem for ${widget.item.id}; ${err}`);
          }
        }
      }, this);
    },

    /**
     * Lists should override this to provide custom behaviors on newly added/affected items.
     *
     * @method _processAffectedWidgets
     * @private
     * @param {layerUI.mixins.ListItem} widgets
     * @param {Number} firstIndex - Index in the listData array of the first item in the widgets array
     * @param {Boolean} isTopItemNew - If the top item is index 0 and its a new item rather than an "affected" item, this is true.
     */
    _processAffectedWidgets(widgets, firstIndex, isTopItemNew) {
    },

    /**
     * Call this on any Query change events.
     *
     * TODO: This should work on the MessageList which is in Reverse Order
     *
     * @method _rerender
     * @private
     * @param {Event} evt
     */
    _rerender(evt) {
      switch (evt.type) {
        case 'data':
          this.renderPagedData(evt);
          break;
        case 'insert':
          this.renderInsertedData(evt);
          break;
        case 'remove':
          this.renderWithoutRemovedData(evt);
          break;
        case 'reset':
          this.renderResetData();
          break;
        case 'move':
          this.renderMovedData(evt);
      }
    },

    /**
     * The query has been reset of all data, perhaps its now got a new predicate.
     *
     * Clear all data and list state
     *
     * @method renderResetData
     * @private
     */
    renderResetData() {
      this.properties.listData = [];
      this.scrollTo(0);
      this.render();
    },

    /**
     * The query results have had an element move from one position to another.
     *
     * We need to update our list to reflect that change.
     *
     * @method renderMovedData
     * @private
     */
    renderMovedData(evt) {
      const oldIndex = evt.fromIndex;
      const newIndex = evt.toIndex;
      const moveNode = this.childNodes[oldIndex];
      this.removeChild(moveNode);
      this.insertBefore(moveNode, this.childNodes[newIndex]);
    },

    /**
     * Data has been removed from the query; remove that data from our UI.
     *
     * Calls _gatherAndProcessAffectedItems on 3 items prior and 3 items after the removed item.
     *
     * @method renderWithoutRemovedData
     * @private
     */
    renderWithoutRemovedData(evt) {
      this.properties.listData = [].concat(this.properties.query.data);
      const removeIndex = evt.index;
      const affectedItems = this.properties.listData.slice(Math.max(0, removeIndex - 3), removeIndex + 3);
      const listItem = this.querySelector('#' + this.getItemId(evt.target));
      if (listItem) this.removeChild(listItem);

      this._gatherAndProcessAffectedItems(affectedItems, false);
    },

    /**
     * Data has been inserted into the results; insert it into our UI list.
     *
     * @method renderInsertedData
     * @private
     */
    renderInsertedData(evt) {
      this.properties.listData = [].concat(this.properties.query.data);
      const insertIndex = evt.index;
      const affectedItems = this.properties.listData.slice(Math.max(0, insertIndex - 3), insertIndex + 4);
      const fragment = this.generateFragment([evt.target]);
      this.insertBefore(fragment, this.childNodes[insertIndex]);
      this._gatherAndProcessAffectedItems(affectedItems, insertIndex === 0);
    },

    /**
     * A new page of data has been loaded by the query; insert it into our results.
     *
     * @method renderPagedData
     * @private
     */
    renderPagedData(evt) {
      const affectedItems = this.properties.listData.slice(this.properties.listData.length - 3, this.properties.listData.length).concat(evt.data);
      this.properties.listData = [].concat(this.properties.query.data);
      const fragment = this.generateFragment(evt.data);

      this.insertBefore(fragment, this.nodes.loadIndicator);

      // isTopItemNew is true if there wasn't any prior data... data length == event length
      this._gatherAndProcessAffectedItems(affectedItems, evt.data.length === this.properties.query.data.length);
      this.isDataLoading = this.properties.query.isFiring;
    },
  },
};
