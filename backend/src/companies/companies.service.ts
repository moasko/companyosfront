import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) { }

  async create(data: any, ownerId: string) {
    // Liste blanche des champs autorisés pour le modèle Company
    const {
      entityName,
      activity,
      sector,
      legalForm,
      capital,
      ncc,
      rccm,
      manager,
      tvaRate,
      address,
      city,
      bp,
      phone,
      email,
      country,
      currency,
      flag,
      slug,
      logo,
      primaryColor,
      secondaryColor,
      domain,
    } = data;

    console.log('Attempting to create company for user:', ownerId);
    if (!ownerId) throw new Error('User ID is missing in request');

    // Verify user exists in DB (could fail if DB was wiped but JWT still valid)
    const user = await this.prisma.user.findUnique({ where: { id: ownerId } });
    if (!user) {
      console.error('User not found in DB:', ownerId);
      throw new NotFoundException('User not found. Please log out and log back in.');
    }

    console.log('Company data:', { entityName, slug, country });

    // 2. Check slug availability
    const existing = await this.prisma.company.findUnique({ where: { slug } });
    if (existing) {
      throw new Error(`Le slug "${slug}" est déjà utilisé par une autre entreprise.`);
    }

    try {
      return await this.prisma.company.create({
        data: {
          entityName,
          activity,
          sector,
          legalForm,
          capital,
          ncc,
          rccm,
          manager,
          tvaRate,
          address,
          city,
          bp,
          phone,
          email,
          country,
          currency,
          flag,
          slug,
          logo,
          primaryColor,
          secondaryColor,
          domain,
          owners: {
            create: {
              userId: ownerId,
              role: 'OWNER',
            },
          },
          // Seed initial data for smoother onboarding
          stockCategories: {
            create: [
              { name: 'Marchandises' },
              { name: 'Matières Premières' },
              { name: 'Produits Finis' },
              { name: 'Services' },
              { name: 'Consommables' },
            ],
          },
          dictionaries: {
            create: [
              // Units
              { type: 'UNIT', value: 'Pièce', code: 'PCE' },
              { type: 'UNIT', value: 'Kilogramme', code: 'KG' },
              { type: 'UNIT', value: 'Litre', code: 'L' },
              { type: 'UNIT', value: 'Carton', code: 'CTN' },
              { type: 'UNIT', value: 'Mètre', code: 'M' },
              // Brands
              { type: 'BRAND', value: 'Divers', code: 'GEN' },
              // Departments
              { type: 'DEPARTMENT', value: 'Direction Générale', code: 'DG', color: '#0f172a' },
              {
                type: 'DEPARTMENT',
                value: 'Commercial & Marketing',
                code: 'COM',
                color: '#0ea5e9',
              },
              {
                type: 'DEPARTMENT',
                value: 'Technique / Opérations',
                code: 'OPS',
                color: '#f59e0b',
              },
              { type: 'DEPARTMENT', value: 'Finance & Compta', code: 'FIN', color: '#10b981' },
              { type: 'DEPARTMENT', value: 'Ressources Humaines', code: 'RH', color: '#ec4899' },
              // Expense Categories
              { type: 'EXPENSE_CATEGORY', value: 'Loyer & Charges Locatives' },
              { type: 'EXPENSE_CATEGORY', value: 'Électricité & Eau' },
              { type: 'EXPENSE_CATEGORY', value: 'Internet & Téléphone' },
              { type: 'EXPENSE_CATEGORY', value: 'Fournitures de Bureau' },
              { type: 'EXPENSE_CATEGORY', value: 'Salaires & Primes' },
              { type: 'EXPENSE_CATEGORY', value: 'Transport & Déplacements' },
            ],
          },
        },
        include: {
          owners: { include: { user: true } },
        },
      });
    } catch (error) {
      console.error('CRITICAL ERROR during company creation:', error);
      throw error;
    }
  }

  async findAll(user: any) {
    if (user.globalRole === 'SUPER_ADMIN') {
      return this.prisma.company.findMany({
        include: {
          owners: { include: { user: true } },
          stockItems: true,
          employees: true,
          contacts: true,
          deals: true,
          quotes: true,
          accounting: true,
        },
      });
    }
    return this.prisma.company.findMany({
      where: {
        OR: [
          { owners: { some: { userId: user.userId } } },
          { employees: { some: { userId: user.userId } } },
        ],
      },
      include: {
        owners: { include: { user: true } },
        stockItems: true,
        employees: true,
        contacts: true,
        deals: true,
        quotes: true,
        accounting: true,
        stockMovements: {
          take: 5,
          orderBy: { date: 'desc' },
        },
        payslips: true,
      },
    });
  }

  async findAllPublic() {
    return this.prisma.company.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        entityName: true,
        country: true,
        flag: true,
        slug: true,
        domain: true,
      },
    });
  }

  async findOne(id: string, user: any) {
    const company = await this.prisma.company.findFirst({
      where: {
        id,
        OR: [
          { owners: { some: { userId: user.userId } } },
          { employees: { some: { userId: user.userId } } },
        ],
      },
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }

    return company;
  }

  async update(id: string, data: any, user: any) {
    // Verify access first
    await this.findOne(id, user);

    const {
      entityName,
      activity,
      sector,
      legalForm,
      capital,
      ncc,
      rccm,
      manager,
      tvaRate,
      address,
      city,
      bp,
      phone,
      email,
      country,
      currency,
      flag,
      slug,
      logo,
      primaryColor,
      secondaryColor,
      domain,
      status,
      subscriptionPlan,
    } = data;

    return this.prisma.company.update({
      where: { id },
      data: {
        entityName,
        activity,
        sector,
        legalForm,
        capital,
        ncc,
        rccm,
        manager,
        tvaRate,
        address,
        city,
        bp,
        phone,
        email,
        country,
        currency,
        flag,
        slug,
        logo,
        primaryColor,
        secondaryColor,
        domain,
        status,
        subscriptionPlan,
      },
    });
  }
}
