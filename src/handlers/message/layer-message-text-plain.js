/**
 * The Layer Plain Text MessageHandler renders a single text/plain message part.
 *
 * See layerUI.registerTextHandler for details on adding new text processing capabilities.
 *
 * @class layerUI.handlers.message.TextPlain
 * @extends layerUI.components.Component
 */
import { registerMessageComponent } from '../../components/component';
import MessageHandler from '../../mixins/message-handler';

registerMessageComponent('layer-message-text-plain', {
  mixins: [MessageHandler],
  properties: {
    label: {
      label: 'Text',
    },
  },
  methods: {
    /**
     * This component can render any message that starts with text/plain message part
     *
     * @method
     */
    handlesMessage(message, container) {
      return message.parts[0].mimeType === 'text/plain';
    },

    /**
     * Replaces any html tags with escaped html tags so that the recipient
     * sees tags rather than rendered html.
     *
     * @method
     * @private
     */
    _fixHtml(body) {
      body = body.replace(/</g, '&lt;');
      body = body.replace(/>/g, '&gt;');
      return body;
    },

    /**
     * Format the text and render it.
     *
     * Iterates over all Text Handlers allowing each to modify the `text` property, as well as to append values to `afterText`
     *
     * Renders the results after all TextHandlers have run.
     *
     * @method
     */
    onRender() {
      if (!layerUI.textHandlersOrdered) this._setupOrderedHandlers();

      const text = this.message.parts[0].body;
      const textData = {
        text: this._fixHtml(text),
        afterText: [],
      };
      let afterText = '';

      layerUI.textHandlersOrdered.forEach(handler => handler(textData, this.message));

      if (textData.afterText.length) {
        const startDiv = '<div class="layer-message-text-plain-after-text">';
        afterText = startDiv + textData.afterText.join('</div>' + startDiv) + '</div>';
        this.classList.add('layer-message-text-plain-has-after-text');
      }
      this.innerHTML = textData.text + afterText;
    },

    /**
     * Order the Text handlers if they haven't previously been sorted.
     *
     * This is run as a method, but is treated more like a run-once static method.
     *
     * @method
     * @private
     */
    _setupOrderedHandlers() {
      layerUI.textHandlersOrdered = Object.keys(layerUI.textHandlers).filter(handlerName =>
        layerUI.textHandlers[handlerName].enabled)
      .map(handlerName => layerUI.textHandlers[handlerName])
      .sort((a, b) => {
        if (a.order > b.order) return 1;
        if (b.order > a.order) return -1;
        return 0;
      })
      .map(handlerObj => handlerObj.handler);
    },
  },
});

