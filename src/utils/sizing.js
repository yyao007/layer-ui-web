var layerUI = require('../base');
var messageSizes = {
  maxHeightRatio: 2/3,
  maxWidthPadding: 65,
  scrollbarWidth: 18
};


// NOTE: dimensions must contains width and height properties.
module.exports = function(dimensions, optListNodeDimensions) {
  var listNodeDimensions = layerUI.settings.listNodeDimensions || optListNodeDimensions;
  var maxHeight = listNodeDimensions.height * messageSizes.maxHeightRatio;
  var maxWidth = listNodeDimensions.width - messageSizes.scrollbarWidth - (optListNodeDimensions.noPadding ? 0 : messageSizes.maxWidthPadding);


  if (!dimensions) {
    return {
      height: maxHeight,
      width: maxWidth
    };
  }

  var size = {
    width: dimensions.width,
    height: dimensions.height
  };
  if (dimensions.width > maxWidth) {
    var width = dimensions.width;
    size.width = maxWidth;
    size.height = size.height * maxWidth / width;
  }
  if (size.height > maxHeight) {
    var height = size.height;
    size.height = maxHeight;
    size.width = size.width * maxHeight / height;
  }
  return {
    width: Math.round(size.width),
    height: Math.round(size.height)
  };
};