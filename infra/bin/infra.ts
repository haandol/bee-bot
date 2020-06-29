#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { ApiGatewayStack } from '../lib/api-gateway-stack';
import {
  Namespace, AppEnv, Region,
} from '../lib/interfaces/constant';
import { LambdaStack } from '../lib/lambda-app-stack';

const app = new cdk.App({
  context: {
    ns: Namespace,
    appEnv: AppEnv.DEV,
    region: Region,
  },
});

const lambdaStack = new LambdaStack(app, `LambdaStack${Namespace}`);
const apiGatewayStack = new ApiGatewayStack(app, `ApiGatewayStack${Namespace}`, {
  slackEventHandlerFunction: lambdaStack.slackEventHandlerFunction,
});
apiGatewayStack.addDependency(lambdaStack);