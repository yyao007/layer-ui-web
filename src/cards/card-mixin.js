import { registerComponent } from '../components/component';

module.exports = {
  properties: {
    model: {
      set(model, oldModel) {
        if (oldModel) oldModel.off(null, null, this);
        if (model) model.on('change', this.onRerender, this);
      },
    },
    cardBorderStyle: {
    },
    cardView: {},
    // One of:
    // "full-card": Uses all available width
    // "chat-bubble": No minimum, maximum is all available width; generallay does not look like a card
    // "flex-card": card that has a minimum and a maximum but tries for an optimal size for its contents
    widthType: {},
    isHeightAllocated: {
      value: true,
      set(value) {
        if (value) {
          this.trigger('message-height-change');
        }
      },
    },
  },
  methods: {
    onRender: {
      mode: registerComponent.MODES.AFTER,
      value() {
        this.onRerender();
      },
    },
    onRerender() {
      if (this.cardView) {
        this.cardView.widthType = this.widthType || 'flex-card';
      }
    },
    generateCardView({ model, parentNode, cardContainerTagName, cssClassList, cardBorderStyle }) {
      const child = this.createElement('layer-card-view', {
        message: this.model.message,
        rootPart: model.part,
        model,
        parentNode,
        cardContainerTagName,
        cssClassList,
        cardBorderStyle,
      });

      return child;
    },
    setupContainerClasses() {
      this.parentComponent.toggleClass('layer-card-no-metadata',
        !this.model.getTitle() && !this.model.getDescription() && !this.model.getFooter());
    },
    onDestroy() {
      delete this.properties.cardView;
    },
  },
};
