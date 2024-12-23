import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

export class CloudFrontStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    lambdaFunctionrl: cdk.aws_lambda.FunctionUrl,
    props?: cdk.StackProps
  ) {
    super(scope, id, props);

    // LambdaFunctionURLsのOriginAccessControlを作成
    const oac = new cdk.aws_cloudfront.FunctionUrlOriginAccessControl(
      this,
      "FunctionUrlOAC"
    );

    // LambdaFunctionURLsのOriginを作成
    const lambdaFunctionUrlOrigin =
      new cdk.aws_cloudfront_origins.FunctionUrlOrigin(lambdaFunctionrl, {
        originAccessControlId: oac.originAccessControlId,
      });

    // CloudFrontDistributionを作成
    new cdk.aws_cloudfront.Distribution(this, "NextJsDistribution", {
      defaultBehavior: {
        origin: lambdaFunctionUrlOrigin,
      },
    });

    // CloudFrontのOriginの画面に表示されたOACへのAddPermissionコマンドを実行する
  }
}
