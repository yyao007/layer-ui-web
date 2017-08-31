/**
 *
 * @class
 * @extends layerUI.components.Component
 */
import { registerComponent } from '../../components/component';
import { animatedScrollLeftTo } from '../../base';
import CardMixin from '../card-mixin';
import Throttler from '../../mixins/throttler';

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
  `,

  mixins: [CardMixin, Throttler],

  // Note that there is also a message property managed by the MessageHandler mixin
  properties: {
    cardContainerTagName: {
      noGetterFromSetter: true,
      get() {
        return this.model.title ? 'layer-titled-card-container' : null;
      },
    },
    widthType: {
      value: 'flex-card',
    },
  },
  methods: {
    getIconClass() {
      return '';
    },
    getTitle() {
      return this.model.title;
    },

    onDestroy() {
      window.removeEventListener('resize', this.properties.onResize);
    },

    onCreate() {
      this.nodes.next.addEventListener('click', this._scroll.bind(this, true));
      this.nodes.prev.addEventListener('click', this._scroll.bind(this, false));
      this.properties.onResize = this._onResize.bind(this);
      window.addEventListener('resize', this.properties.onResize);
    },
    onRerender() {
      if (!this.properties._internalState.onAttachCalled) return;
      this._adjustCarouselWidth();

      // console.log("CAROUSEL onRERENDER");
      // TODO: Assign items ids so we don't need to blow away and then recreate them
      this.nodes.items.innerHTML = '';
      const maxCardWidth = this._getMaxCardWidth();
      this.model.items.forEach((item) => {
        // console.log('GENERATE: ' + item.id + '    ' + item.title);
        const card = this.createElement('layer-card-view', {
          message: this.model.message,
          rootPart: item.part,
          model: item,
          parentNode: this.nodes.items,
        });
        switch (card.widthType) {
          case 'full-card':
            card.style.width = card.style.minWidth = maxCardWidth + 'px';
            break;
          case 'flex-card':
            if (maxCardWidth < 600) {
              card.style.width = card.style.minWidth = maxCardWidth + 'px';
            } else {
              card.style.width = card.style.minWidth = '350px';
            }
            break;
        }
      });
      setTimeout(this._updateScrollButtons.bind(this), 10);
    },

    onAttach: {
      mode: registerComponent.MODES.AFTER,
      value() {
        setTimeout(this._updateScrollButtons.bind(this), 10);
        this.onRerender();
      },
    },
    _onResize() {
      this._throttler(() => this._adjustCarouselWidth());
    },
    _adjustCarouselWidth() {
      const parent = this.parentComponent.parentNode;
      if (!parent || !parent.clientWidth) return 0;
      const carouselWidth = Math.floor(parent.clientWidth * 0.9);
      if (carouselWidth) this.cardView.style.maxWidth = carouselWidth + 'px';
    },

    _getMaxCardWidth() {
      const parent = this.parentComponent.parentNode;
      if (!parent || !parent.clientWidth) return 0;
      let width = parent.clientWidth;
      if (width > 600) width = width * 0.6;
      else width = width * 0.8;
      return Math.min(500, width);
    },

    _updateScrollButtons() {
      this.toggleClass('layer-carousel-start', this.nodes.items.scrollLeft === 0);

      const lastVisible = this._findLastFullyVisibleCard();
      const children = this.nodes.items.childNodes;
      this.toggleClass('layer-carousel-end', lastVisible === children[children.length - 1]);
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

