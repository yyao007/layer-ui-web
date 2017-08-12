/**
 *
 * @class
 * @extends layerUI.components.Component
 */
import { registerComponent } from '../../components/component';
import { animatedScrollLeftTo } from '../../base';

registerComponent('layer-carousel-card', {
  template: `
    <span layer-id='prev' class="layer-next-icon layer-previous-icon" ></span>
    <div class="layer-carousel-card-items" layer-id="items"></div>
    <span layer-id='next' class="layer-next-icon" ></span>
  `,
  style: `
  layer-carousel-card {
    display: flex;
    flex-direction: row;
    align-items: center;
    max-width: 100%;
    position: relative;
  }
  layer-carousel-card .layer-next-icon {
    display: inline-block;
    z-index: 10;
    position: absolute;
    cursor: pointer;
  }

  layer-carousel-card.layer-carousel-end .layer-next-icon:not(.layer-previous-icon) {
    display: none;
  }
  layer-carousel-card.layer-carousel-start .layer-previous-icon {
    display: none;
  }
  .layer-carousel-card-items {
    display: flex;
    flex-direction: row;
    align-items: stretch;
    overflow-x: hidden;
  }
  .layer-carousel-card-items:after {
    content: "";
    flex: 0 0 5px;
  }
  .layer-carousel-card-items > * {
    flex-grow: 1;
  }
  `,
  // Note that there is also a message property managed by the MessageHandler mixin
  properties: {
    model: {},
  },
  methods: {
    /**
     * Can be rendered in a concise format required for Conversation Last Message and Layer Notifier
     *
     * @method
     */
    canRenderConcise(message) {
      return false;
    },

    onCreate() {
      this.nodes.next.addEventListener('click', this._scroll.bind(this, true));
      this.nodes.prev.addEventListener('click', this._scroll.bind(this, false));
    },
    onAfterCreate() {
      this.model.items.forEach((item) => {
        this.createElement('layer-card-view', {
          message: this.model.message,
          rootPart: item.part,
          model: item,
          parentNode: this.nodes.items,
        });
      });
      this.classList.add('layer-carousel-start');
    },

    onAttach() {
      if (this.nodes.items.scrollWidth === this.nodes.items.clientWidth) {
        this.classList.add('layer-carousel-end');
      }
    },

    // TODO:
    // 1. animated scroll
    // 2. scroll at 50-100% of width,
    // 3. Stop scrolling when a card is flush to the left or 100% is reached
    _scroll(isForward, evt) {
      evt.preventDefault();
      evt.stopPropagation();
      const root = this.nodes.items;
      const nodes = root.childNodes;
      const currentScroll = root.scrollLeft;

      if (isForward) {
        const lastVisible = this._findLastFullyVisibleCard();
        const lastVisibleIndex = Array.prototype.indexOf.call(root.childNodes, lastVisible);
        if (lastVisible && lastVisibleIndex !== -1 && lastVisibleIndex < root.childNodes.length - 1) {
          const scrollTo = nodes[lastVisibleIndex + 1].offsetLeft;
          animatedScrollLeftTo(root, scrollTo, 200);
          this.classList.remove('layer-carousel-start');
          const lastChild = nodes[nodes.length - 1];
          this.toggleClass('layer-carousel-end', this._findLastFullyVisibleCard(scrollTo) === lastChild);
        }
      } else {
        this.classList.remove('layer-carousel-end');
        const firstVisible = this._findFirstFullyVisibleCard();
        const firstVisibleIndex = Array.prototype.indexOf.call(nodes, firstVisible);
        if (firstVisibleIndex > 0) {
          const rightMostCard = nodes[firstVisibleIndex - 1];
          const minScrollLeft = rightMostCard.offsetLeft - root.clientWidth + rightMostCard.clientWidth + 10;
          for (let i = 0; i <= firstVisibleIndex; i++) {
            const node = nodes[i];
            const scrollTo = node.offsetLeft;
            if (scrollTo > minScrollLeft) {
              animatedScrollLeftTo(root, scrollTo, 200);
              this.toggleClass('layer-carousel-start', scrollTo <= nodes[0].offsetLeft);
              break;
            }
          }
        }
      }
    },

    _findLastFullyVisibleCard(optionalScroll) {
      const root = this.nodes.items;
      if (!optionalScroll) optionalScroll = root.scrollLeft;
      const nodes = root.childNodes;
      for (let i = nodes.length - 1; i >= 0; i--) {
        const node = nodes[i];
        if ((node.offsetLeft + node.clientWidth) <= (root.offsetLeft + root.clientWidth + optionalScroll)) return node;
      }
    },

    _findFirstFullyVisibleCard() {
      const root = this.nodes.items;
      const nodes = root.childNodes;
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (node.offsetLeft >= root.offsetLeft + root.scrollLeft) return node;
      }
    },

    /**
     *
     * @method
     */
    onRender() {

    },
  },
});
