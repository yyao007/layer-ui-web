/**
 *
 * @class layerUI.handlers.message.CardView
 * @extends layerUI.components.Component
 */
import { registerComponent } from '../../components/component';
import CardMixin from '../card-mixin';
import CardPrimitiveMixin from '../card-primitive-mixin';
import Base from '../../base';

registerComponent('layer-text-card', {
  style: `layer-text-card {
    display: block;
  }
  `,
  mixins: [CardMixin, CardPrimitiveMixin],
  // Note that there is also a message property managed by the MessageHandler mixin
  properties: {
    html: {
      set(html) {
        this.innerHTML = html;
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

    onAfterCreate() {
      this._processText();
    },

    /**
     *
     * @method
     */
    onRender() {

    },

    onRerender() {
      if (!this.model.title && !this.model.author) {
        this.classList.remove('layer-standard-card');
      }
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
     * Order the Text handlers if they haven't previously been sorted.
     *
     * This is run as a method, but is treated more like a run-once static method.
     *
     * @method
     * @private
     */
    _setupOrderedHandlers() {
      Base.textHandlersOrdered = Object.keys(Base.textHandlers).filter(handlerName =>
        Base.textHandlers[handlerName].enabled)
      .map(handlerName => Base.textHandlers[handlerName])
      .sort((a, b) => {
        if (a.order > b.order) return 1;
        if (b.order > a.order) return -1;
        return 0;
      });
    },

    _processText() {
      if (!Base.textHandlersOrdered) this._setupOrderedHandlers();

      const text = this.model.text;
      const textData = {
        text: this._fixHtml(text),
        afterText: [],
        afterClasses: [],
      };

      // Iterate over each handler, calling each handler.
      // Perform a cheap trick until we can update our API so that
      // css classes can be associated with each item.
      // This is a cheap trick because a TextHandler could arbitrarily edit the `afterText` array,
      // removing previously added elements.  And this code would then break.
      Base.textHandlersOrdered.forEach((handlerDef) => {
        const afterText = textData.afterText.concat([]);
        // handlerDef.handler(textData, this.message, Boolean(this.parentComponent && this.parentComponent.isMessageListItem));
        // const last = textData.afterText[textData.afterText.length - 1];
        // if (afterText.indexOf(last) === -1) {
        //   textData.afterClasses[textData.afterText.length - 1] = 'layer-message-text-plain-' + handlerDef.name;
        // }
      });
      this.html = textData.text;

      if (textData.afterText.length && this.parentComponent && this.parentComponent.isMessageListItem) {
        textData.afterText.forEach((textItem, i) => {
          const div = document.createElement('div');
          div.classList.add('layer-message-text-plain-after-text');
          div.classList.add(textData.afterClasses[i]);
          div.innerHTML = textItem;
          if (div.firstChild.properties) div.firstChild.properties.parentComponent = this;
          this.appendChild(div);
        });
      }
    }
  },
});