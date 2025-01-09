import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";

export interface CDKResourceInitializerProps {
  vpc: cdk.aws_ec2.IVpc;
  config: { secretID: string };
  subnets_selection: cdk.aws_ec2.SubnetSelection;
  function_security_groups: cdk.aws_ec2.ISecurityGroup[];
  function_timeout: cdk.Duration;
  function_memory_size?: number;
  function_log_retention: cdk.aws_logs.RetentionDays;
}

export class CDKResourceInitializer extends Construct {
  public readonly custom_resource: cdk.custom_resources.AwsCustomResource;

  public readonly response: string;

  public readonly function: cdk.aws_lambda.Function;

  constructor(
    scope: Construct,
    id: string,
    props: CDKResourceInitializerProps
  ) {
    super(scope, id);

    const stack = cdk.Stack.of(this);

    const function_security_group = new cdk.aws_ec2.SecurityGroup(
      scope,
      "Function-SecurityGroup",
      {
        securityGroupName: `${id}FunctionSecurityGroup`,
        vpc: props.vpc,
        allowAllOutbound: true,
      }
    );

    const functionProps: cdk.aws_lambda_nodejs.NodejsFunctionProps = {
      entry: `${__dirname}/handler/index.ts`,
      handler: "handler", // エクスポートした関数名
      runtime: cdk.aws_lambda.Runtime.NODEJS_20_X, // ランタイム
      memorySize: props.function_memory_size || 128,
      functionName: `${id}-ResInit${stack.stackName}`,
      logRetention: props.function_log_retention,
      securityGroups: [
        function_security_group,
        ...props.function_security_groups,
      ],
      timeout: props.function_timeout,
      vpc: props.vpc,
      vpcSubnets: props.vpc.selectSubnets(props.subnets_selection),
    };

    this.function = new cdk.aws_lambda_nodejs.NodejsFunction(
      this,
      "Function",
      functionProps
    );

    this.function.addToRolePolicy(
      new cdk.aws_iam.PolicyStatement({
        resources: [props.config.secretID],
        actions: ["secretsmanager:GetSecretValue"],
      })
    );

    const sdkCall: cdk.custom_resources.AwsSdkCall = {
      service: "Lambda",
      action: "invoke",
      parameters: {
        FunctionName: this.function.functionName,
        Payload: JSON.stringify({
          config: props.config,
        }),
      },
      physicalResourceId: cdk.custom_resources.PhysicalResourceId.of(
        `${id}-AwsSdkCall-${
          this.function.currentVersion.version + Date.now().toString()
        }`
      ),
    };

    const customResourceFnRole = new cdk.aws_iam.Role(
      scope,
      "AwsCustomResourceRole",
      {
        assumedBy: new cdk.aws_iam.ServicePrincipal("lambda.amazonaws.com"),
      }
    );

    customResourceFnRole.addToPolicy(
      new cdk.aws_iam.PolicyStatement({
        resources: [
          `arn:aws:lambda:${stack.region}:${stack.account}:function:*-ResInit${stack.stackName}`,
        ],
        actions: ["lambda:InvokeFunction"],
      })
    );

    this.custom_resource = new cdk.custom_resources.AwsCustomResource(
      scope,
      "AwsCustomResource",
      {
        policy: cdk.custom_resources.AwsCustomResourcePolicy.fromSdkCalls({
          resources: cdk.custom_resources.AwsCustomResourcePolicy.ANY_RESOURCE,
        }),
        onUpdate: sdkCall,
        timeout: cdk.Duration.minutes(10),
        role: customResourceFnRole,
      }
    );

    this.response = this.custom_resource.getResponseField("Payload");
  }
}
