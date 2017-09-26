/**
 * TODO: Verify that custom handling of "open-file" events are possible and documented
 * @class layerUI.handlers.message.CardView
 * @extends layerUI.components.Component
 */
import { registerComponent } from '../../components/component';
import CardMixin from '../card-mixin';
import { registerMessageActionHandler } from '../../base';

registerComponent('layer-file-card', {
  mixins: [CardMixin],

  // Adapated from github.com/picturepan2/fileicon.css
  style: `
  layer-file-card {
    display: block;
    width: 100%;
  }
`,

  // Note that there is also a message property managed by the MessageHandler mixin
  properties: {
    widthType: {
      value: 'flex-card',
    },
    preferredMinWidth: {
      type: Number,
      value: 250,
    },
    cardContainerTagName: {
      noGetterFromSetter: true,
      value: 'layer-standard-card-container',
    },
  },
  methods: {
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
registerMessageActionHandler('open-file', function openFileHandler(customData) {
  if (customData.url) {
    window.open(customData.url);
  } else {
    this.model.getSourceUrl(url => window.open(url));
  }
});
