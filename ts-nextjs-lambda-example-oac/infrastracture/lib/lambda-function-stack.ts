import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  DockerImageFunction,
  DockerImageFunctionProps,
  DockerImageCode,
} from "aws-cdk-lib/aws-lambda";
import { FunctionUrl } from "aws-cdk-lib/aws-lambda";

export class LambdaFunctionStack extends Construct {
  public readonly function: cdk.aws_lambda.IFunction;
  public readonly functionUrl: FunctionUrl;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    const lambdaProps: DockerImageFunctionProps = {
      code: DockerImageCode.fromImageAsset("../application"),
      architecture: cdk.aws_lambda.Architecture.ARM_64,
      timeout: cdk.Duration.seconds(30),
      environment: {
        AWS_LWA_INVOKE_MODE: "response_stream",
      },
    };

    this.function = new DockerImageFunction(
      this,
      "NextJsLambdaFunction",
      lambdaProps
    );

    this.functionUrl = new FunctionUrl(this, "NextJsLambdaFunctionUrl", {
      function: this.function,
      authType: cdk.aws_lambda.FunctionUrlAuthType.AWS_IAM,
      invokeMode: cdk.aws_lambda.InvokeMode.RESPONSE_STREAM,
    });

    new cdk.CfnOutput(this, "NextJsLambdaFunctionUrl_url", {
      value: this.functionUrl.url,
    });
  }
}
