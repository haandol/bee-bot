#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { ApiGatewayStack } from '../lib/api-gateway-stack';
import { SqsStack } from '../lib/sqs-stack';
import { SlackLambdaStack } from '../lib/slack-lambda-app-stack';
import { Namespace, Region } from '../lib/interfaces/constant';

const app = new cdk.App({
  context: {
    ns: Namespace,
    region: Region,
    token: 'xoxb-1137511909639-1255395780720-mSjfyv93nW3F7xAaeOXi59pV',
    apps: JSON.stringify(['hello_world', 'helper']),
  },
});

const sqsStack = new SqsStack(app, `${Namespace}Sqs`);
const slackLambdaStack = new SlackLambdaStack(app, `${Namespace}Lambda`, {
  queue: sqsStack.queue,
  dlq: sqsStack.dlq,
});
slackLambdaStack.addDependency(sqsStack);
const apiGatewayStack = new ApiGatewayStack(app, `${Namespace}ApiGateway`, {
  slackEventHandler: slackLambdaStack.slackEventHandler,
});
apiGatewayStack.addDependency(slackLambdaStack);