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
import Layer from 'layer-websdk'
import LayerUI from '../../base';

registerMessageComponent('layer-message-text-plain', {
  mixins: [MessageHandler],
  properties: {
    label: {
      label: 'Text',
    },
    textData: {},
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
     * Rerender any message that was rendered as a preview and is now no longer a preview.
     *
     * @method onSent
     */
    onSent() {
      this.onRender();
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
      if (!LayerUI.textHandlersOrdered) this._setupOrderedHandlers();

      const text = this.message.parts[0].body;
      const textData = {
        text: this._fixHtml(text),
        afterText: [],
        afterNodes: [],
      };
      let afterText = '';

      LayerUI.textHandlersOrdered.forEach((handler) => {
        handler(textData, this.message, this.parentComponent.isMessageItem);
      });
      this.textData = textData;

      // It would be nice to enable a preview of afterNodes, but
      // that would require handlers to keep track of afterText and afterNode they
      // have previously created.  This is a reasonable feature to add to
      // after-text-handler, but we don't actually mandate use of after-text-handler.
      if (this.parentComponent.isMessageItem && !this.message.isNew()) {
        if (textData.afterText.length || textData.afterNodes.length) {
          this.classList.add('layer-message-text-plain-has-after-text');
        }

        if (textData.afterText.length) {
          const startDiv = '<div class="layer-message-text-plain-after-text">';
          afterText = startDiv + textData.afterText.join('</div>' + startDiv) + '</div>';
        }
      }
      this.innerHTML = textData.text + afterText;

      if (this.properties._internalState.onAttachCalled && this.parentComponent.isMessageItem) {
        this.onRenderAfterNodes();
      }
    },

    onAttach() {
      if (this.parentComponent.isMessageItem) {
        this.onRenderAfterNodes();
      }
    },

    onRenderAfterNodes() {
      this.textData.afterNodes.forEach((node) => {
        if (node.parentNode) {
          debugger;
        } else if (!this.message.isNew()) {
          const sibling = this.parentComponent.nodes.content;
          node.message = this.message;
          node.messageWidget = this;
          node.parentComponent = this;
          node.classList.add('layer-message-text-plain-after-node');
          // const content = document.createElement('div');
          // const classes = sibling.className;
          // content.className = classes;
          // content.appendChild(node);
          node._onAfterCreate();
          if (sibling.parentNode.childNodes.length === 1) {
            sibling.parentNode.appendChild(node);
          } else {
            sibling.parentNode.insertBefore(node, sibling.nextSibling);
          }
        }
      });
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
      LayerUI.textHandlersOrdered = Object.keys(LayerUI.textHandlers).filter(handlerName =>
        LayerUI.textHandlers[handlerName].enabled)
      .map(handlerName => LayerUI.textHandlers[handlerName])
      .sort((a, b) => {
        if (a.order > b.order) return 1;
        if (b.order > a.order) return -1;
        return 0;
      })
      .map(handlerObj => handlerObj.handler);
    },
  },
});

