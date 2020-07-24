import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
import * as apigw from '@aws-cdk/aws-apigateway';

interface Props extends cdk.StackProps {
  slackEventHandler: lambda.Function;
}

export class ApiGatewayStack extends cdk.Stack {
  private readonly api: apigw.RestApi;
  private readonly credentialsRole: iam.Role;

  constructor(scope: cdk.Construct, id: string, props: Props) {
    super(scope, id, props);

    const ns = scope.node.tryGetContext('ns') || '';

    // ApiGateway
    this.api = this.createApiGateway(ns);
    this.api.root.addMethod('ANY')

    this.credentialsRole = new iam.Role(this, `${ns}ApigwCredentialRole`, {
      assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
      managedPolicies: [
        { managedPolicyArn: 'arn:aws:iam::aws:policy/service-role/AmazonAPIGatewayPushToCloudWatchLogs' },
        { managedPolicyArn: 'arn:aws:iam::aws:policy/AWSLambdaFullAccess' },
      ]
    });

    const methodOptions: apigw.MethodOptions = {
      methodResponses: [
        {
          statusCode: '200',
          responseModels: {
            'application/json': apigw.Model.EMPTY_MODEL,
          },
        }
      ],
    };

    this.registerSlackEventHandler(
      props.slackEventHandler,
      this.api.root.addResource('slack'),
      methodOptions
    );
 }

  createApiGateway(ns: string): apigw.RestApi {
    return new apigw.RestApi(this, `${ns}RestApi`, {
      deploy: true,
      deployOptions: {
        stageName: 'dev',
        metricsEnabled: true,
        loggingLevel: apigw.MethodLoggingLevel.ERROR,
      },
      endpointConfiguration: {
        types: [apigw.EndpointType.REGIONAL],
      },
    });
  }

  registerSlackEventHandler(f: lambda.Function, resource: apigw.Resource, methodOptions: apigw.MethodOptions) {
    const lambdaIntegration = new apigw.LambdaIntegration(f, {
      proxy: false,
      credentialsRole: this.credentialsRole,
      passthroughBehavior: apigw.PassthroughBehavior.NEVER,
      requestTemplates: {
        'application/json': `$input.json('$')`,
      },
      integrationResponses: [
        { statusCode: '200' }
      ],
    });
    resource.addMethod('POST', lambdaIntegration, methodOptions);
  }

}