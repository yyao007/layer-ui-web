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
  },
  methods: {
    onRender: {
      mode: registerComponent.MODES.AFTER,
      value() {
        this.onRerender();
      },
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
