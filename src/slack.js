import _ from 'lodash';
import { botIdentityReceived, errorReceived, messageSent } from './actions';
import { handleMessage } from './understanding';
import { RtmClient, CLIENT_EVENTS, RTM_EVENTS, MemoryDataStore } from '@slack/client';
import dotenv from 'dotenv';

dotenv.load({ silent: true });

const SLACK_CLIENT = new RtmClient(process.env.SLACK_TOKEN, {
  // Sets the level of logging we require
  logLevel: 'error',
  // Initialise a data store for our client, this will load additional helper functions for the storing and retrieval of data
  dataStore: new MemoryDataStore(),
  // Boolean indicating whether Slack should automatically reconnect after an error response
  autoReconnect: true,
  // Boolean indicating whether each message should be marked as read or not after it is processed
  autoMark: true
});

export function typeMessage(id) {
  return dispatch => {
    SLACK_CLIENT.sendTyping(id);
    return Promise.resolve();
  };
}

export function sendMessage(message, id) {
  return dispatch => new Promise((resolve, reject) => {
    SLACK_CLIENT.sendMessage(message, id,  err => {
      if (err) {
        reject(err);
      }
      else {
        resolve(id);
      }
    });
  })
  .then(() => dispatch(messageSent));
}

export function joinChannel(channelName) {
  return dispatch => {
    const channel = SLACK_CLIENT.dataStore.getChannelByName(channelName);

    return dispatch(sendMessage('Hello guys, I\'m up!', channel.id));
  };
}

export function start() {
  return dispatch => {
    SLACK_CLIENT.start();

    SLACK_CLIENT.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, () => {
      const me = SLACK_CLIENT.dataStore.getUserById(SLACK_CLIENT.activeUserId);

      dispatch(botIdentityReceived({
        id: me.id,
        nick: me.name
      }));
      dispatch(joinChannel('stanley_testing'));

      SLACK_CLIENT.on(RTM_EVENTS.MESSAGE, (message, err) => {
        if (err) {
          dispatch(errorReceived(err));
        }
        else if (
          message.text && (
            _.startsWith(message.text, `@${me.name}`) ||
            _.startsWith(message.text, me.name) ||
            _.startsWith(message.text, `<@${me.id}>`)
          )
        ) {
          const user = SLACK_CLIENT.dataStore.getUserById(message.user);
          dispatch(handleMessage({
            id: message.user,
            nick: user.name
          }, message.text, message.channel))
          .catch(err => dispatch(errorReceived(err)));
        }
      });

      SLACK_CLIENT.on(CLIENT_EVENTS.RTM.WS_ERROR, (err) => {
        dispatch(errorReceived(err));
        const channel = SLACK_CLIENT.dataStore.getChannelByName('stanley_testing');
        dispatch(sendMessage('Woups, something unexpected happened !', channel.id));
      });
    });
  };
}

export function stop() {
  return dispatch => {
    SLACK_CLIENT.disconnect();
  };
}