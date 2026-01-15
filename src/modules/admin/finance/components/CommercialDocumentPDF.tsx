
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { Quote, Invoice, QuoteItem, InvoiceItem } from '@/types';

// Register a professional font if needed, but standard fonts are usually fine for starters
// Font.register({ family: 'Inter', src: '...' });

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Helvetica',
        fontSize: 10,
        color: '#1e293b',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 40,
        borderBottom: 1,
        borderBottomColor: '#e2e8f0',
        paddingBottom: 20,
    },
    logoSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    companyName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    tagline: {
        fontSize: 8,
        color: '#64748b',
        marginTop: 4,
        textTransform: 'uppercase',
    },
    docTitleSection: {
        textAlign: 'right',
    },
    docType: {
        fontSize: 24,
        fontWeight: 'extrabold',
        color: '#0f172a',
    },
    docRef: {
        fontSize: 12,
        marginTop: 4,
        color: '#0ea5e9',
        fontWeight: 'bold',
    },
    infoGrid: {
        flexDirection: 'row',
        marginBottom: 30,
    },
    infoBlock: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 8,
        color: '#94a3b8',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 11,
        color: '#1e293b',
        fontWeight: 'bold',
    },
    table: {
        marginTop: 10,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#0f172a',
        color: '#ffffff',
        padding: 8,
        borderRadius: 2,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        padding: 8,
        alignItems: 'center',
    },
    colDesc: { flex: 4 },
    colQty: { flex: 1, textAlign: 'center' },
    colPrice: { flex: 2, textAlign: 'right' },
    colTotal: { flex: 2, textAlign: 'right' },
    headerText: {
        fontSize: 8,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    totalsSection: {
        flexDirection: 'row',
        marginTop: 30,
        justifyContent: 'flex-end',
    },
    totalsBox: {
        width: 200,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    totalRowFinal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        paddingTop: 8,
        borderTopWidth: 2,
        borderTopColor: '#0f172a',
    },
    finalAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0ea5e9',
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        left: 40,
        right: 40,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        paddingTop: 10,
        textAlign: 'center',
        fontSize: 8,
        color: '#94a3b8',
    }
});

interface Props {
    data: Quote | Invoice;
}

export const CommercialDocumentPDF: React.FC<Props> = ({ data }) => {
    const isInvoice = 'paidAmount' in data;
    const totalHT = data.totalAmount;
    const tva = totalHT * 0.18;
    const totalTTC = totalHT + tva;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.logoSection}>
                        <View>
                            <Text style={styles.companyName}>ENEA TELECOM</Text>
                            <Text style={styles.tagline}>Infrastructures & Réseaux</Text>
                        </View>
                    </View>
                    <View style={styles.docTitleSection}>
                        <Text style={styles.docType}>{isInvoice ? 'FACTURE' : 'DEVIS'}</Text>
                        <Text style={styles.docRef}>{data.reference}</Text>
                        <Text style={{ fontSize: 9, marginTop: 4, color: '#64748b' }}>Date: {new Date(data.date).toLocaleDateString()}</Text>
                    </View>
                </View>

                {/* Client & Issuer Info */}
                <View style={styles.infoGrid}>
                    <View style={styles.infoBlock}>
                        <Text style={styles.infoLabel}>Émetteur</Text>
                        <Text style={styles.infoValue}>ENEA TELECOM SARL</Text>
                        <Text style={{ fontSize: 9, color: '#64748b', marginTop: 2 }}>Cocody Riviera, Abidjan</Text>
                        <Text style={{ fontSize: 9, color: '#64748b' }}>RCCM: CI-ABJ-2013-B-345</Text>
                    </View>
                    <View style={[styles.infoBlock, { backgroundColor: '#f8fafc', padding: 10, borderRadius: 4 }]}>
                        <Text style={styles.infoLabel}>Destinataire</Text>
                        <Text style={[styles.infoValue, { fontSize: 14 }]}>{data.clientName}</Text>
                        <Text style={{ fontSize: 9, color: '#64748b', marginTop: 4 }}>Abidjan, Côte d'Ivoire</Text>
                    </View>
                </View>

                {/* Table */}
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.colDesc, styles.headerText]}>Désignation</Text>
                        <Text style={[styles.colQty, styles.headerText]}>Qté</Text>
                        <Text style={[styles.colPrice, styles.headerText]}>P.U. (CFA)</Text>
                        <Text style={[styles.colTotal, styles.headerText]}>Total HT</Text>
                    </View>

                    {data.items.map((item, i) => (
                        <View key={i} style={styles.tableRow}>
                            <Text style={styles.colDesc}>{item.description}</Text>
                            <Text style={styles.colQty}>{item.quantity}</Text>
                            <Text style={styles.colPrice}>{item.unitPrice.toLocaleString()}</Text>
                            <Text style={[styles.colTotal, { fontWeight: 'bold' }]}>{item.total.toLocaleString()}</Text>
                        </View>
                    ))}
                </View>

                {/* Totals */}
                <View style={styles.totalsSection}>
                    <View style={styles.totalsBox}>
                        <View style={styles.totalRow}>
                            <Text style={{ color: '#64748b' }}>Sous-total HT</Text>
                            <Text style={{ fontWeight: 'bold' }}>{totalHT.toLocaleString()} CFA</Text>
                        </View>
                        <View style={styles.totalRow}>
                            <Text style={{ color: '#64748b' }}>TVA (18%)</Text>
                            <Text style={{ fontWeight: 'bold' }}>{tva.toLocaleString()} CFA</Text>
                        </View>
                        <View style={styles.totalRowFinal}>
                            <Text style={{ fontWeight: 'bold', fontSize: 10 }}>TOTAL NET À PAYER</Text>
                            <Text style={styles.finalAmount}>{totalTTC.toLocaleString()} CFA</Text>
                        </View>
                    </View>
                </View>

                {/* Conditions */}
                <View style={{ marginTop: 40 }}>
                    <Text style={styles.infoLabel}>Informations de paiement</Text>
                    <Text style={{ fontSize: 9, color: '#475569', lineHeight: 1.5 }}>
                        Banque: ECOBANK CI {'\n'}
                        IBAN: CI65 1234 5678 9012 3456 7890 {'\n'}
                        BIC: ECOBCICI {'\n'}
                        Délai de paiement: {isInvoice ? '30 jours' : 'À la livraison'}
                    </Text>
                </View>

                {/* Footer */}
                <Text style={styles.footer}>
                    ENEA TELECOM SARL - Capital: 5.000.000 CFA - Riviera 3, Abidjan - Côte d'Ivoire {'\n'}
                    Tél: +225 27 00 00 00 00 - Email: billing@eneatelecom.ci - www.eneatelecom.ci
                </Text>
            </Page>
        </Document>
    );
};
