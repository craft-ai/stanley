import _ from 'lodash';
import { errorReceived, MESSAGE_TYPES } from './actions';
import { learnAboutStory, recommandTopic } from './learning';
import { save } from './serialization';
import { sendStory } from './expression';
import { start } from './slack';
import { Time } from 'craft-ai';

const DEAMON_SLEEP_TIME = 2 * 60;
const TIME_BEFORE_RECOMMENDATION = 5 * 60;
const TIME_BEFORE_LOSING_INTEREST = 20 * 60;

function checkNeedToPushStory() {
  return (dispatch, getState) => {
    const now = Time();

    return Promise.all(_(getState().interlocutors)
      .map(interlocutor => {
        const lastStory = _(interlocutor.messages)
          .filter(message => message.type === MESSAGE_TYPES.PULLED_STORY || message.type === MESSAGE_TYPES.PUSHED_STORY)
          .last();
        return lastStory ? {
          when: _.last(interlocutor.messages).when,
          where: _.last(interlocutor.messages).where,
          user: interlocutor.user
        } : undefined;
      })
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
        return dispatch(sendStory(interaction.user, interaction.recommendedTopic, interaction.where, false));
      }
    })
    .catch(err => {
      dispatch(errorReceived(err));
    });
  };
}

function checkLosingInterest() {
  return (dispatch, getState) => {
    const now = Time();

    return Promise.all(_(getState().interlocutors)
      .map(interlocutor => {
        const lastPulledStory = _(interlocutor.messages)
          .filter(message => message.type === MESSAGE_TYPES.PULLED_STORY)
          .last();
        if (lastPulledStory && (now.timestamp - Time(lastPulledStory.when).timestamp > TIME_BEFORE_LOSING_INTEREST)) {
          return interlocutor.user;
        }
        else {
          return undefined;
        }
      })
      .compact()
      .thru(users => {
        if (users.length > 0) {
          console.log(`${now.utc}: ${users.length} users losing interest...`, users);
        }
        return users;
      })
      .map(user => dispatch(learnAboutStory(user)))
      .value())
    .catch(err => dispatch(errorReceived(err)));
  };
}

function saveState() {
  return (dispatch, getState) => {
    return save(getState(), './state.json')
    .catch(err => {
      dispatch(errorReceived(err));
    });
  };
}

export default function bot() {
  return dispatch => {
    dispatch(start());
    setInterval(() => {
      dispatch(checkNeedToPushStory());
      dispatch(checkLosingInterest());
      dispatch(saveState());
    }, DEAMON_SLEEP_TIME * 1000);
  };
}
