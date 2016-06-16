import _ from 'lodash';
import { createCraftAgent, recommandTopic } from './learning';
import { sendMessage, typeMessage } from './slack';
import { sendStory, sendStoryWithLastTopic } from './expression';
import dotenv from 'dotenv';
import recast from 'recastai';
import { newInterlocutor } from './actions';

dotenv.load({ silent: true });

const RECAST_CLIENT = new recast.Client(process.env.RECAST_TOKEN);

export function handleMessage(inboundUser, message, id) {
  return (dispatch, getState) => {
    return dispatch(typeMessage(id))
    .then(() => {
      if (_.isUndefined(getState().interlocutors[inboundUser.nick])) {
        return dispatch(createCraftAgent(inboundUser))
        .then(inboundUser => dispatch(newInterlocutor(inboundUser)));
      }
      else {
        return Promise.resolve();
      }
    })
    .then(() => new Promise((resolve, reject) => RECAST_CLIENT.textRequest(message, (res, err) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    })))
    .then(response => {
      const intent = response.intent();
      switch (intent) {
        case 'story':
          {
            const topic = response.get('topic');
            if (_.isUndefined(topic)) {
              return dispatch(sendMessage(`Sorry @${inboundUser.nick}, I didn't understood the topic you were asking about...`, id));
            }
            else {
              return dispatch(sendStory(inboundUser, response.get('topic').raw, id));
            }
          }
        case 'greetings':
          return dispatch(sendMessage(`Hello @${inboundUser.nick}!`, id));
        case 'more':
          return dispatch(sendStoryWithLastTopic(inboundUser, id));
        case 'recommended_story':
          {
            const { user } = getState().interlocutors[inboundUser.nick];
            return dispatch(recommandTopic(user))
            .then(topic => {
              if (_.isUndefined(topic)) {
                return dispatch(sendMessage(`Sorry @${inboundUser.nick}, I don't have enough knowledge of your tastes yet...`, id));
              }
              else {
                return dispatch(sendStory(inboundUser, topic, id));
              }
            });
          }
        default:
          return dispatch(sendMessage(`Sorry @${inboundUser.nick}, I didn't understood what you meant.`, id));
      }
    });
  };
}
