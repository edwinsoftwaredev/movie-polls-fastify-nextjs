import styles from './Label.module.scss';
import { PropsWithChildren, useEffect, useReducer } from 'react';
import classNameReducer from './class-name-reducer';

interface LabelProps extends PropsWithChildren {
  nowrap?: boolean;
  outlined?: boolean;
}

const Label: React.FC<LabelProps> = ({ children, nowrap, outlined }) => {
  const [classNames, dispatch] = useReducer(
    classNameReducer,
    `${styles['label']} ${nowrap ? styles['nowrap'] : ''} ${
      outlined ? styles['outlined'] : ''
    }`
  );

  useEffect(() => {
    dispatch({
      type: nowrap ? 'add' : 'remove',
      className: styles['wrapped'],
    });
    dispatch({
      type: outlined ? 'add' : 'remove',
      className: styles['outlined'],
    });
  }, [nowrap, outlined]);

  return <label className={classNames}>{children}</label>;
};

export default Label;
