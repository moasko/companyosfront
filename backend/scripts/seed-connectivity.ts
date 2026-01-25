import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
    process.env.DATABASE_URL = process.env.DATABASE_URL; // Force refresh
    console.log('Using database:', process.env.DATABASE_URL?.split('@')[1]);
    const company = await prisma.company.findFirst();
    if (!company) {
        console.error('No company found. Please create a company first.');
        return;
    }

    console.log(`Adding connectivity data for company: ${company.entityName} (${company.id})`);

    // Add a sample Webhook
    const webhook = await prisma.webhook.create({
        data: {
            url: 'https://webhook.site/demo-erp',
            events: ['stock.low', 'invoice.paid'],
            isActive: true,
            companyId: company.id,
        }
    });
    console.log(`Created Webhook: ${webhook.id}`);

    // Add a sample API Key
    const apiKey = await prisma.apiKey.create({
        data: {
            name: 'External Dashboard',
            key: `pk_live_${Math.random().toString(36).substring(2, 15)}`,
            isActive: true,
            companyId: company.id,
        }
    });
    console.log(`Created API Key: ${apiKey.id}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        process.exit(0);
    });
