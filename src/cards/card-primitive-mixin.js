import { registerComponent } from '../components/component';

module.exports = {
  properties: {
    isCardPrimitive: {
      value: true,
    },
    cardContainerTagName: {
      noGetterFromSetter: true,
      value: 'layer-standard-card-container',
    },
  },
};