import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";

export class S3Stack extends cdk.Stack {
  public readonly bucket: cdk.aws_s3.Bucket;
  constructor(scope: Construct, id: string) {
    super(scope, id);

    // S3 Bucket
    this.bucket = new cdk.aws_s3.Bucket(this, "WebBucket", {
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "index.html",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      publicReadAccess: true,
      blockPublicAccess: cdk.aws_s3.BlockPublicAccess.BLOCK_ACLS,
    });

    // S3 Bucket Deployment
    new cdk.aws_s3_deployment.BucketDeployment(this, "DeployWebsite", {
      sources: [cdk.aws_s3_deployment.Source.asset("../web/dist")],
      destinationBucket: this.bucket,
    });

    new cdk.CfnOutput(this, "WebBucketOutput", {
      value: this.bucket.bucketName,
    });
  }
}
