
import { PrismaClient } from '../prisma/generated/prisma/client.js';
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
    await prisma.purchaseOrderItem.deleteMany({});
    await prisma.purchaseOrder.deleteMany({});
    await prisma.invoiceItem.deleteMany({});
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
    await prisma.location.deleteMany({});
    await prisma.stat.deleteMany({});
    await prisma.service.deleteMany({});
    await prisma.galleryItem.deleteMany({});
    await prisma.realizations.deleteMany({});
    await prisma.jobOpening.deleteMany({});
    await prisma.careers.deleteMany({});
    await prisma.dictionary.deleteMany({}); // Added Dictionary
    await prisma.contact.deleteMany({});
    await prisma.about.deleteMany({});
    await prisma.hero.deleteMany({});
    await prisma.seo.deleteMany({});
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
            globalRole: 'SUPER_ADMIN'
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
        }
    });

    console.log('Company created:', company.entityName);

    // Link user to company as owner
    await prisma.companyOwner.create({
        data: {
            companyId: company.id,
            userId: user.id
        }
    });

    // Seed CMS Content (Global)

    // 1. Hero
    await prisma.hero.create({
        data: {
            title: "Bâtir l'Avenir des Infrastructures",
            subtitle: "Leader régional en solutions télécoms et énergétiques. Nous connectons les communautés avec excellence et innovation pour un développement durable.",
            tagline: "Excellence & Innovation",
            imageUrl: "https://images.unsplash.com/photo-1542382103-b09e8432b49c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80"
        }
    });

    // 2. About
    await prisma.about.create({
        data: {
            title: "Une Expertise Reconnue en Afrique de l'Ouest",
            description: "Fondée avec la vision de transformer le paysage technologique africain, notre entreprise s'est imposée comme un partenaire incontournable pour les opérateurs télécoms et les acteurs de l'énergie. Notre approche combine expertise technique de pointe, connaissance approfondie du terrain et engagement sans faille envers la qualité.",
            vision: "Devenir le référent panafricain des infrastructures intelligentes et durables.",
            mission: "Accompagner la transformation numérique et énergétique du continent par des solutions robustes.",
            values: "Intégrité, Excellence, Innovation, Engagement"
        }
    });

    // 3. Stats
    await prisma.stat.createMany({
        data: [
            { label: "Années d'Expérience", value: "15+" },
            { label: "Projets Réalisés", value: "500+" },
            { label: "Collaborateurs", value: "120" },
            { label: "Pays Couverts", value: "4" }
        ]
    });

    // 4. Services (Globaux)
    const servicesData = [
        {
            title: "Infrastructures Télécom",
            description: "Conception et déploiement de pylônes, fibre optique et datacenters.",
            iconName: "TowerControl",
            features: ["Construction clé en main", "Fibre Optique FTTx", "Maintenance 24/7"]
        },
        {
            title: "Énergie & Solaire",
            description: "Solutions d'alimentation hybride pour sites isolés et industriels.",
            iconName: "Zap",
            features: ["Panneaux Solaires", "Groupes Électrogènes", "Batteries Lithium"]
        },
        {
            title: "Génie Civil",
            description: "Travaux de gros œuvre et aménagement pour sites techniques.",
            iconName: "Truck",
            features: ["Terrassement", "Fondations", "Routes d'accès"]
        },
        {
            title: "Maintenance & Opérations",
            description: "Gestion complète du cycle de vie de vos équipements.",
            iconName: "Wrench",
            features: ["Maintenance Préventive", "Monitoring à distance", "Ravitaillement"]
        }
    ];

    for (const s of servicesData) {
        await prisma.service.create({
            data: s
        });
    }

    // 5. Locations
    await prisma.location.createMany({
        data: [
            { country: "Côte d'Ivoire", flag: "🇨🇮", year: "2010", status: "Siège Social" },
            { country: "Sénégal", flag: "🇸🇳", year: "2015", status: "Filiale" },
            { country: "Mali", flag: "🇲🇱", year: "2018", status: "Bureau" },
            { country: "Burkina Faso", flag: "🇧🇫", year: "2020", status: "Opérations" }
        ]
    });

    // 6. Contact
    await prisma.contact.create({
        data: {
            email: "contact@eneagroup.com",
            phone: "+225 27 22 55 44 33",
            address: "Abidjan, Cocody Riviera 3, Rue E12",
            hours: "Lun - Ven: 08h00 - 18h00"
        }
    });

    // 7. Portfolio (Realizations + Gallery)
    const realizations = await prisma.realizations.create({
        data: {
            works: [
                "Déploiement Fibre Optique Abidjan Nord (50km)",
                "Construction de 20 sites GSM solaires - Zone Nord",
                "Maintenance passive de 150 sites Huawei",
                "Installation Datacenter Tier III pour Banque Centrale"
            ],
            clients: ["ORANGE", "MTN", "MOOV", "HUAWEI", "ERICSSON", "NOKIA"]
        }
    });

    await prisma.galleryItem.createMany({
        data: [
            { realizationsId: realizations.id, caption: "Site Solaire Hybride", category: "Energie", imageUrl: "https://images.unsplash.com/photo-1542382103-b09e8432b49c?auto=format&fit=crop&w=800&q=80" },
            { realizationsId: realizations.id, caption: "Pylône 4G Rural", category: "Telecom", imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80" },
            { realizationsId: realizations.id, caption: "Équipe Technique", category: "Equipe", imageUrl: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80" },
            { realizationsId: realizations.id, caption: "Fibre Optique", category: "Telecom", imageUrl: "https://images.unsplash.com/photo-1544197150-b99a580bbc7c?auto=format&fit=crop&w=800&q=80" }
        ]
    });

    // 8. Careers
    const careers = await prisma.careers.create({
        data: {
            title: "Rejoignez l'Aventure",
            subtitle: "Carrières",
            description: "Nous recherchons des talents passionnés pour relever les défis technologiques de demain. Chez ENEA, vous trouverez un environnement stimulant propice à l'innovation.",
            contactEmail: "jobs@eneagroup.com"
        }
    });

    await prisma.jobOpening.createMany({
        data: [
            { companyId: company.id, status: 'OPEN', careersId: careers.id, title: "Ingénieur Télécom Senior", location: "Abidjan", type: "CDI", description: "Expertise en RAN 4G/5G et transmission micro-ondes." },
            { companyId: company.id, status: 'OPEN', careersId: careers.id, title: "Technicien Fibre Optique", location: "Bouaké", type: "CDD", description: "Tirage, raccordement et mesure de câbles FO." },
            { companyId: company.id, status: 'OPEN', careersId: careers.id, title: "Chef de Projet Déploiement", location: "Dakar", type: "CDI", description: "Gestion de rollout, planning et coordination sous-traitants." }
        ]
    });

    // 9. SEO
    await prisma.seo.create({
        data: {
            metaTitle: "ENEA Group | Leader Infrastructures Télécom Afrique",
            metaDescription: "ENEA Group est spécialisé dans le déploiement d'infrastructures télécoms, d'énergie et de génie civil en Afrique de l'Ouest.",
            metaKeywords: "telecom, fibre optique, pylone, energie solaire, btp, afrique, cote d'ivoire"
        }
    });

    // Seed dummy data for company business data
    await prisma.stockCategory.createMany({
        data: [
            { companyId: company.id, name: 'Pylônes' },
            { companyId: company.id, name: 'Solaire' },
            { companyId: company.id, name: 'Accessoires' }
        ]
    });

    console.log('Seed completed successfully!');
    await prisma.$disconnect();
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
