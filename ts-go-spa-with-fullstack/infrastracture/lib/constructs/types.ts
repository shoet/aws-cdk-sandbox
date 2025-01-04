import { z } from "zod";

export const EnvironmentZodType = z.object({
  ROUTE53_HOSTED_ZONE_ID: z.string().nonempty(),
  ROUTE53_HOSTED_ZONE_NAME: z.string().nonempty(),
  DOMAIN_NAME: z.string().nonempty(),
  ACM_CERTIFICATE_ARN: z.string().nonempty(),
});
