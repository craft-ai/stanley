import _ from 'lodash';

export default function reducer(state, action) {
  switch (action.type) {
    case 'BOT_IDENTITY_RECEIVED':
      return {
        ...state,
        user: action.user
      };
    case 'NEW_INTERLOCUTOR':
      {
        const nick = action.user.nick;
        let newInterlocutors = {};
        newInterlocutors[nick] = _.extend({}, state.interlocutors[nick], {
          user: action.user,
          stories: []
        });
        return {
          ...state,
          interlocutors: {
            ...state.interlocutors,
            ...newInterlocutors
          }
        };
      }
    case 'STORY_SENT':
      {
        const nick = action.user.nick;
        let newInterlocutors = {};
        newInterlocutors[nick] = _.cloneDeep(state.interlocutors[nick]);
        newInterlocutors[nick].stories.push(action.story);
        return {
          ...state,
          interlocutors: {
            ...state.interlocutors,
            ...newInterlocutors
          }
        };
      }
    case 'ERROR_RECEIVED':
      return {
        ...state,
        error: action.error
      };
    default:
      return state;
  }
}
