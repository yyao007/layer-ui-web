var layerUI = require('../base');
var layer = layerUI.layer;
var Files = layerUI.files = {};
var ImageManager = window.loadImage = require("blueimp-load-image/js/load-image");
require("blueimp-load-image/js/load-image-orientation.js");
require("blueimp-load-image/js/load-image-meta.js");
require("blueimp-load-image/js/load-image-exif.js");
var normalizeSize = require('./sizing');

/**
 * This is a utility class which you can use to watch for user dragging and dropping
 * files from their file system into your app as part of a "Send Attached Message" action.
 *
 * ```
 * var dropWatcher = new layerUI.files.DragAndDropFileWatcher({
 *   node: dropBoxNode,
 *   callback: sendAttachment,
 *   allowDocumentDrop: false
 * });
 * function sendAttachment(messageParts) {
 *    currentConversation.createMessage({ parts: messageParts }).send();
 * }
 * ```
 *
 * @class layerUI.utils.files.DragAndDropFileWatcher
 * @param {Object} options
 * @param {HTMLElement|String} options.node - The dom node (or dom node ID) to watch for files/file-drag events
 * @param {Function} options.callback - The function to call when a file is dropped
 * @param {layer.MessagePart[]} options.callback.parts - The MessageParts representing the dropped files, which you can modify and send.
 * @param {Object} [maxSizes={width: 300, height: 300}] - Object with `width` and `height` used to determine a maximum width and height for image previews
 * @param {Boolean} [options.allowDocumentDrop=false] - By default, this utility adds an event handler to prevent the browser from navigating away from your
 *         app to view a file dropped in some other part of your app. If you need to handle this event yourself, set this to true.
 */
Files.DragAndDropFileWatcher = function(options) {
  this.node = typeof options.node === 'string' ? document.getElementById(options.node) : options.node;
  this.callback = options.callback;
  this.allowDocumentDrop = Boolean(options.allowDocumentDrop);
  this.maxSizes = options.maxSizes || {width: 300, height: 300};

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
}

/**
 * Destroy this component, in particular, remove any handling of any events.
 *
 * @method
 */
Files.DragAndDropFileWatcher.prototype.destroy = function() {
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
  delete this.callback;
}

/**
 * Whatever it is that the browser wants to do by default with this file,
 * prevent it.  Why? Well, one of the more annoying thing it may do
 * is navigate away from your app to show this file.
 *
 * @method
 * @private
 */
Files.DragAndDropFileWatcher.prototype.ignoreDrop = function(evt) {
  if (evt.preventDefault) {
    evt.preventDefault();
    evt.stopPropagation();
  }
  return false;
}

/**
 * On hovering with a file, add a css class
 *
 * @method
 * @private
 */
Files.DragAndDropFileWatcher.prototype.onDragOver = function(evt) {
  this.node.classList.add('layer-file-drag-and-drop-hover');
  evt.preventDefault();
  return false;
}

/**
 * On un-hovering with a file, removea css class
 *
 * @method
 * @private
 */
Files.DragAndDropFileWatcher.prototype.onDragEnd = function(evt) {
  this.node.classList.remove('layer-file-drag-and-drop-hover');
}


/**
 * On file drop, generate an array of Message Parts and pass it on to app.
 *
 * @method
 * @private
 */
Files.DragAndDropFileWatcher.prototype.onFileDrop = function(evt) {
  this.onDragEnd();

  // stops the browser from redirecting off to the image.
  if (evt.preventDefault) {
      evt.preventDefault();
      evt.stopPropagation();
  }

  var dt    = evt.dataTransfer;
  var parts = Array.prototype.map.call(dt.files, function(file) {
    return new layer.MessagePart(file);
  }, this);

  Files.processAttachments(parts, this.maxSizes, this.callback);
  return false;
}


