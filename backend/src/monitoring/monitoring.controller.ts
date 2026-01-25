import { Controller, Get } from '@nestjs/common';
import { WebhookQueueService } from '../queue/webhook-queue.service';

@Controller('monitoring')
export class MonitoringController {
    constructor(private webhookQueue: WebhookQueueService) { }

    @Get('queue-status')
    getQueueStatus() {
        return {
            webhook: this.webhookQueue.getQueueStatus(),
            timestamp: new Date().toISOString(),
        };
    }

    @Get('health')
    getHealth() {
        return {
            status: 'ok',
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            timestamp: new Date().toISOString(),
        };
    }
}
