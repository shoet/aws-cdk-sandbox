import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { LambdaFunctionStack } from "../lib/lambda-function-stack";
import { CloudFrontStack } from "../lib/cloudfront-stack";

export class InfrastractureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const lambdaFunctionStack = new LambdaFunctionStack(
      this,
      "LambdaFunctionStack"
    );

    const cloudfrontStack = new CloudFrontStack(
      this,
      "CloudFrontStack",
      lambdaFunctionStack.lambdaFunctionUrl
    );
  }
}
