import * as path from 'path';
import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';

export class LambdaStack extends cdk.Stack {
  public readonly slackEventHandlerFunction: lambda.Function;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const ns = scope.node.tryGetContext('ns') || '';

    const lambdaExecutionRole = new iam.Role(this, `LambdaExecutionRole${ns}`, {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        { managedPolicyArn: 'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole' },
      ],
    });

    // slack event Handler
    this.slackEventHandlerFunction = new lambda.Function(this, `SlackEventHandlerFunction${ns}`, {
      runtime: lambda.Runtime.PYTHON_3_7,
      code: lambda.Code.fromAsset(path.resolve(__dirname, './functions/slack')),
      handler: 'event_handler.handler',
      role: lambdaExecutionRole,
    });

    const lexTestHandlerFunction = new lambda.Function(this, `LexTestHandlerFunction${ns}`, {
      runtime: lambda.Runtime.PYTHON_3_7,
      code: lambda.Code.fromAsset(path.resolve(__dirname, './functions/lex')),
      handler: 'test.handler',
      role: lambdaExecutionRole,
    });
    lexTestHandlerFunction.grantInvoke(new iam.ServicePrincipal('lex.amazonaws.com'))
 
  }

}