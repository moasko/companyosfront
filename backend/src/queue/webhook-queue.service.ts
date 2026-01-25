import { Injectable, Logger } from '@nestjs/common';

interface WebhookJob {
    url: string;
    event: string;
    payload: any;
    secret?: string;
    retries: number;
    maxRetries: number;
}

@Injectable()
export class WebhookQueueService {
    private readonly logger = new Logger(WebhookQueueService.name);
    private queue: WebhookJob[] = [];
    private processing = false;

    /**
     * Add a webhook to the queue for asynchronous processing
     */
    async enqueue(url: string, event: string, payload: any, secret?: string) {
        const job: WebhookJob = {
            url,
            event,
            payload,
            secret,
            retries: 0,
            maxRetries: 3,
        };

        this.queue.push(job);
        this.logger.log(`Webhook enqueued: ${event} -> ${url}`);

        // Start processing if not already running
        if (!this.processing) {
            this.processQueue();
        }
    }

    /**
     * Process the webhook queue asynchronously
     */
    private async processQueue() {
        if (this.queue.length === 0) {
            this.processing = false;
            return;
        }

        this.processing = true;
        const job = this.queue.shift();

        if (!job) {
            this.processing = false;
            return;
        }

        try {
            await this.executeWebhook(job);
            this.logger.log(`✓ Webhook sent: ${job.event} -> ${job.url}`);
        } catch (error: any) {
            this.logger.error(`✗ Webhook failed: ${job.url} - ${error.message}`);

            // Retry logic
            if (job.retries < job.maxRetries) {
                job.retries++;
                this.queue.push(job); // Re-queue for retry
                this.logger.warn(`Retrying webhook (${job.retries}/${job.maxRetries}): ${job.url}`);
            } else {
                this.logger.error(`Webhook permanently failed after ${job.maxRetries} retries: ${job.url}`);
            }
        }

        // Process next job with a small delay to avoid overwhelming the system
        setTimeout(() => this.processQueue(), 100);
    }

    /**
     * Execute a single webhook HTTP request
     */
    private async executeWebhook(job: WebhookJob): Promise<void> {
        const response = await fetch(job.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-ERP-Event': job.event,
                'X-ERP-Signature': job.secret || '',
                'User-Agent': 'ENEA-ERP-Webhook/1.0',
            },
            body: JSON.stringify({
                event: job.event,
                timestamp: new Date().toISOString(),
                data: job.payload,
            }),
            signal: AbortSignal.timeout(10000), // 10s timeout
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
    }

    /**
     * Get current queue status (for monitoring)
     */
    getQueueStatus() {
        return {
            queueLength: this.queue.length,
            processing: this.processing,
        };
    }
}
