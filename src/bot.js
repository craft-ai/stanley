import _ from 'lodash';
import { errorReceived } from './actions';
import { recommandTopic } from './learning';
import { sendStory } from './expression';
import { start, sendMessage } from './slack';
import { Time } from 'craft-ai';

const DEAMON_SLEEP_TIME = 60;
const TIME_BEFORE_RECOMMENDATION = 10 * 60;

function checkNeedToSendStory() {
  return (dispatch, getState) => {
    const now = Time();

    return Promise.all(_(getState().interlocutors)
      .map(interlocutor =>
        interlocutor.stories.length > 0 ? {
          when: _.last(interlocutor.stories).when,
          where: _.last(interlocutor.stories).where,
          user: interlocutor.user
        } :
        undefined
      )
      .filter(
        interaction => interaction && (now.timestamp - Time(interaction.when).timestamp > TIME_BEFORE_RECOMMENDATION)
      )
      .map(
        interaction => dispatch(recommandTopic(interaction.user)).then(topic => ({
          ...interaction,
          recommendedTopic: topic
        }))
      )
      .value())
    .then(unFilteredRecommendedInteractions => {
      const interaction = _(unFilteredRecommendedInteractions)
      .filter(
        interaction => interaction.recommendedTopic
      )
      .sample();
      if (interaction) {
        return dispatch(sendStory(interaction.user, interaction.recommendedTopic, interaction.where));
      }
    })
    .catch(err => {
      dispatch(errorReceived(err));
    });
  };
}

export default function bot() {
  return dispatch => {
    dispatch(start());
    setInterval(() => dispatch(checkNeedToSendStory()), DEAMON_SLEEP_TIME * 1000);
  };
}
