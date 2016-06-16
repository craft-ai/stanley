import craftai, { Time, decide } from 'craft-ai';
import dotenv from 'dotenv';

dotenv.load({ silent: true });

const CRAFT_CLIENT = craftai({
  owner: process.env.CRAFT_OWNER,
  token: process.env.CRAFT_TOKEN
});

const CRAFT_TOPIC_NULL = 'CRAFT_TOPIC_NULL';

const CRAFT_MODEL = {
  context: {
    topic: {
      type: 'enum'
    },
    time: {
      type: 'time_of_day'
    },
    day: {
      type: 'day_of_week'
    },
    tz: {
      type: 'timezone'
    }
  },
  output: ['topic'],
  time_quantum: 4
};

export function createCraftAgent(user) {
  return dispatch => {
    const agentId = `stanley_${user.nick}`;
    return CRAFT_CLIENT.getAgent(agentId)
    .catch(() => CRAFT_CLIENT.createAgent(CRAFT_MODEL, agentId)
      .then(agent => {
        const t = new Time();
        return CRAFT_CLIENT.addAgentContextOperations(agentId, {
          timestamp: t.timestamp,
          diff: {
            topic: CRAFT_TOPIC_NULL,
            tz: t.timezone
          }
        }, true)
        .then(() => Promise.resolve(agent));
      })
    )
    .then(agent =>({
      ...user,
      craft_agent: agentId
    }));
  };
}

export function learnAboutStory(user, story) {
  return dispatch => {
    const t = new Time();
    return CRAFT_CLIENT.addAgentContextOperations(user.craft_agent, {
      timestamp: t.timestamp,
      diff: {
        topic: story.topic,
        tz: t.timezone
      }
    }, true);
  };
}

export function recommandTopic(user) {
  return dispatch => {
    return CRAFT_CLIENT.getAgentDecisionTree(user.craft_agent)
    .then(tree => {
      const decision = decide(tree, new Time());
      const confidence = decision.confidence;
      const topic = decision.decision.topic;
      if ( confidence > 0.8 && topic !== CRAFT_TOPIC_NULL ) {
        return topic;
      }
      else {
        return undefined;
      }
    });
  };
}
