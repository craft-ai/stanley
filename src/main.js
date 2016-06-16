import 'babel-polyfill';

import configureStore from './store';
import { start } from './slack';

let store = configureStore();

store.dispatch(start());
