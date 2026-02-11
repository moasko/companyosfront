import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

async function main() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log('Cleaning database...');
  // Delete in order of dependencies (child first, then parent)
  await prisma.auditLog.deleteMany({});
  await prisma.webhook.deleteMany({});
  await prisma.apiKey.deleteMany({});
  await prisma.fileResource.deleteMany({});
  await prisma.purchaseOrderItem.deleteMany({});
  await prisma.purchaseOrder.deleteMany({});
  await prisma.invoiceItem.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.quoteItem.deleteMany({});
  await prisma.quote.deleteMany({});
  await prisma.accountingEntry.deleteMany({});
  await prisma.stockMovementItem.deleteMany({});
  await prisma.stockMovement.deleteMany({});
  await prisma.stockItem.deleteMany({});
  await prisma.stockCategory.deleteMany({});
  await prisma.supplier.deleteMany({});
  await prisma.deal.deleteMany({});
  await prisma.contactCrm.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.leaveRequest.deleteMany({});
  await prisma.printerSettings.deleteMany({});
  await prisma.payslip.deleteMany({});
  await prisma.employee.deleteMany({});
  await prisma.companyOwner.deleteMany({});
  await prisma.jobOpening.deleteMany({});
  await prisma.dictionary.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.company.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Database cleaned.');

  const hashedPassword = await bcrypt.hash('admin123', 10);

  const user = await prisma.user.create({
    data: {
      email: 'admin@enea.com',
      name: 'Super Admin',
      passwordHash: hashedPassword,
      isVerified: true,
      globalRole: 'SUPER_ADMIN',
    },
  });

  console.log('Admin user created:', user.email);

  // Create default company
  const company = await prisma.company.create({
    data: {
      entityName: 'ENEA Group',
      country: "Côte d'Ivoire",
      currency: 'XOF',
      flag: '🇨🇮',
      slug: 'enea-group',
      activity: 'Infrastructures Télécom & Énergie',
      sector: 'Télécom',
      legalForm: 'SA',
      city: 'Abidjan',
      email: 'contact@eneagroup.com',
      phone: '+225 27 22 55 44 33',
      address: 'Abidjan, Cocody Riviera 3, Rue E12',
    },
  });

  console.log('Company created:', company.entityName);

  // Link user to company as owner
  await prisma.companyOwner.create({
    data: {
      companyId: company.id,
      userId: user.id,
    },
  });

  // Seed dummy data for company business data
  await prisma.stockCategory.createMany({
    data: [
      { companyId: company.id, name: 'Pylônes' },
      { companyId: company.id, name: 'Solaire' },
      { companyId: company.id, name: 'Accessoires' },
    ],
  });

  console.log('Seed completed successfully!');
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
