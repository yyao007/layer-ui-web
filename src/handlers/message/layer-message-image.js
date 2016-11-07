/**
 * The Layer Image MessageHandler renders a single image, or an Atlas 3-message-part Image.
 *
 * One of the challenges in rendering images is that browser `<img />` tags do not follow EXIF data
 * for orientation, which results in sideways and upside down photos.  This Component uses `blueimp-load-image`
 * to write the image to a Canvas, parse its EXIF data and orient it appropriately.
 *
 * Image heights should be fixed; any change in height of the image will cause our scroll position to be shifted
 * (i.e. the numeric value of `scrollTop` will remain unchanged, but what is visible to the user at that position may change)
 *
 * @class layerUI.handlers.message.Image
 * @extends layerUI.components.Component
 */
var layerUI = require('../../base');
var LUIComponent = require('../../components/component');
var ImageManager = window.loadImage = require("blueimp-load-image/js/load-image");
require("blueimp-load-image/js/load-image-orientation.js");
require("blueimp-load-image/js/load-image-meta.js");
require("blueimp-load-image/js/load-image-exif.js");
var normalizeSize = require('../../utils/sizing');


LUIComponent('layer-message-image', {
  properties: {

    /**
     * The Message property provides the MessageParts we are going to render.
     *
     * @property {layer.Message}
     */
    message: {
      set: function(value){

        // Extract our image, preview and metadata message parts
        this.props.image = value.parts.filter(function(part) {return ['image/png', 'image/gif', 'image/jpeg'].indexOf(part.mimeType) !== -1;})[0];
        this.props.preview = value.parts.filter(function(part) {return part.mimeType === 'image/jpeg+preview';})[0];
        var meta = value.parts.filter(function(part) {return part.mimeType === 'application/json+imageSize';})[0];
        if (meta) this.props.meta = JSON.parse(meta.body);

        // If there is a preview and it doesn't have a body, fetch the preview body so we can pass it into the ImageManager.
        if (this.props.preview && this.props.image) {
          if (!this.props.preview.body) {
            this.props.preview.fetchContent();
            this.props.preview.on('content-loaded', this.render, this);
          }
          // TODO: remove body test once all websdk changes are merged and url is gaurenteed to have a value if body has a value
          // If image does not have a url, call fetchStream to get an updated url
          if (!this.props.image.url && !this.props.image.body) this.props.image.fetchStream();
        } else {
          // If there is no preview, only an image, we're going to pass it into the ImageManager so fetch its body
          if (!this.props.image.body) {
            this.props.image.fetchContent();
            this.props.image.on('content-loaded', this.render, this);
          }
        }


        // Render the Message
        this.render();
      }
    },
    // TODO: Add a simple wrapper to declare components and define these properties
    /**
     * Knowing the height of the list will help us determine a suitable size for the Image.
     *
     * @property {Number}
     */
    listHeight: {},

    /**
     * Knowing the width of the list will help us determine a suitable size for the Image.
     *
     * @property {Number}
     */
    listWidth: {},

    /**
     * Optional parameter to use for rendering images.
     *
     * @property {Boolean}
     */
    noPadding: {}
  },
  methods: {

    /**
     * Constructor.
     *
     * @method created
     * @private
     */
    created: function() {
      this.addEventListener('click', this.handleClick.bind(this));
    },

    /**
     * If the user clicks the image, and we have a full image part with a url, open it.
     *
     * @method
     * @private
     * @param {Event} evt
     */
    handleClick: function(evt) {
      if (this.parentNode.tagName !== 'LAYER-CONVERSATION-LAST-MESSAGE') {
        evt.preventDefault();
        if (this.props.image && this.props.image.url) window.open(this.props.image.url);
      }
    },

    /**
     * Render the Message.
     *
     * Primarily, this method determines whether to call renderCanvas on the preview or the image.
     *
     * @method
     * @private
     */
    render: function() {
      this.props.sizes = normalizeSize(this.props.meta, {width: 256, height: 256, noPadding: this.noPadding});
      this.style.width = this.props.sizes.width + 'px';
      this.style.height = this.props.sizes.height + 'px';
      if (this.props.preview && this.props.preview.body) {
        this.renderCanvas(this.props.preview.body);
      } else if (this.props.image && this.props.image.body) {
        this.renderCanvas(this.props.image.body);
      }
    },

    /**
     * Parse the EXIF data, determine the orientation and then generate a Canvas with a correctly oriented Image.
     *
     * Canvas is added as a child node.
     *
     * @method
     * @private
     * @param {Blob} blob
     */
    renderCanvas: function(blob) {
      // Read the EXIF data
      ImageManager.parseMetaData(
          blob,
          function (data) {
            var orientation = 1;
            var options = {
                canvas: true
            };

            if (data.imageHead && data.exif) {
                options.orientation = data.exif[0x0112] || 0;
            }
            options.maxWidth = options.minWidth = this.props.sizes.width;
            options.maxHeight = options.minHeight = this.props.sizes.height;

            // Write the image to a canvas with the specified orientation
            ImageManager(blob, function(canvas) {
                while(this.firstChild) this.removeChild(this.firstChild);
                if (canvas instanceof HTMLElement) {
                  this.appendChild(canvas);
                } else {
                  console.error(canvas);
                }
            }.bind(this), options);
          }.bind(this)
        );
      }
  }
});

/*
  * Handle any Message that contains an IMage + Preview + Metadata or is just an Image
  */
layerUI.registerMessageHandler({
  tagName: 'layer-message-image',
  label: '<i class="fa fa-file-image-o" aria-hidden="true"></i> Image message',
  handlesMessage: function(message, container) {
    var imageParts = message.parts.filter(function(part) {
      return ['image/png', 'image/gif', 'image/jpeg'].indexOf(part.mimeType) !== -1;
    }).length;
    var previewParts = message.parts.filter(function(part) {
      return part.mimeType === 'image/jpeg+preview';
    }).length;
    var metaParts = message.parts.filter(function(part) {
      return part.mimeType === 'application/json+imageSize';
    }).length;
    return (message.parts.length === 1 && imageParts ||
      message.parts.length === 3 && imageParts === 1 && previewParts === 1 && metaParts === 1);
  }
});


