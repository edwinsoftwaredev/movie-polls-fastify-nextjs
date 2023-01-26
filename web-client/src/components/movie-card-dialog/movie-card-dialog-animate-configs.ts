let currentScrollbarPosY: number | undefined = undefined;

// TODO: Refactor into Dialog component
export const animateDialogBackground = async (isReverse: boolean) => {
  const appMain = document.getElementById('app-main');
  const appFooter = document.getElementById('app-footer');
  const appMainPosY = appMain?.getBoundingClientRect().y;

  if (
    !isReverse &&
    window.innerHeight < document.body.getBoundingClientRect().height
  ) {
    typeof currentScrollbarPosY === 'undefined' &&
      (currentScrollbarPosY = window.scrollY);
    document.body.style.overflowY = 'scroll';
  }

  const appMainAnimateConfigs: Array<[Keyframe[], KeyframeAnimationOptions]> = [
    [
      [
        {
          position: 'static',
          top: '0px',
        },
        {
          position: 'fixed',
          top: `${appMainPosY}px`,
        },
      ],
      {
        fill: 'forwards',
        duration: 0,
        direction: !isReverse ? 'normal' : 'reverse',
      },
    ],
  ];

  const appFooterAnimateConfigs: Array<[Keyframe[], KeyframeAnimationOptions]> =
    [
      [
        [
          {
            visibility: 'visible',
          },
          {
            visibility: 'hidden',
          },
        ],
        {
          fill: 'forwards',
          duration: 0,
          direction: !isReverse ? 'normal' : 'reverse',
        },
      ],
    ];

  await Promise.all([
    appMain?.animate(appMainAnimateConfigs[0][0], appMainAnimateConfigs[0][1])
      .finished,
    appFooter?.animate(
      appFooterAnimateConfigs[0][0],
      appFooterAnimateConfigs[0][1]
    ).finished,
  ]).then(() => {
    if (isReverse) {
      window.scroll({
        top: currentScrollbarPosY || 0,
      });
      currentScrollbarPosY = undefined;
    }
  });
};

export const animateCard = async (
  elRef: HTMLElement,
  pX: number,
  pY: number,
  w: number,
  h: number,
  isReverse: boolean
) => {
  const isWindowSmall = document.body.getBoundingClientRect().width <= 1200;

  const k1: Keyframe = {
    position: 'fixed',
    width: `${w}px`,
    height: `${h}px`,
    top: `${pY}px`,
    left: `${pX}px`,
    zIndex: '30',
  };

  const k2: Keyframe = {
    ...k1,
    height: 'auto',
  };

  const k3: Keyframe = {
    ...k2,
    position: 'fixed',
    width: `45%`,
    height: 'auto',
    top: `6rem`,
    left: `calc(50% - (45% * 0.5))`,
    zIndex: '30',
  };

  const k4: Keyframe = {
    ...k3,
    width: !isWindowSmall ? '75%' : '95%',
    left: !isWindowSmall
      ? `calc(50% - (75% * 0.5))`
      : `calc(50% - (95% * 0.5))`,
  };

  const k5: Keyframe = {
    ...k4,
    position: 'relative',
  };

  const a1 = [k1, k1];
  const a2 = [k2, k3];
  const a3 = [k3, k4];
  const a4 = [k4, k5];

  const animateConfigs: Array<[Keyframe[], KeyframeAnimationOptions]> = [
    [
      a1,
      {
        direction: !isReverse ? 'normal' : 'reverse',
        duration: !isWindowSmall ? 300 : 0,
        fill: 'forwards',
      },
    ],
    [
      a2,
      {
        delay: !isWindowSmall ? 100 : 0,
        direction: !isReverse ? 'normal' : 'reverse',
        duration: !isWindowSmall ? 1100 : 0,
        fill: 'forwards',
        easing: 'cubic-bezier(1, 0, 0, 1)',
      },
    ],
    [
      a3,
      {
        ...(!isReverse ? { delay: !isWindowSmall ? 150 : 0 } : {}),
        direction: !isReverse ? 'normal' : 'reverse',
        duration: !isWindowSmall ? 200 : 0,
        fill: 'forwards',
        easing: 'ease-out',
      },
    ],
    [
      a4,
      {
        direction: !isReverse ? 'normal' : 'reverse',
        duration: !isWindowSmall ? 0 : 0,
        fill: 'forwards',
      },
    ],
  ];

  isReverse && animateConfigs.reverse();

  await elRef.animate(animateConfigs[0][0], animateConfigs[0][1]).finished;

  await elRef.animate(animateConfigs[1][0], animateConfigs[1][1]).finished;

  await elRef.animate(animateConfigs[2][0], animateConfigs[2][1]).finished;

  await elRef.animate(animateConfigs[3][0], animateConfigs[3][1]).finished;
};

export const animateMovieCard = async (
  elRef: HTMLDivElement,
  pX: number,
  pY: number,
  w: number,
  h: number,
  isReverse: boolean
) => {
  const isWindowSmall = document.body.getBoundingClientRect().width <= 1200;

  const k1: Keyframe = {
    position: 'fixed',
    width: `${w}px`,
    height: `${h}px`,
    minHeight: 'auto',
    top: `${pY}px`,
    left: `${pX}px`,
    borderRadius: '2px',
    zIndex: '30',
  };

  const k2: Keyframe = {
    position: 'fixed',
    top: '0px',
    left: '0px',
    right: '0px',
    bottom: '0px',
    width: '100%',
    height: '100%',
    // borderRadius: '4%',
    zIndex: '30',
  };

  const k3: Keyframe = {
    ...k2,
    minHeight: '100vh',
    borderRadius: '0px',
  };

  const k4: Keyframe = {
    ...k3,
    position: 'absolute',
  };

  const a1 = [k1, k2];
  const a2 = [k2, k3];
  const a3 = [k3, k4];

  const animateConfigs: Array<[Keyframe[], KeyframeAnimationOptions]> = [
    [
      a1,
      {
        direction: !isReverse ? 'normal' : 'reverse',
        duration: !isWindowSmall ? 1600 : 0,
        fill: 'forwards',
        easing: 'cubic-bezier(1, 0, 0, 1)',
      },
    ],
    [
      a2,
      {
        direction: !isReverse ? 'normal' : 'reverse',
        duration: !isWindowSmall ? 200 : 0,
        fill: 'forwards',
        easing: 'ease-out',
      },
    ],
    [
      a3,
      {
        direction: !isReverse ? 'normal' : 'reverse',
        duration: !isWindowSmall ? 0 : 0,
        fill: 'forwards',
      },
    ],
  ];

  isReverse && animateConfigs.reverse();

  await elRef.animate(animateConfigs[0][0], animateConfigs[0][1]).finished;

  await elRef.animate(animateConfigs[1][0], animateConfigs[1][1]).finished;

  await elRef.animate(animateConfigs[2][0], animateConfigs[2][1]).finished;
};
