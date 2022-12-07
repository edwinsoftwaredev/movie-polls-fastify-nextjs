const aspectRatios = {
  '16/9': 16 / 9,
  '4/3': 4 / 3,
};

export const getInitialSliderProps = (
  slideSize: 3 | 4 | 5,
  slideItemsGap?: 7,
  slideItemAspectRatio?: '16/9' | '4/3'
) => {
  const defaultSlideItemsGap = slideItemsGap || 7;
  const sliderCtrlSize = 100 * (1 / 25);
  const defaultSlideItemAspectRatio =
    aspectRatios[slideItemAspectRatio || '16/9'];

  const getSlideItemSize = () =>
    `calc((100% - ${sliderCtrlSize}% * 2) * (1 / ${
      slideSize || 1
    }) - ${defaultSlideItemsGap}px * (${slideSize + 1} / ${slideSize}))`;

  return {
    sliderCtrlSize,
    slideItemSize: getSlideItemSize(),
    translateXSlide: sliderCtrlSize,
  };
};
