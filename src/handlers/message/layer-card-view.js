/**
 *
 * @class layerUI.handlers.message.CardView
 * @extends layerUI.components.Component
 */
import { registerMessageComponent } from '../../components/component';
import MessageHandler from '../../mixins/message-handler';

const actionHandlers = {};

module.exports = {
  addActionHandler(actionName, handler) {
    actionHandlers[actionName] = handler;
  },
};

registerMessageComponent('layer-card-view', {
  mixins: [MessageHandler],
  style: `layer-card-view {
    display: inline-flex;
    flex-direction: row;
    align-items: stretch;
    position: relative;
  }
  `,

   // Note that there is also a message property managed by the MessageHandler mixin
  properties: {
    model: {},
    label: {
      get() {
        return this.model.label;
      },
    },
    rootPart: {},
    message: {
      set(message) {
        this.innerHTML = '';
        if (message) {
          if (this.properties._internalState.onAfterCreateCalled) {
            this.setupMessage();
          }
        }
      },
    },

    /**
     * This property primarily exists so that one can set/override the cardContainerTagName on
     * individual Card UIs.
     *
     * Currently can only be used to replace 'layer-standard-card-container' with a custom value.
     *
     * @type {String}
     */
    cardContainerTagName: {
      noGetterFromSetter: true,
      set(inValue) {
        this.properties.cardContainerTagNameIsSet = true;
      },
      get() {
        const result = this.nodes.ui.cardContainerTagName;
        if (result === 'layer-standard-card-container' && this.properties.cardContainerTagNameIsSet) {
          return this.properties.cardContainerTagName;
        } else {
          return result;
        }
      },
    },

    /**
     * Possible values are:
     *
     * * standard: full border with rounded corners
     * * list: top border only, no radius
     * * rounded-top: full border, rounded top, square bottom
     * * rounded-bottom: full border, rounded bottom, square top
     * * none: no border
     */
    cardBorderStyle: {
      set(newValue, oldValue) {
        if (oldValue) {
          this.classList.remove('layer-card-border-' + oldValue);
        }
        if (newValue) {
          this.classList.add('layer-card-border-' + newValue);
        }
      }
    },
  },
  methods: {
    /**
     * This component can render any message that starts with text/plain message part
     *
     * @method
     * @static
     */
    handlesMessage(message, container) {
      return Boolean(message.getPartsMatchingAttribute({ role: 'root' })[0]);
    },

    /**
     * Can be rendered in a concise format required for Conversation Last Message and Layer Notifier
     *
     * @method
     */
    canRenderConcise(message) {
      return this.nodes && this.nodes.ui ? this.nodes.ui.canRenderConcise(message) : false;
    },

    onCreate() {
      this.addEventListener('click', this.handleSelection.bind(this));
      this.addEventListener('tap', this.handleSelection.bind(this));
    },

    onAfterCreate() {
      if (this.message) this.setupMessage();
    },

    setupMessage() {
      // The rootPart is typically the Root Part of the message, but the Card View may be asked to render subcards
      // in which case its rootPart property will be preset
      const rootPart = this.message.getPartsMatchingAttribute({ role: 'root' })[0];
      if (!this.rootPart) {
        this.rootPart = rootPart;
      }
      if (!this.rootPart) return;

      // Clearly differentiate a top level Root Part from subparts using the layer-root-card css class
      if (this.rootPart === rootPart) this.classList.add('layer-root-card');

      if (!this.model) this.model = this.client.createCardModel(this.message, this.rootPart);
      if (!this.model) return;

      const cardUIType = this.model.currentCardRenderer;
      this.classList.add(cardUIType);
      const cardUI = this.createElement(cardUIType, {
        model: this.model,
        cardView: this,
      });
      this.nodes.ui = cardUI;

      const cardContainerClass = this.cardContainerTagName;
      if (this.cardContainerTagName) this.classList.add(this.cardContainerTagName);
      if (cardUI.isCardPrimitive) this.classList.add('layer-card-primitive');
      if (cardContainerClass) {
        const cardContainer = this.createElement(cardContainerClass, {
          model: this.model,
          ui: cardUI,
          parentNode: this,
          name: 'cardContainer',
        });
        cardContainer.ui = cardUI;
        cardUI.parentComponent = cardContainer;
        cardUI.setupContainerClasses();
        this.cardBorderStyle = this.properties.cardBorderStyle || cardContainer.cardBorderStyle || 'standard';
      } else {
        this.appendChild(cardUI);
        this.cardBorderStyle = this.properties.cardBorderStyle || cardUI.cardBorderStyle || 'standard';
      }
    },

    /**
     *
     * @method
     */
    onRender() {

    },

    onRerender() {

    },


    handleSelection(evt) {
      evt.preventDefault();
      evt.stopPropagation();
      this.runAction();
    },

    runAction(options) {
      if (this.nodes.ui.runAction && this.nodes.ui.runAction(options)) return;

      const event = options && options.event ? options.event : this.model.actionEvent;
      const actionData = options && options.data ? options.data : this.model.actionData; // TODO: perhaps merge options.data with actionData?

      if (actionHandlers[event]) return actionHandlers[event].apply(this, [actionData]);
      const rootPart = this.message.getPartsMatchingAttribute({'role': 'root'})[0];
      const rootModel = this.client.getCardModel(rootPart.id);
      this.nodes.ui.trigger(event, {
        model: this.model,
        rootModel,
        data: actionData,
      });
    },
  },
});

