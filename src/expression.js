import _ from 'lodash';
import { learnAboutStory } from './learning';
import { searchTweetsByTopic } from './twitter';
import { sendMessage } from './slack';
import { storySent } from './actions';

export function sendStory(user, topic, id) {
  return (dispatch, getState) => {
    return searchTweetsByTopic(topic)
    .then(tweets => {
      const { stories } = getState().interlocutors[user.nick];
      const selectedTweet = _.find(tweets, tweet => _.find(stories, story => story.id === tweet.id) === undefined);
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
          dispatch(learnAboutStory(user, story))
        ])
        .then(() => dispatch(storySent(user, story, id)));
      }
      else {
        return dispatch(sendMessage(`Sorry @${user.nick}, I have nothing to show you at the moment.`, id));
      }
    });
  };
}

export function sendStoryWithLastTopic(user, id) {
  return (dispatch, getState) => {
    const lastStory = _.last(getState().interlocutors[user.nick].stories);

    if (_.isUndefined(lastStory)) {
      return dispatch(sendMessage(`Sorry @${user.nick}, you need to ask be about a particular topic first!`, id));
    }
    else {
      return dispatch(sendStory(user, lastStory.topic, id));
    }
  };
}

export function greetUser(user, id) {
  return dispatch => dispatch(sendMessage(`Hello @${user.nick}!`, id));
}
