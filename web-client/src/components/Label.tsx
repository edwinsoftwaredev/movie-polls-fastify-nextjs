import styles from './Label.module.scss';
import { PropsWithChildren } from 'react';

interface LabelProps extends PropsWithChildren {
  nowrap?: boolean;
  outlined?: boolean;
}

// NOTE: atomic components like Button, Label or Tabs(atoms) dont make use of state.
const Label: React.FC<LabelProps> = ({ children, nowrap, outlined }) => {
  const classNames = `${styles['label']} ${nowrap ? styles['nowrap'] : ''} ${
    outlined ? styles['outlined'] : ''
  }`;

  // const [classNames, dispatch] = useReducer(
  //   classNameReducer,
  //   `${styles['label']} ${nowrap ? styles['nowrap'] : ''} ${
  //     outlined ? styles['outlined'] : ''
  //   }`
  // );

  // useEffect(() => {
  //   dispatch({
  //     type: nowrap ? 'add' : 'remove',
  //     className: styles['nowrap'],
  //   });
  //   dispatch({
  //     type: outlined ? 'add' : 'remove',
  //     className: styles['outlined'],
  //   });
  // }, [nowrap, outlined]);

  return <label className={classNames}>{children}</label>;
};

export default Label;
