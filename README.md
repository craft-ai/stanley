# Stanley, a Slack bot made with love using **Recast.ai** and **craft ai** #

## Setup ##

1. On [**craft ai**](http://craft.ai), register and retrieve your _owner_ and _token_ at <https://beta.craft.ai/settings>
2. On [**Recast.ai**](https://recast.ai), register and fork [cloderic/stanley](https://recast.ai/cloderic/stanley/core)
3. Retrieve a Slack API token (_todo: add instructions_)
4. Retrieve Twitter API tokens (_todo: add instructions_)
5. Create a `.env` with the following informations:

  ```
  CRAFT_OWNER=<YOUR_CRAFT_AI_OWNER>
  CRAFT_TOKEN=<YOUR_CRAFT_AI_TOKEN>

  RECAST_TOKEN=<YOUR_RECAST_AI_TOKEN>

  TWITTER_CONSUMER_KEY=<YOUR_TWITTER_API_CONSUMER_KEY>
  TWITTER_CONSUMER_SECRET=<YOUR_TWITTER_API_CONSUMER_SECRET>
  TWITTER_ACCESS_TOKEN_KEY=<YOUR_TWITTER_API_ACCESS_TOKEN_KEY>
  TWITTER_ACCESS_TOKEN_SECRET=<YOUR_TWITTER_API_ACCESS_TOKEN_SECRET>

  SLACK_TOKEN=<YOUR_SLACK_TOKEN>
  ```
6. Install Node.js dependencies using `npm install`
7. Build using `npm run build`
8. Run using `npm run start`
