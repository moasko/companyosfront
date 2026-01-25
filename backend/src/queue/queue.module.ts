import { Module, Global } from '@nestjs/common';
import { WebhookQueueService } from './webhook-queue.service';

@Global()
@Module({
    providers: [WebhookQueueService],
    exports: [WebhookQueueService],
})
export class QueueModule { }
