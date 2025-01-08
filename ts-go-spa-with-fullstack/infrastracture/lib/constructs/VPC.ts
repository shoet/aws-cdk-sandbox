import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";

export class VPCStack extends Construct {
  public readonly vpc: cdk.aws_ec2.Vpc;

  constructor(scope: Construct, id: string, props?: any) {
    super(scope, id);

    this.vpc = new cdk.aws_ec2.Vpc(scope, "VPC", {
      maxAzs: 2,
      createInternetGateway: true,
      // natGateways: 1,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: "Public",
          subnetType: cdk.aws_ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: "Private",
          subnetType: cdk.aws_ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
        {
          cidrMask: 24,
          name: "Isolated",
          subnetType: cdk.aws_ec2.SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });
  }
}
