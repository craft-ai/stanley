import { createStore, applyMiddleware } from 'redux';
import createLogger from 'redux-logger';
import reducer from './reducer';
import thunkMiddleware from 'redux-thunk';

const loggerMiddleware = createLogger({
  colors: false,
  stateTransformer: state => JSON.stringify(state, undefined, '  '),
  errorTransformer: error => JSON.stringify(error, undefined, '  '),
  actionTransformer: action => JSON.stringify(action, undefined, '  ')
});

const INITIAL_STATE = {
  user: {},
  interlocutors: {},
  error: undefined
};

export default function configureStore(initialState = INITIAL_STATE) {
  return createStore(
    reducer,
    initialState,
    applyMiddleware(
      thunkMiddleware,
      loggerMiddleware
    )
  );
}
