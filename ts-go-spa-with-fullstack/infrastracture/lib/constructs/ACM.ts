import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";

export class ACM extends Construct {
  public readonly certificate: cdk.aws_certificatemanager.ICertificate;
  constructor(scope: Construct, id: string, props: { certificateArn: string }) {
    super(scope, id);
    this.certificate =
      cdk.aws_certificatemanager.Certificate.fromCertificateArn(
        this,
        "Certificate",
        props.certificateArn
      );

    new cdk.CfnOutput(this, "certificateArn", {
      value: this.certificate.certificateArn,
    });
  }
}
