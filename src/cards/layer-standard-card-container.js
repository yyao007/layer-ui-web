/**
 *
 * @class layerUI.handlers.message.CardView
 * @extends layerUI.components.Component
 */
import { registerComponent } from '../components/component';

registerComponent('layer-standard-card-container', {
  style: `
    layer-standard-card-container {
      display: flex;
      flex-direction: column;
      align-items: stretch;
    }
    layer-standard-card-container.layer-card-no-metadata .layer-card-body {
      display: none;
    }
    layer-standard-card-container .layer-card-top {
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    layer-standard-card-container .layer-card-top > layer-image-card img {
      width: 100%;
    }
    layer-standard-card-container .layer-card-body-outer {
      display: flex;
      flex-direction: row;
    }
    layer-standard-card-container .layer-card-body-outer .layer-card-body {
      flex-grow: 1;
      width: 100%;
    }
  `,
  template: `
  <div layer-id='UIContainer' class='layer-card-top'></div>
  <div class="layer-card-body-outer">
    <div class="layer-card-body">
      <div layer-id="title" class="layer-card-title"></div>
      <div layer-id="description" class="layer-card-description"></div>
      <div layer-id="footer" class="layer-card-footer"></div>
    </div>
    <span class="layer-next-icon" ></span>
  </div>`,

   // Note that there is also a message property managed by the MessageHandler mixin
  properties: {
    model: {},
    ui: {
      set() {
        while(this.nodes.UIContainer.firstChild) this.nodes.UIContainer.removeChild(this.nodes.UIContainer.firstChild);
        if (this.properties.ui) this.nodes.UIContainer.appendChild(this.properties.ui);
      }
    },
    title: {
      set(title) {
        this.nodes.title.innerHTML = title;
      }
    },
    description: {
      set(description) {
        this.nodes.description.innerHTML = description;
      }
    },
    footer: {
      set(footer) {
        this.nodes.footer.innerHTML = footer;
      }
    },
    isShowingMetadata: {
      get() {
        const model = this.properties.model;
        return Boolean(model.getTitle() || model.getFooter() || model.getDescription());
      },
    },
    cardBorderStyle: {
      noGetterFromSetter: true,
      get() {
        return this.properties.cardBorderStyle || this.properties.ui.cardBorderStyle || '';
      }
    },
  },
  methods: {
    onAfterCreate() {
      this.model.on('change', this.onRerender, this);
    },

    /**
     *
     * @method
     */
    onRender() {
      this.onRerender();
    },

    onRerender() {
      const model = this.properties.model;
      this.title = model.getTitle();
      this.description = model.getDescription();
      this.footer = model.getFooter();
      this.ui.setupContainerClasses(this);
      this.toggleClass('layer-has-title', this.model.getTitle());
      this.toggleClass('layer-has-footer', this.model.getFooter());
      this.toggleClass('layer-has-description', this.model.getDescription());
      this.classList[!this.title && !this.description && !this.footer ? 'add' : 'remove']('layer-card-no-metadata');
    },
  },
});

