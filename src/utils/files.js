import ImageManager from 'blueimp-load-image/js/load-image';
import 'blueimp-load-image/js/load-image-orientation';
import 'blueimp-load-image/js/load-image-meta';
import 'blueimp-load-image/js/load-image-exif';
import Layer from 'layer-websdk';
import { settings } from '../base';
import normalizeSize from './sizing';
import ImageModel from '../cards/image/image-model';
import FileModel from '../cards/file/file-model';
import CarouselModel from '../cards/carousel/carousel-model';

const Files = {};
module.exports = Files;

window.loadImage = ImageManager;


/**
 * This is a utility class which you can use to watch for user dragging and dropping
 * files from their file system into your app as part of a "Send Attached Message" action.
 *
 * ```
 * var dropWatcher = new layerUI.files.DragAndDropFileWatcher({
 *   node: dropBoxNode,
 *   allowDocumentDrop: false
 * });
 * function sendAttachment(messageParts) {
 *    currentConversation.createMessage({ parts: messageParts }).send();
 * }
 *
 * // If you finish with this component, call destroy to unsubscribe from all events and remove all pointers
 * dropWatcher.destroy();
 * ```
 *
 * @class layerUI.utils.files.DragAndDropFileWatcher
 * @param {Object} options
 * @param {HTMLElement|String} options.node - The dom node (or dom node ID) to watch for files/file-drag events
 * @param {Boolean} [options.allowDocumentDrop=false] - By default, this utility adds an event handler to prevent the browser from navigating away from your
 *         app to view a file dropped in some other part of your app. If you need to handle this event yourself, set this to true.
 */
Files.DragAndDropFileWatcher = function DragAndDropFileWatcher(options) {
  this.node = typeof options.node === 'string' ? document.getElementById(options.node) : options.node;
  this.allowDocumentDrop = Boolean(options.allowDocumentDrop);

  this.onDragOverBound = this.onDragOver.bind(this);
  this.onDragEndBound = this.onDragEnd.bind(this);
  this.onFileDropBound = this.onFileDrop.bind(this);
  this.ignoreDropBound = this.ignoreDrop.bind(this);

  // Tells the browser that we *can* drop on this target
  this.node.addEventListener('dragover', this.onDragOverBound, false);
  this.node.addEventListener('dragenter', this.onDragOverBound, false);

  this.node.addEventListener('dragend', this.onDragEndBound, false);
  this.node.addEventListener('dragleave', this.onDragEndBound, false);

  this.node.addEventListener('drop', this.onFileDropBound, false);

  if (!this.allowDocumentDrop) {
    document.addEventListener('drop', this.ignoreDropBound, false);
    document.addEventListener('dragenter', this.ignoreDropBound, false);
    document.addEventListener('dragover', this.ignoreDropBound, false);
  }
};


/**
 * Destroy this component, in particular, remove any handling of any events.
 *
 * @method
 */
Files.DragAndDropFileWatcher.prototype.destroy = function destroy() {
  this.node.removeEventListener('dragover', this.onDragOverBound, false);
  this.node.removeEventListener('dragenter', this.onDragOverBound, false);

  this.node.removeEventListener('dragend', this.onDragEndBound, false);
  this.node.removeEventListener('dragleave', this.onDragEndBound, false);

  this.node.removeEventListener('drop', this.onFileDropBound, false);

  if (!this.allowDocumentDrop) {
    document.removeEventListener('drop', this.ignoreDropBound, false);
    document.removeEventListener('dragenter', this.ignoreDropBound, false);
    document.removeEventListener('dragover', this.ignoreDropBound, false);
  }
  delete this.node;
};

/**
 * Whatever it is that the browser wants to do by default with this file,
 * prevent it.  Why? Well, one of the more annoying thing it may do
 * is navigate away from your app to show this file.
 *
 * @method
 * @private
 */