// STATIC UTILITIES THAT NEED JSDUCKING
Files.processAttachments = function(parts, maxSizes, callback) {
  // TODO: Need a way to register additional handlers; currently relies on the callback for additional handling.
  parts.forEach(function(part) {
    if (['image/gif', 'image/png', 'image/jpeg'].indexOf(part.mimeType) != -1) {
      Files.generateImageMessageParts(part, maxSizes, callback)
    } else if (part.mimeType === 'video/mp4') {
      Files.generateVideoMessageParts(part, maxSizes, callback);
    } else {
      if (callback) callback([part]);
    }
  });
}

Files.generateImageMessageParts = function(part, maxSizes, callback) {
  // First part is the original image; the rest of the code is for generating the other 2 parts of the 3 part Image
  var parts = [part];
  var orientation = 1;

  // STEP 1: Determine the correct orientation for the image
  ImageManager.parseMetaData(part.body, onParseMetadata);


  function onParseMetadata(data) {
    var options = {
        canvas: true
    };

    if (data.imageHead && data.exif) {
        orientation = options.orientation = data.exif[0x0112] || 0;
    }

    // STEP 2: Write the image to a canvas with the specified orientation
    ImageManager(part.body, onWriteImage, options);
  }

  function onWriteImage(srcCanvas) {
    // STEP 3: Scale the image down to Preview Size
    var originalSize = {
      width: srcCanvas.width,
      height: srcCanvas.height
    };

    // TODO: we should be able to provide listHeight/listWidth, but this code is too separated from the list widgets!
    var size = normalizeSize(originalSize, maxSizes);
    var canvas = document.createElement('canvas');
    canvas.width = size.width;
    canvas.height = size.height;
    var context = canvas.getContext('2d');

    //context.scale(size.width, size.height);
    context.fillStyle = context.strokeStyle = "white";
    context.fillRect(0, 0, size.width, size.height);
    context.drawImage(srcCanvas, 0, 0, size.width, size.height);

    // STEP 4: Turn the canvas into a jpeg image for our Preview Image
    var binStr = atob(canvas.toDataURL('image/jpeg').split(',')[1]);
    var len = binStr.length;
    var arr = new Uint8Array(len);

    for (var i = 0; i < len; i++ ) {
      arr[i] = binStr.charCodeAt(i);
    }
    var blob = new Blob([arr], {type: 'image/jpeg'});

    // STEP 5: Create our Preview Message Part
    parts.push(new layer.MessagePart({
      body: new Blob([arr], {type: 'image/jpeg'}),
      mimeType: 'image/jpeg+preview'
    }));

    // STEP 6: Create the Metadata Message Part
    parts.push(new layer.MessagePart({
      mimeType: 'application/json+imageSize',
      body: '{"orientation":' + orientation + ', "width":' + originalSize.width + ', "height":' + originalSize.height + '}'
    }));
    callback(parts);

  }
}

Files.generateVideoMessageParts = function(part, maxSizes, callback) {
  var parts = [part];
  var video = document.createElement('video');

  video.addEventListener('canplay', function() {
    var originalSize = {
      width: video.videoWidth,
      height: video.videoHeight,
    };

    var size = normalizeSize(originalSize, maxSizes);

    var canvas = document.createElement('canvas');
    canvas.width = size.width;
    canvas.height = size.height;
    var context = canvas.getContext('2d');
    context.drawImage(video,0,0,canvas.width, canvas.height);

    var binStr = atob(canvas.toDataURL('image/jpeg').split(',')[1]);
    var len = binStr.length;
    var arr = new Uint8Array(len);

    for (var i = 0; i < len; i++ ) {
      arr[i] = binStr.charCodeAt(i);
    }

    parts.push(new layer.MessagePart({
      body: new Blob([arr], {type: 'image/jpeg'}),
      mimeType: 'image/jpeg+preview'
    }));

    parts.push(new layer.MessagePart({
      mimeType: 'application/json+imageSize',
      body: '{"orientation":0, "width":' + originalSize.width + ', "height":' + originalSize.height + '}'
    }));

    callback(parts);
  });

  video.src = URL.createObjectURL(part.body);
}

