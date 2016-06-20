import 'babel-polyfill';

import configureStore from './store';
import bot from './bot';

let store = configureStore();

store.dispatch(bot());
