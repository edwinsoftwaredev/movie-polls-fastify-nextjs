import styles from './Label.module.scss';
import { PropsWithChildren, useEffect, useReducer } from 'react';
import classNameReducer from './class-name-reducer';

interface LabelProps extends PropsWithChildren {
  wrapped?: boolean;
  outlined?: boolean;
}

const Label: React.FC<LabelProps> = ({ children, wrapped, outlined }) => {
  const [classNames, dispatch] = useReducer(
    classNameReducer,
    `${styles['label']} ${wrapped ? styles['wrapped'] : ''} ${
      outlined ? styles['outlined'] : ''
    }`
  );

  useEffect(() => {
    dispatch({
      type: wrapped ? 'add' : 'remove',
      className: styles['wrapped'],
    });
    dispatch({
      type: outlined ? 'add' : 'remove',
      className: styles['outlined'],
    });
  }, [wrapped, outlined]);

  return (
    <span className={classNames}>
      <label>{children}</label>
    </span>
  );
};

export default Label;
