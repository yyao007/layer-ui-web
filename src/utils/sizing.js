import layerUI from '../base';

// TODO: We should not be hardcoding stuff like this in.
const messageSizes = {
  maxHeightRatio: 2 / 3,
  maxWidthPadding: 65,
  scrollbarWidth: 18,
};


// NOTE: dimensions must contains width and height properties.
module.exports = (dimensions, optListNodeDimensions) => {
  const listNodeDimensions = layerUI.settings.listNodeDimensions || optListNodeDimensions;
  const maxHeight = listNodeDimensions.height * messageSizes.maxHeightRatio;
  const maxWidth = listNodeDimensions.width - messageSizes.scrollbarWidth -
    (optListNodeDimensions.noPadding ? 0 : messageSizes.maxWidthPadding);


  if (!dimensions) {
    return {
      height: maxHeight,
      width: maxWidth,
    };
  }

  const size = {
    width: dimensions.width,
    height: dimensions.height,
  };
  if (dimensions.width > maxWidth) {
    const width = dimensions.width;
    size.width = maxWidth;
    size.height = size.height * maxWidth / width;
  }
  if (size.height > maxHeight) {
    const height = size.height;
    size.height = maxHeight;
    size.width = size.width * maxHeight / height;
  }
  return {
    width: Math.round(size.width),
    height: Math.round(size.height)
  };
};
