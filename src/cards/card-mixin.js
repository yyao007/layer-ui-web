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
    container: {},
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
        message:  this.model.message,
        rootPart: model.part,
        model,
        parentNode,
        cardContainerTagName,
        cssClassList,
        cardBorderStyle,
      });

      return child;
    },
    setupContainerClasses(container) {
      this.container = container;
      container.classList[!this.model.getTitle() && !this.model.getDescription() && !this.model.getFooter() ? 'add' : 'remove']('layer-card-no-metadata');
    },
  },
};

