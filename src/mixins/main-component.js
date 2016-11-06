/**
 * A Mixin for main components (not needed for subcomponents) that provides common properties, shortcuts and code.
 *
 * @class layerUI.mixins.MainComponent
 */
var layerUI = require('../base');
var layer = layerUI.layer;
module.exports = {
  properties: {
    /**
     * Is this component a Main Component (high level for use by third party apps).
     *
     * Used by adapters to find components to adapte.
     * @private
     * @property {Boolean}
     */
    isMainComponent: {
      value: true,
      order: 1
    },

    // TODO: Some MainComponents don't have Queries; this should be moved into a has-query mixin
    /**
     * The Query was generated internally, not passed in as an attribute or property.
     *
     * @property {Boolean}
     * @readonly
     */
    hasGeneratedQuery: {
      value: false,
      type: Boolean
    },

    /**
     * An App ID can be provided as a property; this allows the app to find its Client.
     *
     * App IDs are typically provided via:
     *
     * ```
     * layerUI.init(({ appId: myAppId })
     * ```
     *
     * The only time one would use this property
     * is if building an app that used multiple App IDs.
     *
     * @property {String}
     */
    appId: {
      order: 2,
      set: function(value) {
        if (value && value.indexOf('layer:///') === 0) {
          this.client = layer.Client.getClient(value);
        }
      }
    },

    /**
     * The layer.Client can be passed in via the `client` property or the `appId` property.
     *
     * App IDs are typically provided via:
     *
     * ```
     * layerUI.init(({ appId: myAppId })
     * ```
     *
     * The only time one would use this property
     * is if building an app that used multiple Clients.
     *
     * @property {layer.Client}
     */
    client: {}
  },
  methods: {
    created: function() {
      if (layerUI.appId) this.appId = layerUI.appId;
    },

    // Wait to give the app a chance to setup a query before we generate and fire one
    scheduleGeneratedQuery: function() {
      setTimeout(this.setupGeneratedQuery.bind(this), 50);
    },

    setupGeneratedQuery: function() {
      if (this.queryModel && !this.query && this.client && !this.client.isDestroyed) {
        this.query = this.client.createQuery({
          model: this.queryModel,
          dataType: layer.Query.InstanceDataType,
          paginationWindow: 50
        });
        this.hasGeneratedQuery = true;
      }
    }
  }
};