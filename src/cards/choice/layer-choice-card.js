/**
 *
 *
 *
 * @class layerUI.handlers.message.ChoiceModel
 * @extends layerUI.components.Component
 */
import { registerComponent } from '../../components/component';

import CardMixin from '../card-mixin';
import '../../components/subcomponents/layer-action-button/layer-action-button';

registerComponent('layer-choice-card', {
  mixins: [CardMixin],
  template: `
    <div layer-id='question' class='layer-choice-card-question'></div>
    <div layer-id='answers' class='layer-choice-card-answers'></div>
  `,
  style: `
  layer-choice-card .layer-choice-card-answers {
    display: flex;
    flex-direction: column;
  }

  `,
  //layerCardId: 'layer-choice-card',
  properties: {
    label: {
      value: 'Choices',
    },
    cardContainerTagName: {
      noGetterFromSetter: true,
      value: 'layer-titled-card-container',
    },
    widthType: {
      value: 'flex-card',
    },
  },
  methods: {
    /**
     * Can be rendered in a concise format required for Conversation Last Message and Layer Notifier
     *s
     * @method
     */
    canRenderConcise(message) {
      return false;
    },

    getIconClass() {
      return 'layer-poll-card-icon';
    },
    getTitle() {
      return this.model.title;
    },


    onAfterCreate() {
      this.nodes.question.innerHTML = this.model.question;
      this.model.choices.forEach((choice) => {
        const button = this.createElement('layer-action-button', {
          text: choice.text,
          event: 'layer-choice-select',
          data: { id: choice.id },
          icon: choice.icon,
          parentNode: this.nodes.answers,
        });
      });
    },

    onRerender() {
      this.toggleClass('layer-choice-card-complete', this.model.selectedAnswer);
      let selectedAnswer;
      if (this.model.selectedAnswer) {
        if (this.model.allowMultiselect) {
          selectedAnswer = (this.model.selectedAnswer || '').split(/,/);
        } else {
          selectedAnswer = [ this.model.selectedAnswer ];
        }
      }
      for (let i = 0; i < this.nodes.answers.childNodes.length; i++) {
        const child = this.nodes.answers.childNodes[i];
        const isSelected = selectedAnswer.indexOf(child.data.id) !== -1;
        if (this.model.allowDeselect || !selectedAnswer || this.allowReselect && !isSelected) {
          child.disabled = false;
        } else if (this.allowReselect && isSelected || !this.allowReselect && selectedAnswer.length) {
          child.disabled = true;
        } else {
          child.disabled = false;
        }
        child.selected = isSelected;
      }
    },

    onChoiceSelect(data) {
      this.model.selectAnswer(data);
    },

    runAction({ event, data }) {
      if (event === 'layer-choice-select') {
        this.onChoiceSelect(data);
      }
    },
  },
});
