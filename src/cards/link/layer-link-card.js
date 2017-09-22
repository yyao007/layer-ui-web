/**
 *
 * @class layerUI.handlers.message.CardView
 * @extends layerUI.components.Component
 */
import { registerComponent } from '../../components/component';
import CardMixin from '../card-mixin';
import { addActionHandler } from '../../handlers/message/layer-card-view';

registerComponent('layer-link-card', {
  mixins: [CardMixin],

  // This style contains rules that impacts the container that contains the url card
  // This will not translate well to shadow-dom.
  style: `
  layer-card-view.layer-link-card layer-standard-card-container {
    cursor: pointer;
    display: block;
  }
  layer-link-card img[src=''] {
    display: none;
  }
  layer-link-card img {
    width: 100%;
  }
  .layer-card-width-flex-card layer-link-card a {
    display: none;
  }
  `,

  template: '<img layer-id="image" class="layer-link-card-image" /><a target="_blank" layer-id="link"></a>',
  properties: {
    widthType: {
      get() {
        return this.model.imageUrl || this.parentComponent.isShowingMetadata ? 'flex-card' : 'chat-bubble';
      },
    },
    cardContainerTagName: {
      noGetterFromSetter: true,
      value: 'layer-standard-card-container',
    },
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

    onCreate() {

    },

    onRender() {
      this.onRerender();
    },


    /**
     *
     * @method
     */
    onRerender() {
      this.cardView.toggleClass('layer-card-as-chat-bubble',
        !this.model.title && !this.model.author && !this.model.imageUrl && !this.model.description);
      this.nodes.image.src = this.model.imageUrl || '';
      this.nodes.link.src = this.model.url;
      this.nodes.link.innerHTML = this.model.url;
    },
    setupContainerClasses() {
      if (this.widthType) {
        const isLinkOnly = this.widthType === 'chat-bubble';
        this.parentComponent.classList[isLinkOnly ? 'remove' : 'add']('layer-arrow-next-container');
        this.parentComponent.classList[this.model.imageUrl || isLinkOnly ? 'remove' : 'add']('layer-no-core-ui');
      }
    },
  },
});

addActionHandler('open-url', function openUrlHandler(customData) {
  const url = customData.url || this.model.url;
  if (url) window.open(url);
});
