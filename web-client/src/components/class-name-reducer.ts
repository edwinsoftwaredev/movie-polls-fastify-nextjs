const classNameReducer = (
  state: string,
  action: { type: 'add' | 'remove'; className: string }
) => {
  switch (action.type) {
    case 'add': {
      if (state.includes(action.className)) return state;
      return `${state} ${action.className}`;
    }

    case 'remove': {
      if (!state.includes(action.className)) return state;
      return state.replace(` ${action.className}`, '');
    }

    default: {
      return state;
    }
  }
};

export default classNameReducer;
