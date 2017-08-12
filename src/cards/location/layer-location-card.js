/* m = $("layer-conversation-view").conversation.createMessage({parts: [
  {
    mimeType: "application/vnd.layer.card.location+json; role=root",
    body: '{"latitude": 37.7734858, "longitude": -122.3916087, "title": "Réveille Coffee Co.", "description": "Good coffee, but pricey, and when you hear people say the name, you know that they just reviled the place."}'
  }]}).send();
  */

/**
 *
 * @class ???
 * @extends layerUI.components.Component
 */
import { registerComponent } from '../../components/component';
import CardMixin from '../card-mixin';
import CardPrimitiveMixin from '../card-primitive-mixin';
import L from 'leaflet';
import { addActionHandler } from '../../handlers/message/layer-card-view';

L.Icon.Default.imagePath = 'node_modules/leaflet/dist/images/';

registerComponent('layer-location-card', {
  mixins: [CardMixin, CardPrimitiveMixin],

  style: `
  .layer-location-card-address-only .layer-card-top {
    display: none;
  }
  `,
  properties: {
    cardBorderStyle: {
      get() {
        return this.model.presentation === 'map' ? 'rounded-bottom' : 'standard';
      },
    },
  },
  methods: {
    /**
     * Can be rendered in a concise format required for Conversation Last Message and Layer Notifier
     *
     * @method
     */
    canRenderConcise(message) {
      return false;
    },


    onAfterCreate() {
      this.classList.add('layer-location-presentation-' + this.model.presentation);
      if (this.model.presentation === 'map') {
        this.properties.map = L.map(this, {
          center: [this.model.latitude, this.model.longitude],
          zoom: 14,
        });

        L.tileLayer(window.mapboxUrl, {
          maxZoom: 18,
          attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> with <a href="http://mapbox.com">Mapbox</a>',
          id: 'mapbox.streets'
        }).addTo(this.properties.map);
      }
    },

    onRender() {
      this.onRerender();
    },

    /**
     *
     * @method
     */
    onRerender() {
      if (this.model.presentation === 'map') {
        const position = L.latLng(this.model.latitude, this.model.longitude);
        this.properties.map.setView(position, 14);
        var marker = L.marker(position).addTo(this.properties.map);
        this.properties.map.invalidateSize();
      }
    },
    setupContainerClasses(container) {
      container.classList[this.model.presentation === 'address' ? 'add' : 'remove']('layer-arrow-next-container');
      container.classList[this.model.presentation === 'address' ? 'add' : 'remove']('layer-location-card-address-only');
    },
    onAttach() {
      if (this.model.presentation === 'map') {
        setTimeout(() => this.properties.map.invalidateSize(), 1);
      }
    },
  },
});

addActionHandler('open-map', function openMapHandler(customData) {
  let url;
  if (this.model.presentation === 'map') return;
  if (this.model.street1) {
    url = 'http://www.google.com/maps/?q=' +
      escape(this.model.street1 + (this.model.street2 ? ' ' + this.model.street2 : '') + ` ${this.model.city} ${this.model.state}, ${this.model.postalCode}`);
  } else if (this.model.latitude) {
    url = `https://www.google.com/maps/search/?api=1&query=${this.model.latitude},${this.model.longitude}&zoom=${this.model.zoom}`;
  }
  if (url) window.open(url);
});