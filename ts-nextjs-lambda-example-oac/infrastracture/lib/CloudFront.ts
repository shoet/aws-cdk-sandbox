import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";

export class CloudFront extends Construct {
  constructor(
    scope: Construct,
    id: string,
    lambdaFunction: cdk.aws_lambda.IFunction,
    lambdaFunctionUrl: cdk.aws_lambda.FunctionUrl
  ) {
    super(scope, id);

    const lambdaFunctionOAC =
      new cdk.aws_cloudfront.FunctionUrlOriginAccessControl(
        this,
        "LambdaFunctionOAC",
        {
          signing: cdk.aws_cloudfront.Signing.SIGV4_ALWAYS,
        }
      );

    const functionUrlOrigin = new cdk.aws_cloudfront_origins.FunctionUrlOrigin(
      lambdaFunctionUrl,
      {
        originAccessControlId: lambdaFunctionOAC.originAccessControlId,
      }
    );

    const distribution = new cdk.aws_cloudfront.Distribution(
      this,
      "NextJsDistribution",
      {
        defaultBehavior: {
          origin: functionUrlOrigin,
        },
      }
    );

    // https://docs.aws.amazon.com/ja_jp/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-lambda.html#oac-permission-to-access-lambda
    lambdaFunction.addPermission("AllowInfokeCloudFront", {
      action: "lambda:InvokefunctionUrl",
      principal: new cdk.aws_iam.ServicePrincipal("cloudfront.amazonaws.com"),
      sourceArn: `arn:aws:cloudfront::${cdk.Aws.ACCOUNT_ID}:distribution/${distribution.distributionId}`,
    });
  }
}
