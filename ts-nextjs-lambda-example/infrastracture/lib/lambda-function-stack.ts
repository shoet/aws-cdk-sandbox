import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  DockerImageFunction,
  DockerImageFunctionProps,
  DockerImageCode,
} from "aws-cdk-lib/aws-lambda";
import { FunctionUrl } from "aws-cdk-lib/aws-lambda";

export class LambdaFunctionStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const lambdaProps: DockerImageFunctionProps = {
      code: DockerImageCode.fromImageAsset("../application"),
      architecture: cdk.aws_lambda.Architecture.ARM_64,
      timeout: cdk.Duration.seconds(30),
      environment: {
        AWS_LWA_INVOKE_MODE: "response_stream",
      },
    };

    const nextjsFunction = new DockerImageFunction(
      this,
      "NextJsLambdaFunction",
      lambdaProps
    );

    new FunctionUrl(this, "NextJsLambdaFunctionUrl", {
      function: nextjsFunction,
      authType: cdk.aws_lambda.FunctionUrlAuthType.NONE,
      invokeMode: cdk.aws_lambda.InvokeMode.RESPONSE_STREAM,
    });
  }
}
