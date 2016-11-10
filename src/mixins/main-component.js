/**
 * A Mixin for main components (not needed for subcomponents) that provides common properties, shortcuts and code.
 *
 * @class layerUI.mixins.MainComponent
 */
import { layer as LayerAPI, settings } from '../base';

module.exports = {
  properties: {
    /**
     * Is this component a Main Component (high level for use by third party apps).
     *
     * Used by adapters to find components to adapte.
     * @private
     * @readonly
     * @property {Boolean} [isMainComponent=true]
     */
    isMainComponent: {
      value: true,
      order: 1,
    },

    // TODO: Some MainComponents don't have Queries; this should be moved into a has-query mixin
    /**
     * The Query was generated internally, not passed in as an attribute or property.
     *
     * @property {Boolean} [hasGeneratedQuery=false]
     * @readonly
     */
    hasGeneratedQuery: {
      value: false,
      type: Boolean,
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
     * @property {String} [appId=""]
     */
    appId: {
      order: 2,
      set(value) {
        if (value && value.indexOf('layer:///') === 0) {
          const client = LayerAPI.Client.getClient(value);
          if (!client) throw new Error('You must create a layer.Client with your appId before creating this component');
          this.client = client;
        }
      },
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
     * @property {layer.Client} [client=null]
     */
    client: {},
  },
  methods: {
    created() {
      if (settings.appId) this.appId = settings.appId;
    },

    // Wait to give the app a chance to setup a query before we generate and fire one
    scheduleGeneratedQuery() {
      setTimeout(this.setupGeneratedQuery.bind(this), 50);
    },

    setupGeneratedQuery() {
      if (this.queryModel && !this.query && this.client && !this.client.isDestroyed) {
        this.query = this.client.createQuery({
          model: this.queryModel,
          dataType: LayerAPI.Query.InstanceDataType,
          paginationWindow: this.pageSize || 50,
        });
        this.hasGeneratedQuery = true;
      }
    },
  },
};
