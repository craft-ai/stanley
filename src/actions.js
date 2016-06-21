import { Time } from 'craft-ai';

export function botIdentityReceived(user) {
  return {
    type: 'BOT_IDENTITY_RECEIVED',
    user
  };
}

export function newInterlocutor(user) {
  return {
    type: 'NEW_INTERLOCUTOR',
    user
  };
}

export const MESSAGE_TYPES = {
  GREETINGS: 'GREETINGS',
  PULLED_STORY: 'PULLED_STORY',
  PUSHED_STORY: 'PUSHED_STORY'
};

export function messageSent(type, id, user, content = undefined) {
  return {
    type: 'MESSAGE_SENT',
    user,
    message: {
      type,
      where: id,
      when: Time().utc,
      content
    }
  };
}

export function errorReceived(error) {
  return {
    type: 'ERROR_RECEIVED',
    error
  };
}
