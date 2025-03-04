import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as rds from "aws-cdk-lib/aws-rds";
import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import { CDKResourceInitializer } from "./custom";

interface Props {
  vpc: ec2.Vpc;
  instancePort?: number;
}

/**
 * RDS は、RDSインスタンスを構築します。
 * また、RDSインスタンスに対して、カスタムリソースを使用して、Lambda関数をデプロイし実行します。
 */
export class RDS extends Construct {
  public readonly instance: rds.DatabaseInstance;

  public readonly credentialsSecretName: string;
  public readonly credentials: rds.DatabaseSecret;
  public readonly crednetialsSecretArn: string;
  public readonly instanceConnectionPort: number;

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    const instance_id = "my-sql-instance";
    this.credentialsSecretName = `${instance_id}-credentials`;

    this.credentials = new cdk.aws_rds.DatabaseSecret(
      scope,
      "MySQLCredentials",
      {
        secretName: this.credentialsSecretName,
        username: "admin",
      }
    );

    this.crednetialsSecretArn = this.credentials.secretArn;

    this.instanceConnectionPort = props.instancePort || 3306;

    this.instance = new cdk.aws_rds.DatabaseInstance(
      scope,
      "MySQL-RDS-Instance",
      {
        // multiAZのvpcのPrivateサブネットにデプロイする
        vpc: props.vpc,
        publiclyAccessible: false,
        vpcSubnets: {
          onePerAz: true,
          subnetType: cdk.aws_ec2.SubnetType.PRIVATE_ISOLATED,
        },
        port: this.instanceConnectionPort,
        databaseName: "mydb",
        // バージョンを指定する
        engine: cdk.aws_rds.DatabaseInstanceEngine.mysql({
          version: cdk.aws_rds.MysqlEngineVersion.VER_8_0_40,
        }),
        // インスタンスタイプを指定する
        instanceType: cdk.aws_ec2.InstanceType.of(
          // 対応しているインスタンスタイプはこちらを参照
          // https://docs.aws.amazon.com/ja_jp/AmazonRDS/latest/UserGuide/Concepts.DBInstanceClass.Support.html
          cdk.aws_ec2.InstanceClass.T3,
          cdk.aws_ec2.InstanceSize.SMALL
        ),
        // credentialsを指定する
        credentials: rds.Credentials.fromSecret(this.credentials),
        // テスト用なので削除保護を無効にする
        deletionProtection: false,
      }
    );

    const customResource = new CDKResourceInitializer(scope, "RDSInitializer", {
      vpc: props.vpc,
      function_timeout: cdk.Duration.minutes(2),
      function_log_retention: cdk.aws_logs.RetentionDays.ONE_DAY,
      function_security_groups: [this.instance.connections.securityGroups[0]],
      subnets_selection: {
        subnetType: cdk.aws_ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      config: {
        secretID: this.credentials.secretArn,
      },
    });

    this.instance.connections.allowFrom(
      customResource.function,
      cdk.aws_ec2.Port.tcp(this.instanceConnectionPort)
    );

    customResource.function.node.addDependency(this.instance);
  }
}
