/**
 * The Start of Conversation which renders some customizable welcome message based on the Conversation
 *
 * TODO: Document this
 *
 * @class layerUI.components.subcomponents.Age
 * @extends layerUI.components.Component
 */
import { registerComponent } from '../../../components/component';

registerComponent('layer-start-of-conversation', {
  properties: {

    /**
     * Conversation that we are at the start of.
     *
     * @property {layer.Conversation}
     */
    conversation: {
      set(value) {
        this.nodes.startDate.date = value ? value.createdAt : null;
      },
    },
  },
});

