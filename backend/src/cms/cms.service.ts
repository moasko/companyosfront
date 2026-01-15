import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class CmsService {
    constructor(private prisma: PrismaService) { }

    async getHero(companyId?: string) {
        return this.prisma.hero.findFirst();
    }

    async updateHero(companyId: string, data: any) {
        const existing = await this.prisma.hero.findFirst();
        if (existing) {
            return this.prisma.hero.update({
                where: { id: existing.id },
                data
            });
        }
        return this.prisma.hero.create({
            data
        });
    }

    async updateAbout(companyId: string, data: any) {
        const existing = await this.prisma.about.findFirst();
        if (existing) {
            return this.prisma.about.update({
                where: { id: existing.id },
                data
            });
        }
        return this.prisma.about.create({
            data
        });
    }

    async updateContact(companyId: string, data: any) {
        const existing = await this.prisma.contact.findFirst();
        if (existing) {
            return this.prisma.contact.update({
                where: { id: existing.id },
                data
            });
        }
        return this.prisma.contact.create({
            data
        });
    }

    async updateSeo(companyId: string, data: any) {
        const existing = await this.prisma.seo.findFirst();
        if (existing) {
            return this.prisma.seo.update({
                where: { id: existing.id },
                data
            });
        }
        return this.prisma.seo.create({
            data
        });
    }

    async updateCareers(companyId: string, data: any) {
        const { openings, ...rest } = data;

        // Update basic careers info
        let careers = await this.prisma.careers.findFirst();
        if (careers) {
            careers = await this.prisma.careers.update({
                where: { id: careers.id },
                data: rest,
            });
        } else {
            careers = await this.prisma.careers.create({
                data: rest,
            });
        }

        // Handle job openings if provided
        if (openings) {
            // Job openings are still linked to a company (the entity hiring)
            await this.prisma.jobOpening.deleteMany({ where: { careersId: careers.id, companyId } });
            if (openings.length > 0) {
                await this.prisma.jobOpening.createMany({
                    data: openings.map(o => ({
                        ...o,
                        careersId: careers.id,
                        companyId: companyId,
                        status: o.status || 'OPEN'
                    }))
                });
            }
        }

        return careers;
    }

    async updateStats(companyId: string, stats: any[]) {
        // Stats are now global
        await this.prisma.stat.deleteMany({});
        return this.prisma.stat.createMany({
            data: stats.map(s => ({ value: s.value, label: s.label }))
        });
    }

    async updateLocations(companyId: string, locations: any[]) {
        // Locations are now global
        await this.prisma.location.deleteMany({});
        return this.prisma.location.createMany({
            data: locations.map(l => ({ country: l.country, flag: l.flag, year: l.year, status: l.status }))
        });
    }

    async updateServices(companyId: string, services: any[]) {
        // Services are already global by definition. 
        // We just need to ensure they exist.
        for (const s of services) {
            let service = await this.prisma.service.findFirst({ where: { title: s.title } });
            if (!service) {
                await this.prisma.service.create({
                    data: {
                        title: s.title,
                        description: s.description,
                        iconName: s.iconName,
                        features: s.features || []
                    }
                });
            }
        }
        // No more CompanyService relation to update
    }

    async updateRealizations(companyId: string, data: any) {
        const { works, gallery, clients } = data;

        let realizations = await this.prisma.realizations.findFirst();
        if (realizations) {
            realizations = await this.prisma.realizations.update({
                where: { id: realizations.id },
                data: { works, clients }
            });
        } else {
            realizations = await this.prisma.realizations.create({
                data: { works, clients }
            });
        }

        if (gallery) {
            await this.prisma.galleryItem.deleteMany({ where: { realizationsId: realizations.id } });
            if (gallery.length > 0) {
                await this.prisma.galleryItem.createMany({
                    data: gallery.map(g => ({ ...g, realizationsId: realizations.id }))
                });
            }
        }

        return realizations;
    }

    async seedContent(companyId: string) {
        // We just seed global content
        await this.updateHero(companyId, {
            title: "Bâtir l'Avenir des Infrastructures",
            subtitle: "Leader régional en solutions télécoms et énergétiques. Nous connectons les communautés avec excellence et innovation pour un développement durable.",
            tagline: "Excellence & Innovation",
            imageUrl: "https://images.unsplash.com/photo-1542382103-b09e8432b49c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80"
        });

        await this.updateAbout(companyId, {
            title: "Une Expertise Reconnue en Afrique de l'Ouest",
            description: "Fondée avec la vision de transformer le paysage technologique africain, notre entreprise s'est imposée comme un partenaire incontournable pour les opérateurs télécoms et les acteurs de l'énergie. Notre approche combine expertise technique de pointe, connaissance approfondie du terrain et engagement sans faille envers la qualité.",
            vision: "Devenir le référent panafricain des infrastructures intelligentes et durables.",
            mission: "Accompagner la transformation numérique et énergétique du continent par des solutions robustes.",
            values: "Intégrité, Excellence, Innovation, Engagement"
        });

        await this.updateStats(companyId, [
            { label: "Années d'Expérience", value: "15+" },
            { label: "Projets Réalisés", value: "500+" },
            { label: "Collaborateurs", value: "120" },
            { label: "Pays Couverts", value: "4" }
        ]);

        await this.updateServices(companyId, [
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
        ]);

        await this.updateLocations(companyId, [
            { country: "Côte d'Ivoire", flag: "🇨🇮", year: "2010", status: "Siège Social" },
            { country: "Sénégal", flag: "🇸🇳", year: "2015", status: "Filiale" },
            { country: "Mali", flag: "🇲🇱", year: "2018", status: "Bureau" },
            { country: "Burkina Faso", flag: "🇧🇫", year: "2020", status: "Opérations" }
        ]);

        await this.updateContact(companyId, {
            email: "contact@eneagroup.com",
            phone: "+225 27 22 55 44 33",
            address: "Abidjan, Cocody Riviera 3, Rue E12",
            hours: "Lun - Ven: 08h00 - 18h00"
        });

        await this.updateRealizations(companyId, {
            clients: ["ORANGE", "MTN", "MOOV", "HUAWEI", "ERICSSON", "NOKIA"],
            works: [
                "Déploiement Fibre Optique Abidjan Nord (50km)",
                "Construction de 20 sites GSM solaires - Zone Nord",
                "Maintenance passive de 150 sites Huawei",
                "Installation Datacenter Tier III pour Banque Centrale"
            ],
            gallery: [
                { caption: "Site Solaire Hybride", category: "Energie", imageUrl: "https://images.unsplash.com/photo-1542382103-b09e8432b49c?auto=format&fit=crop&w=800&q=80" },
                { caption: "Pylône 4G Rural", category: "Telecom", imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80" },
                { caption: "Équipe Technique", category: "Equipe", imageUrl: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80" },
                { caption: "Fibre Optique", category: "Telecom", imageUrl: "https://images.unsplash.com/photo-1544197150-b99a580bbc7c?auto=format&fit=crop&w=800&q=80" }
            ]
        });

        await this.updateCareers(companyId, {
            title: "Rejoignez l'Aventure",
            subtitle: "Carrières",
            description: "Nous recherchons des talents passionnés pour relever les défis technologiques de demain. Chez ENEA, vous trouverez un environnement stimulant propice à l'innovation.",
            contactEmail: "jobs@eneagroup.com",
            openings: [
                { title: "Ingénieur Télécom Senior", location: "Abidjan", type: "CDI", description: "Expertise en RAN 4G/5G et transmission micro-ondes." },
                { title: "Technicien Fibre Optique", location: "Bouaké", type: "CDD", description: "Tirage, raccordement et mesure de câbles FO." },
                { title: "Chef de Projet Déploiement", location: "Dakar", type: "CDI", description: "Gestion de rollout, planning et coordination sous-traitants." }
            ]
        });

        await this.updateSeo(companyId, {
            metaTitle: "ENEA Group | Leader Infrastructures Télécom Afrique",
            metaDescription: "ENEA Group est spécialisé dans le déploiement d'infrastructures télécoms, d'énergie et de génie civil en Afrique de l'Ouest.",
            metaKeywords: "telecom, fibre optique, pylone, energie solaire, btp, afrique, cote d'ivoire"
        });

        return this.getFullContent(companyId);
    }

    async getFullContent(companyId: string) {
        // 1. Fetch Company data
        const company = await this.prisma.company.findUnique({
            where: { id: companyId },
            include: {
                contacts: {
                    include: { deals: true, quotes: true }
                },
                deals: true
            }
        });

        if (!company) throw new NotFoundException('Company not found');

        // 2. Fetch Global CMS data separately
        const seo = await this.prisma.seo.findFirst();
        const hero = await this.prisma.hero.findFirst();
        const about = await this.prisma.about.findFirst();
        const contact = await this.prisma.contact.findFirst();
        const careers = await this.prisma.careers.findFirst({
            include: { jobOpenings: true }
        });
        const realizations = await this.prisma.realizations.findFirst({
            include: { gallery: true }
        });
        const stats = await this.prisma.stat.findMany();
        const locations = await this.prisma.location.findMany();
        const services = await this.prisma.service.findMany();

        // Map to SiteContent interface
        return {
            id: company.id,
            entityName: company.entityName,
            country: company.country,
            currency: company.currency,
            flag: company.flag,
            slug: company.slug,
            logo: company.logo,
            activity: company.activity,
            sector: company.sector,
            legalForm: company.legalForm,
            capital: company.capital,
            ncc: company.ncc,
            rccm: company.rccm,
            manager: company.manager,
            tvaRate: company.tvaRate,
            address: company.address,
            city: company.city,
            bp: company.bp,
            phone: company.phone,
            email: company.email,

            // Merged Global CMS content
            // Merged Global CMS content
            seo: seo || { metaTitle: company.entityName, metaDescription: '', metaKeywords: '', ogImage: '' },
            hero: hero || { title: "Bienvenue", subtitle: "Configuration requise", tagline: "", imageUrl: "" },
            about: about || { title: "", description: "", vision: "", mission: "", values: "" },
            contact: contact || { email: company.email || "", phone: company.phone || "", address: company.address || "", hours: "" },
            stats: (stats || []).map(s => ({ value: s.value, label: s.label })),
            locations: (locations || []).map(l => ({ country: l.country, flag: l.flag, year: l.year, status: l.status })),
            services: (services || []).map(s => ({
                id: s.id,
                title: s.title,
                description: s.description,
                iconName: s.iconName,
                features: s.features
            })),
            realizations: {
                works: realizations?.works || [],
                gallery: realizations?.gallery?.map(g => ({ caption: g.caption, category: g.category, imageUrl: g.imageUrl })) || []
            },
            careers: {
                title: careers?.title || '',
                subtitle: careers?.subtitle || '',
                description: careers?.description || '',
                contactEmail: careers?.contactEmail || '',
                openings: careers?.jobOpenings?.map(j => ({
                    id: j.id,
                    title: j.title,
                    location: j.location,
                    type: j.type,
                    description: j.description
                })) || []
            },
            clients: realizations?.clients || [],
            crm: {
                contacts: (company.contacts || []).map(c => ({
                    id: c.id,
                    company: c.companyName,
                    name: c.contactName,
                    email: c.email,
                    phone: c.phone,
                    status: c.status,
                    type: c.type
                })),
                deals: company.deals || []
            }
        };
    }
}
