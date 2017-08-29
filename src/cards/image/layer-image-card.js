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
    parentComponent: {
      set() {
        this.onRerender();
      },
    },
  },
  methods: {
    onCreate() {
      this.isHeightAllocated = false;
    },

    /**
     * Render the Message.
     *
     * Primarily, this method determines whether to call _renderCanvas on the preview or the image.
     *
     * @method
     * @private
     */
    onRerender() {
      // wait until the parentComponent is a Card Container
      if (this.parentComponent.tagName === 'LAYER-CARD-VIEW') return;

      // maxSizes should be removed
      const width = this.model.previewWidth || this.model.width;
      const height = this.model.previewHeight || this.model.height;

      const isSmallImage = width < 350;
      const isSmallAndWideImage = isSmallImage && width > height;
      this.toggleClass('layer-image-card-small-image', isSmallImage && !isSmallAndWideImage);

      const maxWidth = this.parentComponent.getPreferredMaxWidth();
      const maxHeight = this.parentComponent.getPreferredMaxHeight();

      if (this.model.source || this.model.preview) {
        this.model.getBlob(blob => this._renderCanvas(blob));
      } else {
        while (this.firstChild) this.removeChild(this.firstChild);
        const img = this.createElement('img', {
          classList: isSmallImage ? [] : ['layer-top-content-for-border-radius'],
          parentNode: this,
        });
        img.addEventListener('load', evt => (this.isHeightAllocated = true));
        img.src = this.model.previewUrl || this.model.sourceUrl;
        img.style.maxWidth = maxWidth + 'px';
        img.style.maxHeight = maxHeight + 'px';
      }
    },


    /**
     * Rendering Rules:
     *
     * * Images whose height is less than width and width is less than 192px are scaled to 192px
     * * Images whose height is greater than width and width is less than 192px are scaled to height 192px?
     * * Images whose width and height are equal, and less than 192px should be scaled up to 192px
     * * Images between 192-350 are sized as-is
     * * However, if there is metadata, scale images up to 350px
     *
     * @param {*} blob
     */
    _renderCanvas(blob) {
      let width = this.model.previewWidth || this.model.width;
      let height = this.model.previewHeight || this.model.height;
      const minWidth = this.parentComponent.getPreferredWidth();
      const minHeight = this.parentComponent.getPreferredMinHeight();
      const maxWidth = this.parentComponent.getPreferredMaxWidth();
      const maxHeight = this.parentComponent.getPreferredMaxHeight();

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
          options.maxWidth = maxWidth;
          options.maxHeight = maxHeight;

          // Write the image to a canvas with the specified orientation
          ImageManager(blob, (canvas) => {
            if (canvas instanceof HTMLElement) {
              if (width < minWidth && height < minHeight) {
                if (width > height) {
                  canvas = ImageManager.scale(canvas, { minWidth });
                } else {
                  canvas = ImageManager.scale(canvas, { minHeight });
                }
              }

              while (this.firstChild) this.removeChild(this.firstChild);
              this.appendChild(canvas);
              this.isHeightAllocated = true;
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
