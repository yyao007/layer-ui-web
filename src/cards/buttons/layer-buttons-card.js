/**
 *
 * @class
 * @extends layerUI.components.Component
 */
import { registerComponent } from '../../components/component';
import '../../components/subcomponents/layer-action-button/layer-action-button';
import '../../components/subcomponents/layer-url-button/layer-url-button';

registerComponent('layer-buttons-card', {
  template: `
    <div class="layer-button-content" layer-id="content"></div>
    <div class="layer-button-list" layer-id="buttons">
  </div>`,
  style: `layer-buttons-card {
    display: flex;
    flex-direction: column;
  }
  layer-buttons-card .layer-button-content {
    flex-grow: 1;
    display: flex;
    flex-direction: row;
  }
  .layer-button-list {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: center;
  }
  `,
  // Note that there is also a message property managed by the MessageHandler mixin
  properties: {
    model: {},
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
      if (this.model.contentModel) {
        const child = this.createElement('layer-card-view', {
          message: this.model.message,
          rootPart: this.model.contentModel.part,
          model: this.model.contentModel,
          parentNode: this.nodes.content,
          name: 'subcard',
        });
      } else {
        this.classList.add('layer-button-card-no-content');
      }

      this.model.buttons.forEach((button) => {
        let widget;
        switch(button.type) {
          case 'action':
            widget = this.createElement('layer-action-button', {
              text: button.text,
              tooltip: button.tooltip,
              event: button.event,
              data: button.data,
            });
            break;
          case 'url':
            widget = this.createElement('layer-url-button', {
              text: button.text,
              url: button.url,
            });
            break;
        }
        this.nodes.buttons.appendChild(widget);
      });
    },

    /**
     *
     * @method
     */
    onRender() {

    },

    runAction(options) {
      if (this.nodes.subcard) {
        this.nodes.subcard.runAction(options);
        return true;
      }
    }
  },
});