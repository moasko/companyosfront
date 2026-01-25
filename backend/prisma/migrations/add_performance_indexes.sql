-- Performance indexes for critical queries

-- User lookups
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");
CREATE INDEX IF NOT EXISTS "User_createdAt_idx" ON "User"("createdAt");

-- Company-scoped queries (most common pattern)
CREATE INDEX IF NOT EXISTS "StockItem_companyId_idx" ON "StockItem"("companyId");
CREATE INDEX IF NOT EXISTS "StockItem_companyId_ref_idx" ON "StockItem"("companyId", "ref");
CREATE INDEX IF NOT EXISTS "StockItem_quantity_minThreshold_idx" ON "StockItem"("quantity", "minThreshold") WHERE "quantity" < "minThreshold";

-- Invoice searches
CREATE INDEX IF NOT EXISTS "Invoice_companyId_status_idx" ON "Invoice"("companyId", "status");
CREATE INDEX IF NOT EXISTS "Invoice_companyId_date_idx" ON "Invoice"("companyId", "date" DESC);
CREATE INDEX IF NOT EXISTS "Invoice_reference_idx" ON "Invoice"("reference");

-- Deal/CRM queries
CREATE INDEX IF NOT EXISTS "Deal_companyId_stage_idx" ON "Deal"("companyId", "stage");
CREATE INDEX IF NOT EXISTS "Deal_companyId_closingDate_idx" ON "Deal"("companyId", "closingDate" DESC);

-- Task management
CREATE INDEX IF NOT EXISTS "Task_companyId_status_idx" ON "Task"("companyId", "status");
CREATE INDEX IF NOT EXISTS "Task_companyId_dueDate_idx" ON "Task"("companyId", "dueDate");
CREATE INDEX IF NOT EXISTS "Task_assignedToId_status_idx" ON "Task"("assignedToId", "status") WHERE "assignedToId" IS NOT NULL;

-- Webhook filtering
CREATE INDEX IF NOT EXISTS "Webhook_companyId_isActive_idx" ON "Webhook"("companyId", "isActive");

-- Audit log queries
CREATE INDEX IF NOT EXISTS "AuditLog_companyId_createdAt_idx" ON "AuditLog"("companyId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");

-- Stock movements
CREATE INDEX IF NOT EXISTS "StockMovement_companyId_status_idx" ON "StockMovement"("companyId", "status");
CREATE INDEX IF NOT EXISTS "StockMovement_companyId_date_idx" ON "StockMovement"("companyId", "date" DESC);

-- Purchase orders
CREATE INDEX IF NOT EXISTS "PurchaseOrder_companyId_status_idx" ON "PurchaseOrder"("companyId", "status");
CREATE INDEX IF NOT EXISTS "PurchaseOrder_supplierId_status_idx" ON "PurchaseOrder"("supplierId", "status");

-- Employee queries
CREATE INDEX IF NOT EXISTS "Employee_companyId_status_idx" ON "Employee"("companyId", "status");
CREATE INDEX IF NOT EXISTS "Employee_userId_idx" ON "Employee"("userId") WHERE "userId" IS NOT NULL;

-- Accounting entries
CREATE INDEX IF NOT EXISTS "AccountingEntry_companyId_date_idx" ON "AccountingEntry"("companyId", "date" DESC);
CREATE INDEX IF NOT EXISTS "AccountingEntry_companyId_type_idx" ON "AccountingEntry"("companyId", "type");
