import * as path from 'path';
import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';
import * as sqs from '@aws-cdk/aws-sqs';
import * as lambda from '@aws-cdk/aws-lambda';

interface Props extends cdk.StackProps {
  queue: sqs.Queue;
  dlq: sqs.Queue;
  accessTokenKey: string;
  verificationTokenKey: string;
  apps: string;
  cmdPrefix: string;
}

export class SlackLambdaStack extends cdk.Stack {
  public readonly slackEventHandler: lambda.Function;
  public readonly slackConsumer: lambda.Function;
  public readonly dlqHandler: lambda.Function;

  constructor(scope: cdk.Construct, id: string, props: Props) {
    super(scope, id, props);

    const ns = scope.node.tryGetContext('ns') || '';

    const lambdaExecutionRole = new iam.Role(this, `${ns}LambdaExecution`, {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        { managedPolicyArn: 'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole' },
        { managedPolicyArn: 'arn:aws:iam::aws:policy/AmazonSSMFullAccess' },
      ],
    });

    this.slackEventHandler = new lambda.Function(this, `${ns}SlackEventHandler`, {
      runtime: lambda.Runtime.PYTHON_3_7,
      code: lambda.Code.fromAsset(path.resolve(__dirname, './functions/slack')),
      handler: 'event_handler.handler',
      role: lambdaExecutionRole,
      memorySize: 128,
      timeout: cdk.Duration.seconds(5),
      environment: {
        VERIFICATION_TOKEN_KEY: props.verificationTokenKey,
        QUEUE_URL: props.queue.queueUrl,
        CMD_PREFIX: props.cmdPrefix,
      },
      currentVersionOptions: {
        removalPolicy: cdk.RemovalPolicy.RETAIN,
      },
    });
    props.queue.grantSendMessages(this.slackEventHandler);

    const requestsLayer = new lambda.LayerVersion(this, `${ns}RequestsLayer`, {
      compatibleRuntimes: [
        lambda.Runtime.PYTHON_3_7,
        lambda.Runtime.PYTHON_3_8,
      ],
      code: lambda.Code.fromAsset(path.resolve(__dirname, './functions/layers/requests.zip')),
      description: `This is including below libraries.. ['requests']`,
    });

    this.slackConsumer = new lambda.Function(this, `${ns}SlackConsumer`, {
      runtime: lambda.Runtime.PYTHON_3_7,
      code: lambda.Code.fromAsset(path.resolve(__dirname, './functions/slack')),
      handler: 'consumer.handler',
      role: lambdaExecutionRole,
      memorySize: 256,
      timeout: cdk.Duration.seconds(5),
      environment: {
        ACCESS_TOKEN_KEY: props.accessTokenKey,
        QUEUE_URL: props.queue.queueUrl,
        APPS: props.apps,
        CMD_PREFIX: props.cmdPrefix,
      },
      currentVersionOptions: {
        removalPolicy: cdk.RemovalPolicy.RETAIN,
      },
      layers: [requestsLayer],
    });
    props.queue.grantConsumeMessages(this.slackConsumer);
    this.slackConsumer.addEventSourceMapping(`${ns}SlackConsumerMapping`, {
      eventSourceArn: props.queue.queueArn,
    });

    this.dlqHandler = new lambda.Function(this, `${ns}DLQHandler`, {
      runtime: lambda.Runtime.PYTHON_3_7,
      code: lambda.Code.fromAsset(path.resolve(__dirname, './functions/slack')),
      handler: 'dlq_handler.handler',
      role: lambdaExecutionRole,
      environment: {
        QUEUE_URL: props.dlq.queueUrl,
      },
      currentVersionOptions: {
        removalPolicy: cdk.RemovalPolicy.RETAIN,
      },
    });
    props.dlq.grantConsumeMessages(this.dlqHandler);
    this.dlqHandler.addEventSourceMapping(`${ns}DlqHandlerMapping`, {
      eventSourceArn: props.dlq.queueArn,
    });

  }

}