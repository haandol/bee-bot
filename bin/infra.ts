#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { ApiGatewayStack } from '../lib/api-gateway-stack';
import { SqsStack } from '../lib/sqs-stack';
import { SlackLambdaStack } from '../lib/slack-lambda-app-stack';
import { AppContext, BotProps } from '../lib/interfaces/constant';

const { ns } = AppContext;
const app = new cdk.App({
  context: AppContext,
});

const sqsStack = new SqsStack(app, `${ns}Sqs`);
const slackLambdaStack = new SlackLambdaStack(app, `${ns}Lambda`, {
  ...BotProps,
  queue: sqsStack.queue,
  dlq: sqsStack.dlq,
});
slackLambdaStack.addDependency(sqsStack);
const apiGatewayStack = new ApiGatewayStack(app, `${ns}ApiGateway`, {
  slackEventHandler: slackLambdaStack.slackEventHandler,
});
apiGatewayStack.addDependency(slackLambdaStack);