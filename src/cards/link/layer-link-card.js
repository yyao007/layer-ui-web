/**
 *
 * @class layerUI.handlers.message.CardView
 * @extends layerUI.components.Component
 */
import { registerComponent } from '../../components/component';
import CardMixin from '../card-mixin';
import CardPrimitiveMixin from '../card-primitive-mixin';
import { addActionHandler } from '../../handlers/message/layer-card-view';

registerComponent('layer-link-card', {
  mixins: [CardMixin, CardPrimitiveMixin],

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
    border-radius: 16px 16px 0px 0px;
  }
  layer-link-card:not(.layer-link-card-link-only) a {
    display: none;
  }
  layer-link-card.layer-link-card-link-only a {
    display: block;
    padding: 8px 12px;
    text-decoration: underline;
  }
  `,

  template: `<img layer-id="image" class="layer-link-card-image" /><a target='_blank' layer-id='link'></a>`,
  properties: {
    isLinkOnly: {
      set(isLinkOnly) {
        this.classList[!isLinkOnly ? 'remove' : 'add']('layer-link-card-link-only');
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
      this.isLinkOnly = !(this.model.imageUrl || this.model.title || this.model.description || this.model.subtitle || this.model.author);
    },
    setupContainerClasses() {
      this.parentComponent.classList[this.model.imageUrl || this.isLinkOnly ? 'remove' : 'add']('layer-arrow-next-container');
      this.parentComponent.classList[this.model.imageUrl || this.isLinkOnly ? 'remove' : 'add']('layer-no-core-ui');
    },
  },
});

addActionHandler('open-url', function openUrlHandler(customData) {
  const url = customData.url || this.model.url;
  if (url) window.open(url);
});
