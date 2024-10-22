import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  APP_PORT: number;
  NATS_SERVERS: string[];
  STRIPE_SECRET: string;
  STRIPE_SUCCESS_URL: string;
  STRIPE_CANCEL_URL: string;
  STRIPE_ENDPOINT_SECRET: string;
}

const envsSchema = joi
  .object({
    APP_PORT: joi.number().required(),
    NATS_SERVERS: joi.array().items(joi.string()).required(),
    STRIPE_SECRET: joi.string().required(),
    STRIPE_SUCCESS_URL: joi.string().required(),
    STRIPE_CANCEL_URL: joi.string().required(),
    STRIPE_ENDPOINT_SECRET: joi.string().required(),
  })
  .unknown(true);

const { error, value } = envsSchema.validate({
  ...process.env,
  NATS_SERVERS: process.env.NATS_SERVERS?.split(','),
});

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}
const envVars: EnvVars = value;

export const envs = {
  appPort: envVars.APP_PORT,
  natsServers: envVars.NATS_SERVERS,
  stripe: {
    secret: envVars.STRIPE_SECRET,
    successUrl: envVars.STRIPE_SUCCESS_URL,
    cancelUrl: envVars.STRIPE_CANCEL_URL,
    endpointSecret: envVars.STRIPE_ENDPOINT_SECRET
  },
};
