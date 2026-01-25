# Workflows et Automatisations - ENEA ERP

Ce document décrit les flux de données automatisés implémentés dans le backend (`erp.service.ts`) pour assurer la cohérence entre les modules CRM, Stock et Finance.

## 1. CRM vers Finance (Ventes)

### Déclencheur
*   **Action** : Un utilisateur modifie une opportunité (**Deal**) et change son étape (`stage`) à **"Gagné"**.
*   **Lieu** : Module CRM / Pipeline.

### Automatisation
1.  Le système vérifie si le deal n'était pas déjà gagné.
2.  Un **Devis (Quote)** est automatiquement créé en statut "Brouillon".
3.  **Données reprises** :
    *   Client (lié au Contact CRM).
    *   Ligne d'article : "Opportunité : [Titre du Deal]".
    *   Montant : Montant du deal.
    *   Validité : +30 jours.

---

## 2. Devis vers Facture (Ventes)

### Déclencheur
*   **Action** : Création d'une **Facture (Invoice)** en référençant un devis existant (`quoteId`).
*   **Lieu** : Module Finance (Bouton "Convertir en Facture" sur un devis).

### Automatisation
1.  La facture est créée avec les items du devis.
2.  Le statut du **Devis** d'origine passe automatiquement à **"Facturé"**.

---

## 3. Facture vers Comptabilité (Trésorerie)

### Déclencheur
*   **Action** : Une facture passe au statut **"Paid"** (Payée), soit à la création, soit lors d'une mise à jour.
*   **Lieu** : Module Finance / Factures.

### Automatisation
1.  Le système vérifie si la facture n'était pas déjà payée.
2.  Une **Écriture Comptable (AccountingEntry)** est générée :
    *   **Type** : Crédit (Recette).
    *   **Catégorie** : "701 - Ventes".
    *   **Libellé** : "Encaissement Facture [Réf]".
    *   **Montant** : Total de la facture.
    *   **Date** : Date du jour.

---

## 4. Gestion de Stock (Logistique)

### A. Création de Produit
*   **Action** : Création d'un article avec une **Quantité Initiale > 0**.
*   **Automatisation** :
    1.  L'article est créé avec Quantité = 0.
    2.  Un **Mouvement de Stock** de type "Réception" (Inventaire Initial) est créé.
    3.  Ce mouvement met à jour le stock, garantissant une traçabilité parfaite.

### B. Validation de Mouvement (Entrée/Sortie)
*   **Action** : Validation d'un mouvement de stock (statut "Brouillon" -> "Validé").
*   **Automatisation** :
    1.  **Atomicté** : Tout se passe dans une transaction unique.
    2.  **Sortie** : Vérification du stock disponible (Rejet si stock insuffisant). Décrémentation atomique.
    3.  **Entrée** : Recalcul du **PMP** (Prix Moyen Pondéré) de l'article pour valoriser le stock. Incrémentation atomique.

---

---
79: 
80: ## 5. Journaux d'Audit (Audit Logs)
81: 
82: ### Déclencheur
83: *   **Action** : Création, Modification ou Suppression d'une entité majeure (**StockItem**, **Invoice**).
84: *   **Lieu** : Tous les modules.
85: 
86: ### Automatisation
87: 1.  Le système capture l'**Ancien État** (si modification/suppression) et le **Nouvel État**.
88: 2.  L'utilisateur, l'adresse IP et le UserAgent sont enregistrés.
89: 3.  Une entrée est créée dans la table `AuditLog`, disponible dans l'onglet "Audit & Sécurité" des paramètres.
90: 
91: ---
92: 
93: ## Résumé des Flux
94: 
95: | Module Source | Action Utilisateur | Module Impacté | Résultat Automatique |
96: | :--- | :--- | :--- | :--- |
97: | **CRM** | Deal "Gagné" | **Finance** | Création Devis Brouillon |
98: | **Finance** | Facture créée (depuis Devis) | **Finance** | Devis -> "Facturé" |
99: | **Finance** | Facture "Payée" | **Comptabilité** | Ajout Recette (Crédit) |
100: | **Stock** | Création Produit (+Qté) | **Stock** | Mouvement Inventaire Initial |
101: | **Stock** | Validation Réception | **Stock** | Recalcul PMP (Valeur) |
102: | **Tout** | Action CRUD | **Audit** | Enregistrement Historique |
