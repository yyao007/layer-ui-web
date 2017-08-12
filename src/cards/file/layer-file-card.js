/**
 * TODO: Verify that custom handling of "open-file" events are possible and documented
 * @class layerUI.handlers.message.CardView
 * @extends layerUI.components.Component
 */
import { registerComponent } from '../../components/component';
import CardMixin from '../card-mixin';
import CardPrimitiveMixin from '../card-primitive-mixin';
import { addActionHandler } from '../../handlers/message/layer-card-view';

registerComponent('layer-file-card', {
  mixins: [CardMixin, CardPrimitiveMixin],

  // Adapated from github.com/picturepan2/fileicon.css
  style: `layer-card-view.layer-file-card > * {
    cursor: pointer;
  }
  layer-file-card {
    display: block;
    width: 100%;
  }
`,

  // Note that there is also a message property managed by the MessageHandler mixin
  properties: {

  },
  methods: {
    /**
     * Can be rendered in a concise format required for Conversation Last Message and Layer Notifier
     *
     * @method
     */
    canRenderConcise(message) {
      return true;
    },

    /**
     *
     * @method
     */
    onRerender() {
      this.classList.add('layer-file-' + this.model.mimeType.replace(/[/+]/g, '-'));
    },
  },
});

/* Note that this runs with this === <layer-card-view /> */
addActionHandler('open-file', function openFileHandler(customData) {
  if (customData.url || customData.sourceUrl) {
    window.open(customData.url || customData.sourceUrl);
  } else if (this.model.sourceUrl) {
    window.open(this.model.sourceUrl);
  } else if (this.model.source) {
    if (this.model.source.url) {
      window.open(this.model.source.url);
    } else {
      this.model.source.fetchStream(url => window.open(url));
    }
  }
});