import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import { Payslip, Employee } from '@/types';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#334155',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    borderBottom: 2,
    borderBottomColor: '#0f172a',
    paddingBottom: 20,
  },
  companyInfo: {
    flexDirection: 'column',
  },
  companyName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  companyTagline: {
    fontSize: 8,
    color: '#0ea5e9',
    marginTop: 2,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
    color: '#0f172a',
  },
  documentSub: {
    fontSize: 10,
    textAlign: 'right',
    color: '#64748b',
    marginTop: 5,
  },
  section: {
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    gap: 40,
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
  },
  gridCol: {
    flex: 1,
  },
  label: {
    fontSize: 8,
    color: '#94a3b8',
    textTransform: 'uppercase',
    marginBottom: 4,
    fontWeight: 'bold',
  },
  value: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    padding: 8,
    fontWeight: 'bold',
    fontSize: 9,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    padding: 8,
    alignItems: 'center',
  },
  colDesc: { flex: 3 },
  colBase: { flex: 1, textAlign: 'right' },
  colRate: { flex: 1, textAlign: 'right' },
  colGain: { flex: 1, textAlign: 'right' },
  colRet: { flex: 1, textAlign: 'right' },

  totalSection: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  totalBox: {
    width: 250,
    backgroundColor: '#f1f5f9',
    padding: 15,
    borderRadius: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#475569',
  },
  totalValue: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  netSalaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#0f172a',
  },
  netSalaryLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  netSalaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0284c7',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signature: {
    width: 150,
    textAlign: 'center',
  },
  signatureBox: {
    marginTop: 10,
    height: 60,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    borderRadius: 4,
  },
});

interface Props {
  payslip: Payslip;
  employee: Employee;
}

