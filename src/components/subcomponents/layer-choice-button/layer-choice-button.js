/**
 *
 * @class
 * @extends layerUI.components.Component
 */
import { registerComponent } from '../../component';
import Clickable from '../../../mixins/clickable';

registerComponent('layer-choice-button', {
  mixins: [Clickable],
  style: `layer-choice-button {
    display: flex;
    flex-direction: row;
    align-content: stretch;
  }
  layer-choice-button layer-action-button {
    cursor: pointer;
    flex-grow: 1;
    width: 50px; // flexbox bug
  }
  .layer-button-content > * {
    max-width: 100%;
    width: 100%;
  }
  `,
  // Note that there is also a message property managed by the MessageHandler mixin
  properties: {
    disabled: {
      type: Boolean,
      set(value) {
        for (let i = 0; i < this.childNodes.length; i++) this.childNodes[i].disabled = value;
      },
    },
    selected: {
      type: Boolean,
      set(value) {
        //this.toggleClass('layer-action-button-selected', value);
      },
    },
    model: {},
  },

  methods: {
    /**
     * @method
     */
    onCreate() {

    },

    onAfterCreate() {
      this.model.on('change', this.onRerender, this);
      this.properties.buttons = [];
      this.model.choices.forEach((choice) => {
        const widget = this.createElement('layer-action-button', {
          text: choice.text,
          tooltip: choice.tooltip,
          parentNode: this,
          data: { id: choice.id },
          icon: choice.icon,
        });

        const def = { widget, choice };
        this.properties.buttons.push(def);
        this.addClickHandler('button-click', widget, this._onClick.bind(this, def));

      });
    },

    onRender() {
      this.onRerender();
    },

    /**
     *
     * @method
     */
    onRerender() {
      this.toggleClass('layer-choice-card-complete', this.model.selectedAnswer);
      for (let i = 0; i < this.childNodes.length; i++) {
        const child = this.childNodes[i];
        child.disabled = this.model.selectedAnswer &&
          (!this.model.allowReselect || this.model.selectedAnswer === child.data.id && !this.model.allowDeselect);

        child.selected = this.model.selectedAnswer === child.data.id;
      }
    },


    _onClick({ choice, widget }, evt) {
      evt.preventDefault();
      evt.stopPropagation();

      // Select the answer
      this.model.selectAnswer(choice);

      // Trigger any other customized events as though this were an action button
      let cardView = this;
      while (cardView.tagName !== 'LAYER-CARD-VIEW' && cardView.parentComponent) {
        cardView = cardView.parentComponent;
      }
      if (cardView !== this) cardView.runAction({ event: this.model.responseName, data: this.model });
      evt.target.blur();
    },
  },
});
