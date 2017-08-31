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

registerComponent('layer-choice-label-card', {
  mixins: [CardMixin],
  template: `
    <div layer-id='question' class='layer-choice-card-question'></div>
    <div layer-id='answer' class='layer-choice-card-answer'></div>
  `,
  style: `
  layer-choice-label-card {
    display: flex;
    flex-direction: row;
  }
  layer-choice-label-card .layer-choice-card-answer {
    flex-grow: 1;
  }
  `,
  properties: {
    label: {
      value: 'Choices',
    },
  },
  methods: {
    onRerender() {
      this.nodes.question.innerHTML = this.model.question;
      const selectedChoice = this.model.choices.filter(choice => choice.id === this.model.selectedAnswer)[0];
      this.nodes.answer.innerHTML = selectedChoice ? selectedChoice.text : '';
      this.toggleClass('layer-choice-no-selection', !Boolean(selectedChoice));
    },
  },
});
