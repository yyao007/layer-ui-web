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
 * @class layerUI.handlers.message.Video
 * @extends layerUI.components.Component
 */
var LUIComponent = require('../../components/component');
var normalizeSize = require('../../utils/sizing');
var layerUI = require('../../base');

LUIComponent('layer-message-video', {
  properties: {

    /**
     * The Message property provides the MessageParts we are going to render.
     *
     * @property {layer.Message}
     */
    message: {
      set: function(value){

        // Extract our video, preview and metadata message parts
        this.props.video = value.parts.filter(function(part) {return part.mimeType === 'video/mp4';})[0];
        this.props.preview = value.parts.filter(function(part) {return part.mimeType === 'image/jpeg+preview';})[0];
        var meta = value.parts.filter(function(part) {return part.mimeType === 'application/json+imageSize';})[0];
        if (meta) this.props.meta = JSON.parse(meta.body);

        this.props.sizes = normalizeSize(this.props.meta, {width: Number(this.listWidth), height: Number(this.listHeight), noPadding: this.noPadding});

        if (!this.props.video.url) this.props.video.fetchStream();
        if (!this.props.preview.url) this.props.preview.fetchStream();

        this.props.preview.on('url-loaded', this.render, this);
        this.props.video.on('url-loaded', this.render, this);

        // Render the Message
        this.render();
      }
    },

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
    listWidth: {}
  },
  methods: {


    /**
     * Render the Message.
     *
     * Primarily, this method determines whether to call renderCanvas on the preview or the image.
     *
     * @method
     * @private
     */
    render: function() {
      var videoPlayer = document.createElement('video');
      videoPlayer.width = this.props.sizes.width;
      videoPlayer.height = this.props.sizes.height;
      videoPlayer.src = this.props.video.url;
      if (this.props.preview) {
        videoPlayer.poster = this.props.preview.url;
      }
      videoPlayer.controls = true;
      while(this.firstChild) this.removeChild(this.firstChild);
      this.appendChild(videoPlayer);
    }
  }
});

/*
  * Handle any Message that contains a Video + Preview + Metadata or is just an Video
  */
layerUI.registerMessageHandler({
  tagName: 'layer-message-video',
  label: '<i class="fa fa-file-video-o" aria-hidden="true"></i> Video message',
  handlesMessage: function(message, container) {
    var videoParts = message.parts.filter(function(part) {return part.mimeType === 'video/mp4';}).length;
    var previewParts = message.parts.filter(function(part) {return part.mimeType === 'image/jpeg+preview';}).length;
    var metaParts = message.parts.filter(function(part) {return part.mimeType === 'application/json+imageSize';}).length;
    return (message.parts.length === 1 && videoParts || message.parts.length === 3 && videoParts === 1 && previewParts === 1 && metaParts === 1);
  }
});

