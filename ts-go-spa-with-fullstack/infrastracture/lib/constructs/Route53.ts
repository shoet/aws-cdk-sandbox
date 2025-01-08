import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";

export class Route53 extends Construct {
  constructor(
    scope: Construct,
    id: string,
    props: {
      hostedZoneId: string;
      hostedZoneName: string;
      domainName: string;
      loadBalancer: cdk.aws_elasticloadbalancingv2.ILoadBalancerV2;
    }
  ) {
    super(scope, id);

    const hostedZone = cdk.aws_route53.HostedZone.fromHostedZoneAttributes(
      this,
      "HostedZone",
      {
        hostedZoneId: props.hostedZoneId,
        zoneName: props.hostedZoneName,
      }
    );

    const albAlias = cdk.aws_route53.RecordTarget.fromAlias(
      new cdk.aws_route53_targets.LoadBalancerTarget(props.loadBalancer)
    );

    new cdk.aws_route53.ARecord(this, "ARecord", {
      zone: hostedZone,
      target: albAlias,
      recordName: props.domainName,
    });
  }
}
