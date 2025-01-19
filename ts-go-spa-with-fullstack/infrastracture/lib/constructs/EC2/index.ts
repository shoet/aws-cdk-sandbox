import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";

type BastionEC2Props = {
  vpc: cdk.aws_ec2.Vpc;
  instanceKeyPairName: string;
};

export class BastionEC2 extends Construct {
  public readonly instance: cdk.aws_ec2.Instance;
  constructor(scope: Construct, id: string, props: BastionEC2Props) {
    super(scope, id);

    // SSH接続用のセキュリティグループを作成
    const securityGroup = new cdk.aws_ec2.SecurityGroup(
      scope,
      "BastionSecurityGroup",
      {
        vpc: props.vpc,
        allowAllOutbound: true,
      }
    );

    securityGroup.addIngressRule(
      cdk.aws_ec2.Peer.anyIpv4(),
      cdk.aws_ec2.Port.tcp(22),
      "Allow SSH access from the world"
    );

    // 踏み台EC2インスタンスを作成
    this.instance = new cdk.aws_ec2.Instance(scope, "BastionEC2Instance", {
      vpc: props.vpc,
      instanceType: cdk.aws_ec2.InstanceType.of(
        cdk.aws_ec2.InstanceClass.T3,
        cdk.aws_ec2.InstanceSize.MICRO
      ),
      securityGroup: securityGroup,
      machineImage: cdk.aws_ec2.MachineImage.latestAmazonLinux2({}),
      vpcSubnets: {
        subnetType: cdk.aws_ec2.SubnetType.PUBLIC,
      },
      keyPair: cdk.aws_ec2.KeyPair.fromKeyPairName(
        scope,
        "KeyPair",
        props.instanceKeyPairName
      ),
    });
  }
}
