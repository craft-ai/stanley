import 'babel-polyfill';

import { load } from './serialization';
import configureStore from './store';
import bot from './bot';

load('./state.json')
.then(state => configureStore(state))
.catch(err => {
  console.log('Unable to load existing state, starting from scratch');
  return configureStore();
})
.then(store => store.dispatch(bot()));
