/*
   imgBase64 = "iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAECElEQVR4Xu2ZO44TURREa0SAWBASKST8xCdDQMAq+OyAzw4ISfmLDBASISERi2ADEICEWrKlkYWny6+77fuqalJfz0zVOXNfv/ER8mXdwJF1+oRHBDCXIAJEAPMGzONnA0QA8wbM42cDRADzBszjZwNEAPMGzONnA0QA8wbM42cDRADzBszjZwNEAPMGzONnA0QA8wbM42cDRADzBszjZwNEAPMGzONnA0QA8wbM42cDRADzBszjZwNEAPMGzONnA0QA8wbM42cDRADzBszjZwNEAPMGzONnA0QA8wbM42cDRADzBszjZwNEAPMGzONnA0QA8waWjX8OwHcAv5f9Me3fPRugvbuxd14C8B7AVwA3q0oQAcYwtr2+hn969faPVSWIAG2AT3rXJvz17CcAN6ptgggwrwDb4JeVIALMJ8AY/JISRIB5BGDhr3/aZwDXKxwHEWC6AJcBvAOwfuBjvuNfABcBfGGGl5yJANPabYV/B8DLaT96nndHgPYeu4c/RI8AbQJIwO9FgDMAfrVxWuRdMvB7EOA+gHsALgD4uQjO3b6pFPzqAjwA8HTF5weA8weWQA5+ZQGOw1//jR5SAkn4VQV4CODJls18CAmuAHjbcM8vc9U76ZSrdgt4BODxyLG8Twla4P8BcLfKPX/sEaeSAAz8fR4H8vArHQHXAHwYs3Xj9SU3gQX8SgKcAvBitTp38WAJCWzgVxJg+F0qSGAFv5oAh5bADn5FAQ4lwVUAb3a86nX1tL/tXK10Czj+O+7zOLCFX3UDrEXYhwTW8KsLsPRx0Ap/+A/fq12uKpVnqx4BSx8Hgb9quAcB5t4EgX/sz6sXAeaSIPA3zqOeBJgqwTMAzxuuelJn/ubzSG8CTJFg12ex4Z4vDb+HW8A2aK1XRFYCC/g9C7DkJrCB37sAS0hgBV9BgDklGODfBvCaPScU5np8CPxf71OfCSzhq2yAqZ8d2MJXE6DlOLCGryjALhLYw1cVgJEg8Dv7MKjlgXvbg2Hgd/ph0BwSBH7nHwZNkeCW4z1/rDCV/wOM5RyOg7MAvo0Nur3uIoAbVzpvBKCr0hyMAJpc6VQRgK5KczACaHKlU0UAuirNwQigyZVOFQHoqjQHI4AmVzpVBKCr0hyMAJpc6VQRgK5KczACaHKlU0UAuirNwQigyZVOFQHoqjQHI4AmVzpVBKCr0hyMAJpc6VQRgK5KczACaHKlU0UAuirNwQigyZVOFQHoqjQHI4AmVzpVBKCr0hyMAJpc6VQRgK5KczACaHKlU0UAuirNwQigyZVOFQHoqjQHI4AmVzpVBKCr0hyMAJpc6VQRgK5KczACaHKlU0UAuirNwQigyZVOFQHoqjQHI4AmVzpVBKCr0hz8BzIXtYE3VcPnAAAAAElFTkSuQmCC";

  ImageModel = client.getCardModelClassForMimeType('application/vnd.layer.card.image+json')

  new ImageModel({
    source: layer.Util.base64ToBlob(imgBase64, 'image/png'),
    artist: 'PNG Generator',
    size: layer.Util.base64ToBlob(imgBase64, 'image/png').size,
    title: 'This is an image',
    subtitle: 'A beautiful image full of many many glorious pixels',
    width: 128,
    height: 128,
  }).generateMessage($("layer-conversation-view").conversation, message => message.send())

  new ImageModel({
    sourceUrl: "https://farm5.staticflickr.com/4272/34912460025_be2700d3e7_k.jpg",
    artist: "unknown photographer",
    title: "Source URL Test",
    subtitle: "Ooooh, Pretty..."
  }).generateMessage($("layer-conversation-view").conversation, message => message.send())
*/
import ImageManager from 'blueimp-load-image/js/load-image';
import 'blueimp-load-image/js/load-image-orientation';
import 'blueimp-load-image/js/load-image-meta';
import 'blueimp-load-image/js/load-image-exif';
import normalizeSize from '../../utils/sizing';

import Layer, { Root, Client, MessagePart, Util, xhr, CardModel }  from 'layer-websdk';