Files.DragAndDropFileWatcher.prototype.ignoreDrop = function ignoreDrop(evt) {
  if (evt.preventDefault) {
    evt.preventDefault();
    evt.stopPropagation();
  }
  return false;
};

/**
 * On hovering with a file, add a css class
 *
 * @method
 * @private
 */
Files.DragAndDropFileWatcher.prototype.onDragOver = function onDragOver(evt) {
  this.node.classList.add('layer-file-drag-and-drop-hover');
  evt.preventDefault();
  return false;
};

/**
 * On un-hovering with a file, remove a css class
 *
 * @method
 * @private
 */
Files.DragAndDropFileWatcher.prototype.onDragEnd = function onDragEnd(evt) {
  this.node.classList.remove('layer-file-drag-and-drop-hover');
};


/**
 * On file drop, generate an array of Message Parts and pass it on to app.
 *
 * @method
 * @private
 */
Files.DragAndDropFileWatcher.prototype.onFileDrop = function onFileDrop(evt) {
  this.onDragEnd();
  const conversation = evt.currentTarget.conversation

  // stops the browser from redirecting off to the image.
  if (evt.preventDefault) {
    evt.preventDefault();
    evt.stopPropagation();
  }

  const dt = evt.dataTransfer;
  const files = Array.prototype.filter.call(dt.files, file => file.type);

  if (files.length === 1) {
    const model = Files.processAttachment(files[0]);
    model.generateMessage(conversation, message => message.send({
      text: 'File received',
      title: `New Message from ${model.getClient().user.displayName}`,
    }));
  } else {
    const model = Files.processAttachments(files);
    model.generateMessage(conversation, message => message.send({
      text: 'Carousel received',
      title: `New Message from ${model.getClient().user.displayName}`,
    }));
  }
  return false;
};

/**
 * Adds data to your message.
 *
 * Given an array of Message Parts, determines if it needs to generate image or video
 * previews and metadata message parts
 *
 * @method processAttachments
 * @param {layer.MessagePart[]} files    File Objects to turn into a carousel
 */
Files.processAttachments = function processAttachments(files) {
  const imageTypes = ['image/gif', 'image/png', 'image/jpeg', 'image/svg'];
  const nonImageParts = files.filter(file => imageTypes.indexOf(file.type) === -1);
  return new CarouselModel({
    items: nonImageParts.length ? files.map(file => new FileModel({ source: file })) : files.map(file => new ImageModel({ source: file })),
  });
};

Files.processAttachment = function processAttachment(file, conversation, parent, callback) {
  if (['image/gif', 'image/png', 'image/jpeg', 'image/svg'].indexOf(file.type) !== -1) {
    return new ImageModel({
      source: file,
    });
  } else {
    return new FileModel({
      source: file,
    });
  }
};


Files.generateVideoMessageParts = function generateVideoMessageParts(part, callback) {
  const parts = [part];
  const video = document.createElement('video');

  video.addEventListener('loadedmetadata', () => {
    const originalSize = {
      width: video.videoWidth,
      height: video.videoHeight,
    };

    const size = normalizeSize(originalSize, settings.maxSizes);

    const canvas = document.createElement('canvas');
    canvas.width = size.width;
    canvas.height = size.height;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const binStr = atob(canvas.toDataURL('image/jpeg').split(',')[1]);
    const len = binStr.length;
    const arr = new Uint8Array(len);

    for (let i = 0; i < len; i++) {
      arr[i] = binStr.charCodeAt(i);
    }

    parts.push(new Layer.MessagePart({
      body: new Blob([arr], { type: 'image/jpeg' }),
      mimeType: 'image/jpeg+preview',
    }));

    parts.push(new Layer.MessagePart({
      mimeType: 'application/json+imageSize',
      body: `{"orientation":0, "width":${originalSize.width}, "height":${originalSize.height}}`,
    }));

    if (callback) callback(parts);
  });

  video.src = URL.createObjectURL(part.body);
};
