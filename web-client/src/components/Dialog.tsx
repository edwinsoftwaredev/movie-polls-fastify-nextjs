'use client';

import { usePathname } from 'next/navigation';
import { PropsWithChildren, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export const animateDialogBackground = async (
  isReverse: boolean,
  currentScrollbarPosY?: number
) => {
  const appMain = document.getElementById('app-main');
  const appFooter = document.getElementById('app-footer');
  const appMainPosY = appMain?.getBoundingClientRect().y;

  if (
    !isReverse &&
    window.innerHeight < document.body.getBoundingClientRect().height
  ) {
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
    }
  });
};

interface DialogProps extends PropsWithChildren {
  isOpen: boolean;
}

const Dialog: React.FC<DialogProps> = ({ children, isOpen }) => {
  const path = usePathname();
  const [scrollPosY, setScrollPosY] = useState(0);
  const [initPath] = useState(path);

  useEffect(() => {
    if (isOpen) {
      setScrollPosY(window.scrollY);
      animateDialogBackground(false, window.scrollY);
    } else {
      animateDialogBackground(true, scrollPosY);
    }
  }, [isOpen]);

  useEffect(() => {
    if (initPath !== path) animateDialogBackground(true);
  }, [path]);

  if (typeof window === 'undefined') return null;

  if (!isOpen) return createPortal(null, document.body);

  return createPortal(children, document.body);
};

export default Dialog;
