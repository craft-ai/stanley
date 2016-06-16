export function botIdentityReceived(user) {
  return {
    type: 'BOT_IDENTITY_RECEIVED',
    user
  };
}

export function messageSent(message, recipient) {
  return {
    type: 'MESSAGE_SENT',
    message,
    recipient
  };
}

export function newInterlocutor(user) {
  return {
    type: 'NEW_INTERLOCUTOR',
    user
  };
}

export function storySent(user, story) {
  return {
    type: 'STORY_SENT',
    user,
    story
  };
}

export function errorReceived(error) {
  return {
    type: 'ERROR_RECEIVED',
    error
  };
}
