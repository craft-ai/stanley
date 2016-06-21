import _ from 'lodash';
import { learnAboutStory } from './learning';
import { searchTweetsByTopic } from './twitter';
import { sendMessage } from './slack';
import { messageSent, MESSAGE_TYPES } from './actions';

export function sendStory(user, topic, id, requested = true) {
  return (dispatch, getState) => {
    return searchTweetsByTopic(topic)
    .then(tweets => {
      const stories = _.filter(
        getState().interlocutors[user.nick].messages,
        message => (message.type === MESSAGE_TYPES.PULLED_STORY || message.type === MESSAGE_TYPES.PUSHED_STORY)
      );
      const selectedTweet = _.find(tweets, tweet => _.find(stories, story => story.content.id === tweet.id) === undefined);
      if (selectedTweet) {
        const story = {
          id: selectedTweet.id,
          topic
        };
        return Promise.all([
          dispatch(sendMessage(`
@${user.nick}, here is something about ${topic}!

${selectedTweet.text}
--- by @${selectedTweet.author} (${selectedTweet.url})
          `, id)),
          requested ? dispatch(learnAboutStory(user, story)) : undefined
        ])
        .then(() => dispatch(messageSent(requested ? MESSAGE_TYPES.PULLED_STORY : MESSAGE_TYPES.PUSHED_STORY, id, user, story)));
      }
      else {
        return dispatch(sendMessage(`Sorry @${user.nick}, I have nothing to show you at the moment.`, id));
      }
    });
  };
}

export function sendStoryWithLastTopic(user, id) {
  return (dispatch, getState) => {
    const lastPulledStory = _(getState().interlocutors[user.nick].messages)
    .filter(message => message.type === MESSAGE_TYPES.PULLED_STORY)
    .last();

    if (_.isUndefined(lastPulledStory)) {
      return dispatch(sendMessage(`Sorry @${user.nick}, you need to ask be about a particular topic first!`, id));
    }
    else {
      return dispatch(sendStory(user, lastPulledStory.content.topic, id));
    }
  };
}

export function greetUser(user, id) {
  return dispatch => dispatch(sendMessage(`Hello @${user.nick}!`, id))
  .then(() => dispatch(messageSent(MESSAGE_TYPES.GREETINGS, id, user)));
}
