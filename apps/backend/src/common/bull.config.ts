import { ConfigService } from '@nestjs/config';
import { BullRootModuleOptions } from '@nestjs/bullmq';
import { environment } from './environment';
import { BullMQOptions } from './general';

export const getBullConfig = (configService: ConfigService): BullRootModuleOptions => ({
  connection: {
    url: environment.REDIS_URL
  },
  defaultJobOptions: {
    attempts: BullMQOptions.ATTEMPTS as number,
    backoff: {
      type: BullMQOptions.BACKOFF_TYPE,
      delay: BullMQOptions.BACKOFF_DELAY as number,
    },
    removeOnComplete: { count: BullMQOptions.REMOVE_ON_COMPLETE_COUNT as number },
    removeOnFail: { count: BullMQOptions.REMOVE_ON_FAIL_COUNT as number },
  },
});   