import { SiteContent } from './types';

// Données partagées de base
const SHARED_SERVICES = [
  {
    id: '1',
    title: 'Engineering',
    description: 'Conception et planification de réseaux de télécommunications sur mesure.',
    features: ['Études techniques', 'Design de réseaux', 'Optimisation'],
    iconName: 'Engineering',
  },
  {
    id: '2',
    title: 'Networking',
    description: "Déploiement et configuration d'infrastructures réseau robustes.",
    features: ['Installation', 'Configuration', 'Maintenance'],
    iconName: 'Networking',
  },
  {
    id: '3',
    title: 'Energy',
    description: 'Solutions énergétiques pour alimenter vos équipements télécoms.',
    features: ['Systèmes solaires', 'Groupes électrogènes', 'Batteries'],
    iconName: 'Energy',
  },
  {
    id: '4',
    title: 'Assistance',
    description: 'Support technique et maintenance de vos installations.',
    features: ['Support 24/7', 'Maintenance préventive', 'Dépannage'],
    iconName: 'Assistance',
  },
];

const SHARED_LOCATIONS = [
  { country: "Côte d'Ivoire", flag: '🇨🇮', year: '2013', status: 'Siège social' },
  { country: 'Burkina Faso', flag: '🇧🇫', year: '2019', status: 'Expansion' },
  { country: 'Togo', flag: '🇹🇬', year: '2023', status: 'Nouvelle présence' },
  { country: 'Bénin', flag: '🇧🇯', year: '2024', status: 'Dernière implantation' },
];