class ImageModel extends CardModel {
  constructor(options = {}) {
    super(options);
    if (!this.message) {
      if (this.source) {
        this.source = new MessagePart(this.source);
      }
      if (this.preview) {
        this.preview = new MessagePart(this.preview);
      }
    }
  }
  _generateParts(callback) {
    if (this.source && !this.mimeType) this.mimeType = this.source.type;
    const body = this._initBodyWithMetadata(['sourceUrl','previewUrl', 'artist', 'fileName', 'orientation',
      'width', 'height', 'previewWidth', 'previewHeight', 'title', 'subtitle', 'action']);
    if (body.source) body.source = new MessagePart(body.source);
    this.part = new MessagePart({
      mimeType: this.constructor.MIMEType,
      body: JSON.stringify(body),
    });
    if (this.source && !this.preview && !this.previewUrl) {
      if (!this.fileName) this.fileName = this.source.name;
      this._gatherMetadataFromEXIF(this.source.body, () => {
        this._generatePreview(this.source.body, () => {
          const parts = [this.part];
          if (this.source) {
            parts.push(this.source);
            this.source.mimeAttributes.role = 'source';
            this.source.mimeAttributes['parent-node-id'] = this.part.mimeAttributes['node-id'];
          }
          if (this.preview) {
            parts.push(this.preview);
            this.preview.mimeAttributes.role = 'preview';
            this.preview.mimeAttributes['parent-node-id'] = this.part.mimeAttributes['node-id'];
          }
          callback(parts);
        });
      });
    } else {
      if (!this.title && this.sourceUrl) this.title = this.sourceUrl.replace(/^.*\//, '');
      if (!this.title && this.previewUrl) this.title = this.previewUrl.replace(/^.*\//, '');
      callback([this.part]);
    }
  }

  _parseMessage() {
    super._parseMessage();

    const payload = JSON.parse(this.part.body);
    Object.keys(payload).forEach((propertyName) => {
      this[Util.camelCase(propertyName)] = payload[propertyName];
    });

    this.childParts.forEach((part) => {
      switch(part.mimeAttributes.role) {
        case 'source':
          this.source = part;
          part.on('messageparts:change', () => this.trigger('change'), this);
          break;
        case 'preview':
          this.preview = part;
          part.on('messageparts:change', () => this.trigger('change'), this);
          break;
      }
    });
  }

  getBlob(callback) {
    if (this.preview) {
      if (this.preview.body) return callback(this.preview.body);
      this.preview.fetchContent(data => callback(data));
    } else if (this.source) {
      if (this.source.body) return callback(this.source.body);
      this.source.fetchContent(data => callback(data));
    } else if (this.previewUrl || this.sourceUrl) {
      xhr({
        url: this.previewUrl || this.sourceUrl,
        responseType: 'blob',
      }, (result) => {
        if (result.success) {
          callback(result.data);
        }
      });
    }
  }


  getDescription() { return this.subtitle; }
  getFooter() { return this.artist; }


  _gatherMetadataFromEXIF(file, callback) {
    ImageManager.parseMetaData(file, onParseMetadata.bind(this));

    function onParseMetadata(data) {

      if (data.imageHead && data.exif) {
        this.orientation = data.exif.get('Orientation');
        this.width = data.exif.get('ImageWidth');
        this.height = data.exif.get('ImageHeight');
        this.artist = data.exif.get('Artist');
        this.description = data.exif.get('ImageDescription') || data.exif.get('UserComment');
      }
      callback();
    }
  }

  _generatePreview(file, callback) {
    const options = {
      canvas: true,
      orientation: this.orientation || 0,
    };

    ImageManager(file, (srcCanvas) => {
      const blob = this._postGeneratePreview(srcCanvas);
      this.preview = new MessagePart(blob);
      callback(this.preview);
    }, options);
  }
  _postGeneratePreview(srcCanvas) {
    this.width = srcCanvas.width;
    this.height = srcCanvas.height;

    const size = normalizeSize({ width: this.width, height: this.height }, { width: 450, height: 450 });
    const canvas = document.createElement('canvas');
    this.previewWidth = canvas.width = size.width;
    this.previewHeight = canvas.height = size.height;
    const context = canvas.getContext('2d');

    context.fillStyle = context.strokeStyle = 'white';
    context.fillRect(0, 0, size.width, size.height);
    context.drawImage(srcCanvas, 0, 0, size.width, size.height);

    // Turn the canvas into a jpeg image for our Preview Image
    const binStr = atob(canvas.toDataURL('image/jpeg').split(',')[1]);
    const len = binStr.length;
    const arr = new Uint8Array(len);

    for (let i = 0; i < len; i++) {
      arr[i] = binStr.charCodeAt(i);
    }
    return new Blob([arr], { type: 'image/jpeg' });
  }

  __getUrl() {
    if (this.source) {
      return this.source.url; // doesn't handle expiring content yet
    } else if (this.sourceUrl) {
      return this.sourceUrl;
    } else if (this.preview) {
      return this.preview.url; // doesn't handle expiring content yet
    } else if (this.previewUrl) {
      return this.previewUrl;
    }
  }
}

ImageModel.prototype.title = '';
ImageModel.prototype.fileName = ''; // Adding this to the model is not according to spec, but allows us to preserve this info when a user uploads a file without it forcing it to render metadata that isn't important.
ImageModel.prototype.subtitle = '';
ImageModel.prototype.sourceUrl = '';
ImageModel.prototype.previewUrl = '';
ImageModel.prototype.orientation = '';
ImageModel.prototype.artist = '';
ImageModel.prototype.preview = null;
ImageModel.prototype.source = null;
ImageModel.prototype.width = 350;
ImageModel.prototype.height = 350;
ImageModel.prototype.previewWidth = 350;
ImageModel.prototype.previewHeight = 350;
ImageModel.prototype.url = '';

ImageModel.defaultAction = 'open-url';
ImageModel.cardRenderer = 'layer-image-card';
ImageModel.MIMEType = 'application/vnd.layer.card.image+json';
Root.initClass.apply(ImageModel, [ImageModel, 'ImageModel']);
MessagePart.TextualMimeTypes.push(ImageModel.MIMEType);

// Register the Card Model Class with the Client
Client.registerCardModelClass(ImageModel, "ImageModel");

module.exports = ImageModel;
