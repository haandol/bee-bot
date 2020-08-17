# Bee bot
 
Bee-bot is a Serverless Slack Bot

Deploying this CDK app will provision below architeture on you AWS Account.

![](/imgs/architecture.png)

## Pricing

[Lambda Pricing](https://aws.amazon.com/ko/lambda/pricing/)
[SQS Pricing](https://aws.amazon.com/ko/sqs/pricing/)
[API Gateway Pricing](https://aws.amazon.com/ko/api-gateway/pricing/)

Bee-bot hooks every message on the channel where it is joined.
If your organization send messages 2M per month, the bot will charge you around $8 per month.

`$8 = API Gateway($7) + Lambda Event($0.4) + Lambda Consumer($0.2) + SQS($0.4)`

> If you don't need to handle every message on the channel, subscribe only DM message events, such as `im:read`, `im:write`,
> this makes Beebot only hooks DM events and it will save your money *a lot*.

# Prerequisites

- awscli
- Nodejs 12.16+
- Python 3.7+
- AWS Account and Locally configured AWS credential

# Installation

Install project dependencies

```bash
$ npm i
```

Install cdk in global context and run `cdk init` if you did not initailize cdk yet.

```bash
$ npm i -g cdk@1.54.0
$ cdk init
$ cdk bootstrap
```

Deploy CDK Stacks on AWS

```bash
$ cdk deploy "*" --require-approval never
```

Deploying *APIGatewayStack* displays *Url of the API Gateway*, it will look like *https://xyz.execute-api.ap-northeast-2.amazonaws.com/dev/*.

Attach path `slack` to it and copy it to clipboard.
`https://xyz.execute-api.ap-northeast-2.amazonaws.com/dev/slack`

# Usage

## Add Event-bot and get Access & Verification Tokens
1. Visit [Slack API](https://api.slack.com/) and click `Start Building` to add bot to your account.
2. Visit *App Home*, Add below scopes to your *Bot Token Scopes*. `chat:write`, `channels:history`, `im:history`, `im:write`, `groups:history`, `users:write`.
2. Visit *Event Subscriptions -> Enable Events*, enable events api and set the *Request URL* paste from your clipboard.
3. Visit *Event Subscriptions -> Subscribe to bot events*, Add bot below events, `message.channels` and `message.im`.
4. Visit *OAuth & Permissions -> OAuth Tokens & Redirect URLs*, click `Install App to Workspace` and click `Allow`.
5. Visit *OAuth & Permissions -> OAuth Tokens & Redirect URLs*, copy *Bot Access Token*
6. Visit *Basic Information -> Verification Token*, copy *Verification Token*

## Store Tokens to Amazon SSM Parameter Store

Run `./scripts/update_slack_token.py` to store tokens securely.

```bash
$ ./scripts/update_slack_token.py --access-token YOUR_BOT_ACCESS_TOKEN --verification-token YOUR_VERIFICATION_TOKEN
{'ARN': 'arn:aws:ssm:ap-northeast-2:ACCOUNT:parameter/BEEBOT/SLACK/TOKEN/ACCESS',
 'DataType': 'text',
 'LastModifiedDate': datetime.datetime(2020, 7, 10, 16, 36, 26, 592000, tzinfo=tzlocal()),
 'Name': '/BEEBOT/SLACK/TOKEN/ACCESS',
 'Type': 'SecureString',
 'Value': 'YOUR_BOT_ACCESS_TOKEN'
 'Version': 1}
{'ARN': 'arn:aws:ssm:ap-northeast-2:ACCOUNT:parameter/BEEBOT/SLACK/TOKEN/VERIFICATION',
 'DataType': 'text',
 'LastModifiedDate': datetime.datetime(2020, 7, 10, 16, 36, 26, 592000, tzinfo=tzlocal()),
 'Name': '/BEEBOT/SLACK/TOKEN/VERIFICATION',
 'Type': 'SecureString',
 'Value': 'YOUR_VERIFICATION_TOKEN'
 'Version': 1}
```

## Hangout with your bot

1. Invite your bot to channel.

2. Type command with Command Prefix (default is `!` ) on the channel where the bot is on.

```
YOU: !help

Honey: Hello world!!
```

# Apps

We call each function that you plugged-in to the Honey, the app.

Built-in and example apps are in the `libs/functions/slack/apps` directory.

## App and Command

Below is basic form of app.
This just says `Hello world!!` to the channel when user typed the command, `!hi`.

```python
from .decorators import on_command

@on_command(['hi', 'hello', '하이', 'ㅎㅇ'])
def hello_world(robot, channel, user, tokens):
    '''
        Simple app just says `Hello word!!`

        @params {object} robot - Honey bot instance
        @params {str} channel - channel name where invoked this app
        @params {str} user - user id who invoked this app
        @params {list} tokens - user input tokens
        @returns {str, str} - channel name, message
    '''
    return channel, 'Hello world!!'
```

And Honey supports multiple commands for each function.

The above app can be invoked the command with Command Prefix (default is `!`) on the channel.
It would be `!hello`, `!hi`, `!하이` or `!ㅎㅇ`

## Tokenizer

Honey automatically split your message into tokens by whitespaces.

Let's assume that you typed `!memo remember this` with blow app.

```python
@on_command(['memo'])
def remember(robot, channel, user, tokens):
    assert 2 == len(tokens)
    assert 'remember' == tokens[0]
    assert 'this' == tokens[1]
    return channel, tokens[1]
```

You may want tokens containing whitespaces.
In that case, wrap your token with double quote(") like

```bash
!memo remember "kill -9 $(ps aux | grep gunicorn | grep -v 'grep' | awk '{print $2 }')"
```

# Cleanup

destroy provisioned cloud resources

```bash
$ cdk destroy "*"
$ aws ssm delete-parameter --name "/BEEBOT/SLACK/TOKEN/ACCESS"
$ aws ssm delete-parameter --name "/BEEBOT/SLACK/TOKEN/VERIFICATION"
```
