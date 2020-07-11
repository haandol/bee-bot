import * as cdk from '@aws-cdk/core';
import * as sqs from '@aws-cdk/aws-sqs';

export class SqsStack extends cdk.Stack {
  public readonly queue: sqs.Queue;
  public readonly dlq: sqs.Queue;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const ns = scope.node.tryGetContext('ns') || '';

    this.dlq = new sqs.Queue(this, `${ns}DLQ`);

    this.queue = new sqs.Queue(this, `${ns}Queue`, {
      deadLetterQueue: {
        queue: this.dlq,
        maxReceiveCount: 5,
      }
    });
  }

}
 