export const PayslipPDF: React.FC<Props> = ({ payslip, employee }) => {
  const periodStr = new Date(payslip.period + '-01').toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>ENEA TELECOM</Text>
            <Text style={styles.companyTagline}>Infrastructures & Réseaux</Text>
            <Text style={{ fontSize: 8, color: '#64748b', marginTop: 10 }}>
              Cocody Riviera 3, Abidjan
            </Text>
            <Text style={{ fontSize: 8, color: '#64748b' }}>RCCM: CI-ABJ-2013-B-345</Text>
          </View>
          <View>
            <Text style={styles.documentTitle}>BULLETIN DE PAIE</Text>
            <Text style={styles.documentSub}>Période: {periodStr.toUpperCase()}</Text>
            <Text style={[styles.documentSub, { fontSize: 8 }]}>
              Émis le: {new Date(payslip.date).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Staff Info */}
        <View style={styles.grid}>
          <View style={styles.gridCol}>
            <Text style={styles.label}>Salarié</Text>
            <Text style={styles.value}>{employee.fullName}</Text>
            <Text style={{ fontSize: 8, marginTop: 4 }}>Matricule: {employee.matricule}</Text>
            <Text style={{ fontSize: 8 }}>Emploi: {employee.position}</Text>
            <Text style={{ fontSize: 8 }}>Département: {employee.department}</Text>
          </View>
          <View style={styles.gridCol}>
            <Text style={styles.label}>Contrat</Text>
            <Text style={styles.value}>{employee.contractType}</Text>
            <Text style={{ fontSize: 8, marginTop: 4 }}>
              Date d'entrée: {new Date(employee.joinDate).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colDesc}>DÉSIGNATION</Text>
            <Text style={styles.colBase}>BASE</Text>
            <Text style={styles.colGain}>GAINS (+)</Text>
            <Text style={styles.colRet}>RETENUES (-)</Text>
          </View>

          {/* Salary Lines */}
          <View style={styles.tableRow}>
            <Text style={styles.colDesc}>Salaire de base</Text>
            <Text style={styles.colBase}>{payslip.baseSalary.toLocaleString()}</Text>
            <Text style={styles.colGain}>{payslip.baseSalary.toLocaleString()}</Text>
            <Text style={styles.colRet}></Text>
          </View>

          {payslip.transportPrime > 0 && (
            <View style={styles.tableRow}>
              <Text style={styles.colDesc}>Indemnité de transport</Text>
              <Text style={styles.colBase}></Text>
              <Text style={styles.colGain}>{payslip.transportPrime.toLocaleString()}</Text>
              <Text style={styles.colRet}></Text>
            </View>
          )}

          {payslip.housingPrime > 0 && (
            <View style={styles.tableRow}>
              <Text style={styles.colDesc}>Indemnité de logement</Text>
              <Text style={styles.colBase}></Text>
              <Text style={styles.colGain}>{payslip.housingPrime.toLocaleString()}</Text>
              <Text style={styles.colRet}></Text>
            </View>
          )}

          {payslip.otherBonuses > 0 && (
            <View style={styles.tableRow}>
              <Text style={styles.colDesc}>Autres primes / Bonus</Text>
              <Text style={styles.colBase}></Text>
              <Text style={styles.colGain}>{payslip.otherBonuses.toLocaleString()}</Text>
              <Text style={styles.colRet}></Text>
            </View>
          )}

          {/* Deductions */}
          {payslip.cnpsDeduction > 0 && (
            <View style={styles.tableRow}>
              <Text style={styles.colDesc}>Part ouvrière CNPS (Retraite)</Text>
              <Text style={styles.colBase}></Text>
              <Text style={styles.colGain}></Text>
              <Text style={styles.colRet}>{payslip.cnpsDeduction.toLocaleString()}</Text>
            </View>
          )}

          {payslip.taxDeduction > 0 && (
            <View style={styles.tableRow}>
              <Text style={styles.colDesc}>Impôt sur le Revenu (IOTS)</Text>
              <Text style={styles.colBase}></Text>
              <Text style={styles.colGain}></Text>
              <Text style={styles.colRet}>{payslip.taxDeduction.toLocaleString()}</Text>
            </View>
          )}

          {payslip.otherDeductions > 0 && (
            <View style={styles.tableRow}>
              <Text style={styles.colDesc}>Autres retenues</Text>
              <Text style={styles.colBase}></Text>
              <Text style={styles.colGain}></Text>
              <Text style={styles.colRet}>{payslip.otherDeductions.toLocaleString()}</Text>
            </View>
          )}
        </View>

        {/* Part Patronale */}
        <View style={[styles.table, { marginTop: 20 }]}>
          <View style={[styles.tableHeader, { backgroundColor: '#475569' }]}>
            <Text style={styles.colDesc}>CHARGES PATRONALES (EMPLOYEUR)</Text>
            <Text style={styles.colBase}>BASE</Text>
            <Text style={styles.colGain}>TAUX</Text>
            <Text style={styles.colRet}>MONTANT</Text>
          </View>
          {payslip.cnpsEmployer > 0 && (
            <View style={styles.tableRow}>
              <Text style={styles.colDesc}>CNPS Part Patronale</Text>
              <Text style={styles.colBase}>{payslip.grossSalary.toLocaleString()}</Text>
              <Text style={styles.colGain}>7.7%</Text>
              <Text style={styles.colRet}>{payslip.cnpsEmployer.toLocaleString()}</Text>
            </View>
          )}
          {payslip.taxEmployer > 0 && (
            <View style={styles.tableRow}>
              <Text style={styles.colDesc}>Taxe Apprentissage / FDFP</Text>
              <Text style={styles.colBase}>{payslip.grossSalary.toLocaleString()}</Text>
              <Text style={styles.colGain}>1.5%</Text>
              <Text style={styles.colRet}>{payslip.taxEmployer.toLocaleString()}</Text>
            </View>
          )}
          <View style={[styles.tableRow, { backgroundColor: '#f8fafc' }]}>
            <Text style={[styles.colDesc, { fontWeight: 'bold' }]}>TOTAL CHARGES PATRONALES</Text>
            <Text style={styles.colBase}></Text>
            <Text style={styles.colGain}></Text>
            <Text style={[styles.colRet, { fontWeight: 'bold' }]}>
              {payslip.totalEmployer.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Totals */}
        <View style={styles.totalSection}>
          <View style={styles.totalBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL BRUT</Text>
              <Text style={styles.totalValue}>{payslip.grossSalary.toLocaleString()} CFA</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL RETENUES</Text>
              <Text style={styles.totalValue}>
                {(payslip.grossSalary - payslip.netSalary).toLocaleString()} CFA
              </Text>
            </View>
            <View style={styles.netSalaryRow}>
              <Text style={styles.netSalaryLabel}>NET À PAYER</Text>
              <Text style={styles.netSalaryValue}>{payslip.netSalary.toLocaleString()} CFA</Text>
            </View>
          </View>
        </View>

        {/* Signatures */}
        <View style={styles.footer}>
          <View style={styles.signature}>
            <Text style={styles.label}>Signature de l'Employé</Text>
            <View style={styles.signatureBox} />
          </View>
          <View style={styles.signature}>
            <Text style={[styles.label, { textAlign: 'right' }]}>Cachet de l'Employeur</Text>
            <View style={styles.signatureBox} />
            <Text style={{ fontSize: 7, marginTop: 5, textAlign: 'right', color: '#94a3b8' }}>
              Généré par ENEA ERP v2.0
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};
