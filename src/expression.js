import _ from 'lodash';
import { learnAboutStory } from './learning';
import { searchTweetsByTopic } from './twitter';
import { sendMessage } from './slack';
import { storySent } from './actions';

export function sendStory(inboundUser, topic, id) {
  return (dispatch, getState) => {
    return searchTweetsByTopic(topic)
    .then(tweets => {
      const { stories, user } = getState().interlocutors[inboundUser.nick];
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
        .then(() => dispatch(storySent(user, story)));
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

//
// let handleMore = context => {
//   if (_.isUndefined(context.currentTopic)) {
//     return Promise.resolve('You need to ask be about a particular topic first!');
//   }
//   else {
//     return handleStory(context, context.currentTopic);
//   }
// };
//
// let handleRecommendation = context => {
//   return CRAFT_CLIENT.getAgentDecisionTree(context.agentId)
//   .then(tree => {
//     const decision = decide(tree, new Time());
//     const confidence = decision.confidence;
//     const topic = decision.decision.topic;
//     if (confidence > 0.8 && topic !== CRAFT_TOPIC_NULL ) {
//       return handleStory(context, topic);
//     }
//     else {
//       return 'I don\'t know you well enough to recommend you something now.';
//     }
//   });
// };
//
// let handleGreetings = context => {
//   return Promise.resolve('Hi there!');
// };
