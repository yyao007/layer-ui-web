/**
 *
 * @class layerUI.handlers.message.CardView
 * @extends layerUI.components.Component
 */
import { registerComponent } from '../components/component';

registerComponent('layer-titled-card-container', {
  style: `
    layer-titled-card-container {
      display: flex;
      flex-direction: column;
      align-items: stretch;
    }

    layer-titled-card-container .layer-card-title-bar {
      display: flex;
      flex-direction: row;
    }
    layer-titled-card-container .layer-card-title-bar-title {
      flex-grow: 1;
    }
  `,
  template: `
  <div class="layer-card-title-bar">
    <div layer-id='icon' class="layer-card-title-bar-icon"></div>
    <div layer-id='title' class="layer-card-title-bar-text"></div>
  </div>
  <div layer-id='UIContainer' class='layer-card-top'></div>
  `,

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
    icon: {
      set(icon, oldIcon) {
        if (oldIcon) this.nodes.icon.classList.remove(oldIcon);
        this.nodes.icon.classList.add(icon);
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
       this.icon = this.properties.ui.getIconClass();
       this.title = this.properties.ui.getTitle();
    },
  },
});

