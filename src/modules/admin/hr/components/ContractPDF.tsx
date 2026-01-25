import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { Employee } from '@/types';

const styles = StyleSheet.create({
    page: {
        padding: 60,
        fontFamily: 'Helvetica',
        fontSize: 10,
        lineHeight: 1.6,
        color: '#334155',
    },
    header: {
        marginBottom: 40,
        textAlign: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        paddingBottom: 20,
    },
    companyName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f172a',
        textTransform: 'uppercase',
    },
    documentTitle: {
        marginTop: 10,
        fontSize: 14,
        fontWeight: 'bold',
        color: '#0ea5e9',
        textDecoration: 'underline',
    },
    section: {
        marginTop: 20,
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 8,
        textTransform: 'uppercase',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        paddingBottom: 4,
    },
    paragraph: {
        marginBottom: 10,
        textAlign: 'justify',
    },
    bold: {
        fontWeight: 'bold',
        color: '#1e293b',
    },
    signatureSection: {
        marginTop: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    signatureBox: {
        width: 200,
        textAlign: 'center',
    },
    signatureLine: {
        marginTop: 40,
        borderTopWidth: 1,
        borderTopColor: '#cbd5e1',
        paddingTop: 5,
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 60,
        right: 60,
        textAlign: 'center',
        fontSize: 8,
        color: '#94a3b8',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        paddingTop: 10,
    }
});

interface Props {
    employee: Employee;
}

export const ContractPDF: React.FC<Props> = ({ employee }) => {
    const today = new Date().toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.companyName}>ENEA TELECOM</Text>
                    <Text style={{ fontSize: 9, color: '#64748b' }}>S.A.S au capital de 10.000.000 CFA</Text>
                    <Text style={styles.documentTitle}>CONTRAT DE TRAVAIL À DURÉE INDÉTERMINÉE (CDI)</Text>
                </View>

                <View style={styles.paragraph}>
                    <Text>Entre les soussignés :</Text>
                    <Text style={styles.bold}>La société ENEA TELECOM</Text>
                    <Text>Représentée par son Gérant, Monsieur le Directeur Général, ci-après dénommée "L'Employeur",</Text>
                </View>

                <View style={styles.paragraph}>
                    <Text>Et :</Text>
                    <Text style={styles.bold}>Monsieur/Madame {employee.fullName}</Text>
                    <Text>Demeurant à : [ADRESSE DU COLLABORATEUR]</Text>
                    <Text>Ci-après dénommé(e) "Le Salarié".</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Article 1 - Engagement</Text>
                    <Text style={styles.paragraph}>
                        Le Salarié est engagé par l'Employeur à compter du <Text style={styles.bold}>{new Date(employee.joinDate).toLocaleDateString('fr-FR')}</Text> sous réserve des résultats de la visite médicale d'embauche.
                        Le présent contrat est conclu pour une durée indéterminée.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Article 2 - Fonctions</Text>
                    <Text style={styles.paragraph}>
                        Le Salarié exercera les fonctions de <Text style={styles.bold}>{employee.position}</Text> au sein du département <Text style={styles.bold}>{employee.department}</Text>.
                        Ses attributions pourront évoluer en fonction des nécessités de service.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Article 3 - Rémunération</Text>
                    <Text style={styles.paragraph}>
                        En contrepartie de son travail, le Salarié percevra une rémunération mensuelle brute de <Text style={styles.bold}>{(employee.baseSalary || 0).toLocaleString()} CFA</Text>.
                        À cette rémunération s'ajouteront les éventuelles primes et indemnités prévues par la réglementation en vigueur.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Article 4 - Lieu de travail</Text>
                    <Text style={styles.paragraph}>
                        Le lieu de travail habituel est fixé au siège de la société ou sur tout autre site client en fonction des exigences du projet.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Article 5 - Confidentialité</Text>
                    <Text style={styles.paragraph}>
                        Le Salarié s'engage à conserver une discrétion absolue sur toutes les informations dont il pourrait avoir connaissance dans l'exercice de ses fonctions.
                    </Text>
                </View>

                <View style={styles.signatureSection}>
                    <View style={styles.signatureBox}>
                        <Text style={styles.bold}>L'Employeur</Text>
                        <Text style={{ fontSize: 8 }}>(Précédé de la mention "Lu et approuvé")</Text>
                        <View style={styles.signatureLine} />
                    </View>
                    <View style={styles.signatureBox}>
                        <Text style={styles.bold}>Le Salarié</Text>
                        <Text style={{ fontSize: 8 }}>(Précédé de la mention "Lu et approuvé")</Text>
                        <View style={styles.signatureLine} />
                    </View>
                </View>

                <Text style={styles.footer}>
                    Fait à Abidjan, le {today} en deux exemplaires originaux.
                    ENEA TELECOM - RCCM: CI-ABJ-2013-B-345 - ENEA ERP v2.0
                </Text>
            </Page>
        </Document>
    );
};
