import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";

export class Route53 extends Construct {
  public readonly hostedZone: cdk.aws_route53.IHostedZone;
  constructor(
    scope: Construct,
    id: string,
    props: {
      hostedZoneId: string;
      hostedZoneName: string;
      domainName: string;
    }
  ) {
    super(scope, id);

    this.hostedZone = cdk.aws_route53.HostedZone.fromHostedZoneAttributes(
      this,
      "HostedZone",
      {
        hostedZoneId: props.hostedZoneId,
        zoneName: props.hostedZoneName,
      }
    );
  }
}
