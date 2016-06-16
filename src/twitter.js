import _ from 'lodash';
import dotenv from 'dotenv';
import Twitter from 'twitter';

dotenv.load({ silent: true });

const TWITTER_CLIENT = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

export function searchTweetsByTopic(topic) {
  const query = `"${topic}" filter:links`;
  return new Promise((resolve, reject) => TWITTER_CLIENT.get(
    'search/tweets',
    {
      q: query,
      lang: 'en',
      result_type: 'recent',
      count: 100
    },
    (error, tweets, response) => {
      if (error) {
        reject(error);
      } else {
        resolve(tweets);
      }
    }
  ))
  .then(tweets => _.map(tweets.statuses, tweet => ({
    author: tweet.user.screen_name,
    date: tweet.created_at,
    text: tweet.text,
    id: tweet.id_str,
    url: `https://twitter.com/statuses/${tweet.id_str}`
  })));
}