export const INITIAL_COMPANIES: SiteContent[] = [
  // --- ENTREPRISE 1 : CÔTE D'IVOIRE (SIÈGE) ---
  {
    id: 'ci-01',
    entityName: 'ENEA TELECOM CI',
    country: "Côte d'Ivoire",
    currency: 'CFA',
    flag: '🇨🇮',

    seo: {
      metaTitle: 'ENEA TELECOM CI - Expert Infrastructures Télécoms',
      metaDescription:
        "ENEA TELECOM est le leader du déploiement de réseaux de télécommunications en Côte d'Ivoire. Fibre optique, énergie, et maintenance.",
      metaKeywords: "telecom, fibre optique, abidjan, cote d'ivoire, energie solaire",
      ogImage:
        'https://images.unsplash.com/photo-1542382103-b09e8432b49c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    },
    hero: {
      title: 'Infrastructure Télécom Leader en RCI',
      subtitle: "Votre partenaire de confiance pour le déploiement réseau en Côte d'Ivoire.",
      tagline: 'Expertise locale, Standards internationaux.',
    },
    about: {
      title: "ENEA TELECOM CÔTE D'IVOIRE",
      description:
        "Basée à Abidjan depuis 2013, notre filiale ivoirienne est le cœur historique de nos activités. Nous opérons sur l'ensemble du territoire national avec des équipes dédiées.",
      vision: 'Être le référent national en ingénierie télécom.',
      mission: 'Connecter les ivoiriens grâce à des infrastructures fiables.',
      values: 'Excellence, Sécurité, Innovation.',
    },
    stats: [
      { value: '10+', label: "Années d'expérience" },
      { value: '50+', label: 'Collaborateurs' },
      { value: '100+', label: 'Projets Réussis' },
      { value: '24/7', label: 'Support Technique' },
    ],
    locations: SHARED_LOCATIONS,
    services: SHARED_SERVICES,
    contact: {
      email: 'contact.ci@enea-telecom.com',
      phone: '+225 07 07 07 07 07',
      address: "Cocody Riviera, Abidjan, Côte d'Ivoire",
      hours: 'Lun - Ven: 8h - 18h | Sam: 8h - 12h',
    },
    realizations: {
      works: ['Déploiement Fibre Abidjan', 'Maintenance Pylônes MTN', 'Sites Solaires Nord'],
      gallery: [
        { caption: "Construction d'un pylône Haubané - Abidjan", category: 'Construction' },
        { caption: 'Fibre optique - Déploiement FTTH Cocody', category: 'Fibre' },
      ],
    },
    careers: {
      title: 'Rejoignez ENEA CI',
      subtitle: 'Carrières Abidjan',
      description: 'Nous recrutons les meilleurs talents ivoiriens.',
      contactEmail: 'rh.ci@enea-telecom.com',
      openings: [
        {
          id: '1',
          title: 'Ingénieur Déploiement Fibre',
          location: "Abidjan, Côte d'Ivoire",
          type: 'CDI',
          description: 'Pilotage des équipes de tirage et raccordement.',
        },
      ],
    },
    clients: ['Orange CI', 'MTN CI', 'Moov Africa CI', 'ATC'],

    // Données ERP CI
    erp: {
      stock: [
        {
          id: '1',
          type: 'Produit',
          ref: 'FIB-SM-48',
          name: 'Câble Fibre Optique Monomode 48 Fo',
          category: 'Câblage',
          quantity: 4500,
          unit: 'm',
          minThreshold: 1000,
          location: 'Entrepôt Abidjan',
          value: 250,
          sellingPrice: 400,
          status: 'Publié',
        },
        {
          id: '2',
          type: 'Produit',
          ref: 'PYL-AUT-30',
          name: 'Pylône Autostable 30m',
          category: 'Structure',
          quantity: 3,
          unit: 'u',
          minThreshold: 2,
          location: 'Yopougon',
          value: 12000000,
          sellingPrice: 15000000,
          status: 'Publié',
        },
      ],
      suppliers: [
        {
          id: '1',
          name: 'Huawei CI',
          contactName: 'Mr. Zhang',
          email: 'sales@huawei.ci',
          phone: '+225 01010101',
          address: 'Abidjan',
          category: 'Équipements',
        },
      ],
      movements: [],
      hr: [
        {
          id: '1',
          matricule: 'CI-001',
          fullName: 'Kouassi Jean',
          position: 'Directeur Pays',
          department: 'Direction',
          email: 'j.kouassi@enea.com',
          phone: '+225 07070701',
          address: 'Abidjan',
          baseSalary: 2500000,
          status: 'Actif',
          contractType: 'CDI',
          joinDate: '2015-03-12',
        },
      ],
      payslips: [],
      accounting: [
        {
          id: '1',
          date: '2023-10-01',
          ref: 'FAC-CI-01',
          label: 'Prestation MTN CI',
          category: '706 - Prestations',
          amount: 15000000,
          type: 'Credit',
          status: 'Validé',
        },
      ],
      quotes: [
        {
          id: '1',
          reference: 'DEV-CI-001',
          clientId: '1',
          clientName: 'MTN CI',
          date: '2023-10-20',
          validUntil: '2023-11-20',
          status: 'Envoyé',
          totalAmount: 15000000,
          items: [],
        },
      ],
    },

    // CRM CI
    crm: {
      contacts: [
        {
          id: '1',
          company: 'MTN CI',
          contactName: 'M. Touré',
          email: 'achat@mtn.ci',
          phone: '+225 07070701',
          address: 'Plateau',
          type: 'Client',
          status: 'Actif',
          lastContact: '2023-10-25',
          industry: 'Telecom',
        },
      ],
      deals: [
        {
          id: '1',
          title: 'Contrat Maintenance Abidjan',
          contactId: '1',
          amount: 45000000,
          stage: 'Négociation',
          probability: 80,
          closingDate: '2023-12-15',
        },
      ],
    },
  },

  // --- ENTREPRISE 2 : BURKINA FASO ---
  {
    id: 'bf-01',
    entityName: 'ENEA BURKINA',
    country: 'Burkina Faso',
    currency: 'CFA',
    flag: '🇧🇫',

    seo: {
      metaTitle: 'ENEA BURKINA - Solutions Télécoms & Énergie',
      metaDescription: 'Expertise télécom et énergie solaire au Burkina Faso. Basés à Ouagadougou.',
      metaKeywords: 'telecom, burkina faso, ouagadougou, energie solaire, mines',
      ogImage: '',
    },
    hero: {
      title: 'Solutions Télécoms au Burkina',
      subtitle: 'Expertise technique pour les opérateurs et les industries minières.',
      tagline: 'Fiabilité en milieu extrême.',
    },
    about: {
      title: 'ENEA BURKINA FASO',
      description:
        'Implantée à Ouagadougou depuis 2019, notre filiale burkinabé est spécialisée dans les solutions pour zones isolées et les infrastructures minières.',
      vision: 'Désenclaver les régions par la technologie.',
      mission: "Apporter l'énergie et la connectivité partout.",
      values: 'Robustesse, Engagement, Proximité.',
    },
    stats: [
      { value: '4', label: 'Années de présence' },
      { value: '20+', label: 'Techniciens' },
      { value: '15', label: 'Sites Miniers' },
      { value: '98%', label: 'Disponibilité' },
    ],
    locations: SHARED_LOCATIONS,
    services: SHARED_SERVICES,
    contact: {
      email: 'contact.bf@enea-telecom.com',
      phone: '+226 70 70 70 70',
      address: 'Ouaga 2000, Ouagadougou, Burkina Faso',
      hours: 'Lun - Ven: 7h30 - 16h30',
    },
    realizations: {
      works: ["Liaison FH Mine d'Or", 'Solarisation Sites Isolés', 'Maintenance Fibre Ouaga'],
      gallery: [
        { caption: 'Pylône AutoSable Mobile - Sahel', category: 'Mobile' },
        { caption: 'Construction site RDU - Bobo', category: 'RDU' },
      ],
    },
    careers: {
      title: 'Recrutement Burkina',
      subtitle: 'Rejoignez-nous',
      description: 'Postes ouverts à Ouagadougou et sur sites miniers.',
      contactEmail: 'rh.bf@enea-telecom.com',
      openings: [
        {
          id: '2',
          title: 'Technicien Radio & Transmission',
          location: 'Ouagadougou',
          type: 'CDD',
          description: 'Installation et maintenance des équipements radio.',
        },
      ],
    },
    clients: ['Orange BF', 'Telecel', 'Endeavour Mining'],

    // ERP BF
    erp: {
      stock: [
        {
          id: '1',
          type: 'Produit',
          ref: 'PAN-SOL-300',
          name: 'Panneau Solaire 300W',
          category: 'Énergie',
          quantity: 150,
          unit: 'u',
          minThreshold: 20,
          location: 'Dépôt Ouaga',
          value: 85000,
          sellingPrice: 120000,
          status: 'Publié',
        },
        {
          id: '2',
          type: 'Produit',
          ref: 'BATT-GEL-200',
          name: 'Batterie Gel 12V 200Ah',
          category: 'Énergie',
          quantity: 40,
          unit: 'u',
          minThreshold: 10,
          location: 'Dépôt Ouaga',
          value: 130000,
          sellingPrice: 250000,
          status: 'Publié',
        },
      ],
      suppliers: [
        {
          id: '1',
          name: 'Solaris BF',
          contactName: 'M. Ouedraogo',
          email: 'sales@solaris.bf',
          phone: '+226 70707070',
          address: 'Ouaga',
          category: 'Énergie',
        },
      ],
      movements: [],
      hr: [
        {
          id: '1',
          matricule: 'BF-001',
          fullName: 'Sawadogo Moussa',
          position: 'Chef de Projet',
          department: 'Ops',
          email: 'm.sawadogo@enea.com',
          phone: '+226 60606060',
          address: 'Ouaga',
          baseSalary: 1200000,
          status: 'Actif',
          contractType: 'CDI',
          joinDate: '2019-06-01',
        },
      ],
      payslips: [],
      accounting: [
        {
          id: '1',
          date: '2023-10-15',
          ref: 'ACH-BF-01',
          label: 'Achat Panneaux Solaires',
          category: '601 - Achats',
          amount: 5000000,
          type: 'Debit',
          status: 'Validé',
        },
      ],
      quotes: [
        {
          id: '1',
          reference: 'DEV-BF-001',
          clientId: '1',
          clientName: 'Endeavour Mining',
          date: '2023-10-25',
          validUntil: '2023-11-25',
          status: 'Brouillon',
          totalAmount: 4300000,
          items: [],
        },
      ],
    },

    // CRM BF
    crm: {
      contacts: [
        {
          id: '1',
          company: 'Endeavour Mining',
          contactName: 'Dr. Kabore',
          email: 'it@mines.bf',
          phone: '+226 71717171',
          address: 'Ouaga',
          type: 'Prospect',
          status: 'Lead',
          lastContact: '2023-10-15',
          industry: 'Mines',
        },
      ],
      deals: [
        {
          id: '1',
          title: 'Liaison FH Mine Nord',
          contactId: '1',
          amount: 35000000,
          stage: 'Qualification',
          probability: 30,
          closingDate: '2023-12-15',
        },
      ],
    },
  },
];
