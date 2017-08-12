/**
 *
 * @class layerUI.handlers.message.CardView
 * @extends layerUI.components.Component
 */
import { registerComponent } from '../../components/component';
import { settings as UISettings } from '../../base';
import CardMixin from '../card-mixin';
import CardPrimitiveMixin from '../card-primitive-mixin';

import ImageManager from 'blueimp-load-image/js/load-image';
import 'blueimp-load-image/js/load-image-orientation';
import 'blueimp-load-image/js/load-image-meta';
import 'blueimp-load-image/js/load-image-exif';

import normalizeSize from '../../utils/sizing';

registerComponent('layer-image-card', {
  mixins: [CardMixin, CardPrimitiveMixin],
  style: `layer-image-card {
      display: block;
      overflow: hidden;
    }
    layer-card-view.layer-image-card > * {
      cursor: pointer;
    }
 `,
  properties: {

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

    /**
     * Render the Message.
     *
     * Primarily, this method determines whether to call _renderCanvas on the preview or the image.
     *
     * @method
     * @private
     */
    onRender() {
      // maxSizes should be removed
      let maxSizes = UISettings.maxSizes;
      const isSmallImage = this.model.width < 350;
      this.toggleClass('layer-image-card-small-image', isSmallImage);

      // TODO: Need to be able to customize this height, as well as the conditions (parentContainers) under which different sizes are applied.
      if (this.parentComponent && this.parentComponent.tagName === 'LAYER-NOTIFIER') {
        maxSizes = { height: Math.min(maxSizes.height, 140), width: maxSizes.width };
      };
      this.properties.sizes = normalizeSize(
        { width: this.model.width, height: this.model.height },
        { width: maxSizes.width, height: maxSizes.height }
      );
      //this.style.height = (UISettings.verticalMessagePadding + this.properties.sizes.height) + 'px';
      if (this.model.source || this.model.preview) {
        this.model.getBlob((blob) => this._renderCanvas(blob));
      } else {
        while (this.firstChild) this.removeChild(this.firstChild);
        const img = this.createElement('img', {
          classList: isSmallImage ? [] : ['layer-top-content-for-border-radius'],
          src: this.model.previewUrl || this.model.sourceUrl,
          parentNode: this,
        });
        img.style.maxWidth = '350px';
        img.style.maxHeight = this.properties.sizes.height + 'px';
      }
    },

    _renderCanvas(blob) {
      const isSmallImage = this.model.width < 350;

      // Read the EXIF data
      ImageManager.parseMetaData(
        blob, (data) => {
          const options = {
            canvas: true,
            orientation: this.model.orientation,
          };

          if (data.imageHead && data.exif) {
            options.orientation = data.exif.get('Orientation') || 1;
          }
          options.maxWidth = this.model.width; //options.minWidth = this.properties.sizes.width + 1;
          options.maxHeight = this.model.height; //options.minHeight = this.properties.sizes.height;

          // Write the image to a canvas with the specified orientation
          ImageManager(blob, (canvas) => {
            if (!isSmallImage) canvas.classList.add('layer-top-content-for-border-radius');
            while (this.firstChild) this.removeChild(this.firstChild);
            if (canvas instanceof HTMLElement) {
              this.appendChild(canvas);
            } else {
              console.error(canvas);
            }
          }, options);
        },
      );
    },

    handleContainerEvent(name, evt) {
      switch (name) {
        case 'click':
        case 'tap':
          this.model.getBestQualityUrl(url => window.open(url));
          break;
      }
    },
  },
});
