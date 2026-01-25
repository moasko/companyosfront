import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ErpService } from './erp.service';
import { AIService } from './ai.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CompanyGuard } from '../auth/company.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../auth/permissions.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { User } from '../auth/user.decorator';

@ApiTags('erp')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CompanyGuard, PermissionsGuard)
@Controller('erp')
export class ErpController {
  constructor(
    private readonly erpService: ErpService,
    private readonly aiService: AIService,
  ) { }

  @Get(':companyId/audit-logs')
  @Permissions('admin:read') // Define a permission for admin tasks
  @ApiOperation({ summary: 'Get audit logs for a company' })
  getAuditLogs(
    @Param('companyId') companyId: string,
    @Query('entity') entity?: string,
    @Query('action') action?: string,
    @Query('userId') userId?: string,
    @Query('limit') limit?: number,
  ) {
    return this.erpService.getAuditLogs(companyId, { entity, action, userId, limit });
  }

  // --- READ ---
  @Get(':companyId/stock')
  @Permissions('stock:read')
  @ApiOperation({ summary: 'Get stock for a company' })
  getStock(@Param('companyId') companyId: string) {
    return this.erpService.getStock(companyId);
  }

  @Get(':companyId/suppliers')
  @Permissions('stock:read')
  @ApiOperation({ summary: 'Get suppliers' })
  getSuppliers(@Param('companyId') companyId: string) {
    return this.erpService.getSuppliers(companyId);
  }

  @Get(':companyId/movements')
  @Permissions('stock:read')
  @ApiOperation({ summary: 'Get stock movements' })
  getMovements(
    @Param('companyId') companyId: string,
    @Query('year') year?: number,
    @Query('month') month?: number,
  ) {
    return this.erpService.getMovements(companyId, { year, month });
  }

  @Get(':companyId/stock-categories')
  @Permissions('stock:read')
  @ApiOperation({ summary: 'Get stock categories' })
  getStockCategories(@Param('companyId') companyId: string) {
    return this.erpService.getStockCategories(companyId);
  }

  // --- SUPPLIER PORTAL (PUBLIC-ISH) ---
  @Get('supplier/:supplierId')
  @ApiOperation({ summary: 'Get single supplier details' })
  getSupplierById(@Param('supplierId') supplierId: string) {
    return this.erpService.getSupplierById(supplierId);
  }

  @Get('supplier/:supplierId/orders')
  @ApiOperation({ summary: 'Get orders for a supplier' })
  getSupplierOrders(@Param('supplierId') supplierId: string) {
    return this.erpService.getSupplierOrders(supplierId);
  }

  @Get(':companyId/contacts')
  @Permissions('crm:read')
  @ApiOperation({ summary: 'Get CRM contacts' })
  getContacts(@Param('companyId') companyId: string) {
    return this.erpService.getContacts(companyId);
  }

  @Get(':companyId/deals')
  @Permissions('crm:read')
  @ApiOperation({ summary: 'Get CRM deals' })
  getDeals(@Param('companyId') companyId: string) {
    return this.erpService.getDeals(companyId);
  }

  @Get(':companyId/quotes')
  @Permissions('finance:read')
  @ApiOperation({ summary: 'Get finance quotes' })
  getQuotes(
    @Param('companyId') companyId: string,
    @Query('year') year?: number,
    @Query('month') month?: number,
  ) {
    return this.erpService.getQuotes(companyId, { year, month });
  }

  @Get(':companyId/accounting')
  @Permissions('finance:read')
  @ApiOperation({ summary: 'Get accounting entries' })
  getAccounting(
    @Param('companyId') companyId: string,
    @Query('year') year?: number,
    @Query('month') month?: number,
  ) {
    return this.erpService.getAccounting(companyId, { year, month });
  }

  @Get(':companyId/employees')
  @Permissions('hr:read')
  @ApiOperation({ summary: 'Get HR employees' })
  getEmployees(@Param('companyId') companyId: string) {
    return this.erpService.getEmployees(companyId);
  }

  @Get(':companyId/payslips')
  @Permissions('hr:read')
  @ApiOperation({ summary: 'Get payslips' })
  getPayslips(@Param('companyId') companyId: string) {
    return this.erpService.getPayslips(companyId);
  }

  // --- CREATE ---
  @Post(':companyId/stock')
  @Permissions('stock:write')
  @ApiOperation({ summary: 'Create stock item' })
  createStockItem(
    @Param('companyId') companyId: string,
    @Body() data: any,
    @User() user: any,
  ) {
    return this.erpService.createStockItem(companyId, data, user.id);
  }

  @Post(':companyId/stock-categories')
  @Permissions('stock:write')
  @ApiOperation({ summary: 'Create stock category' })
  createStockCategory(@Param('companyId') companyId: string, @Body() data: any) {
    return this.erpService.createStockCategory(companyId, data);
  }

  @Post(':companyId/suppliers')
  @Permissions('stock:write')
  @ApiOperation({ summary: 'Create supplier' })
  createSupplier(@Param('companyId') companyId: string, @Body() data: any) {
    return this.erpService.createSupplier(companyId, data);
  }

  @Post(':companyId/contacts')
  @Permissions('crm:write')
  @ApiOperation({ summary: 'Create contact' })
  createContact(@Param('companyId') companyId: string, @Body() data: any) {
    return this.erpService.createContact(companyId, data);
  }

  @Post(':companyId/deals')
  @Permissions('crm:write')
  @ApiOperation({ summary: 'Create deal' })
  createDeal(@Param('companyId') companyId: string, @Body() data: any) {
    return this.erpService.createDeal(companyId, data);
  }

  @Post(':companyId/movements')
  @Permissions('stock:write')
  @ApiOperation({ summary: 'Create stock movement' })
  createMovement(@Param('companyId') companyId: string, @Body() data: any) {
    return this.erpService.createMovement(companyId, data);
  }

  @Patch('movements/:id/validate')
  @Permissions('stock:write')
  @ApiOperation({ summary: 'Validate stock movement' })
  validateMovement(@Param('id') id: string) {
    return this.erpService.validateMovement(id);
  }
  @Post(':companyId/quotes')
  @Permissions('finance:write')
  @ApiOperation({ summary: 'Create quote' })
  createQuote(@Param('companyId') companyId: string, @Body() data: any) {
    return this.erpService.createQuote(companyId, data);
  }

  @Post(':companyId/accounting')
  @Permissions('finance:write')
  @ApiOperation({ summary: 'Create accounting entry' })
  createTransaction(@Param('companyId') companyId: string, @Body() data: any) {
    return this.erpService.createTransaction(companyId, data);
  }

  @Post(':companyId/employees')
  @Permissions('hr:write')
  @ApiOperation({ summary: 'Create employee' })
  createEmployee(@Param('companyId') companyId: string, @Body() data: any) {
    return this.erpService.createEmployee(companyId, data);
  }

  @Post(':companyId/payslips')
  @Permissions('hr:write')
  @ApiOperation({ summary: 'Create payslip' })
  createPayslip(@Param('companyId') companyId: string, @Body() data: any) {
    return this.erpService.createPayslip(companyId, data);
  }

  // --- UPDATE ---
  @Patch('stock/:id')
  @Permissions('stock:write')
  @ApiOperation({ summary: 'Update stock item' })
  updateStockItem(
    @Param('id') id: string,
    @Body() data: any,
    @User() user: any,
  ) {
    return this.erpService.updateStockItem(id, data, user.id);
  }

  @Patch('contacts/:id')
  @Permissions('crm:write')
  @ApiOperation({ summary: 'Update contact' })
  updateContact(@Param('id') id: string, @Body() data: any) {
    return this.erpService.updateContact(id, data);
  }

  @Patch('suppliers/:id')
  @Permissions('stock:write')
  @ApiOperation({ summary: 'Update supplier' })
  updateSupplier(@Param('id') id: string, @Body() data: any) {
    return this.erpService.updateSupplier(id, data);
  }

  @Patch('deals/:id')
  @Permissions('crm:write')
  @ApiOperation({ summary: 'Update deal' })
  updateDeal(@Param('id') id: string, @Body() data: any) {
    return this.erpService.updateDeal(id, data);
  }

  @Patch('quotes/:id')
  @Permissions('finance:write')
  @ApiOperation({ summary: 'Update quote' })
  updateQuote(@Param('id') id: string, @Body() data: any) {
    return this.erpService.updateQuote(id, data);
  }

  @Patch('accounting/:id')
  @Permissions('finance:write')
  @ApiOperation({ summary: 'Update transaction' })
  updateTransaction(@Param('id') id: string, @Body() data: any) {
    return this.erpService.updateTransaction(id, data);
  }

  @Patch('employees/:id')
  @Permissions('hr:write')
  @ApiOperation({ summary: 'Update employee' })
  updateEmployee(@Param('id') id: string, @Body() data: any) {
    return this.erpService.updateEmployee(id, data);
  }

  // --- DELETE ---
  @Delete('stock/:id')
  @Permissions('stock:write')
  @ApiOperation({ summary: 'Delete stock item' })
  deleteStockItem(@Param('id') id: string, @User() user: any) {
    return this.erpService.deleteStockItem(id, user.id);
  }

  @Delete('suppliers/:id')
  @Permissions('stock:write')
  @ApiOperation({ summary: 'Delete supplier' })
  deleteSupplier(@Param('id') id: string) {
    return this.erpService.deleteSupplier(id);
  }

  @Delete('contacts/:id')
  @Permissions('crm:write')
  @ApiOperation({ summary: 'Delete contact' })
  deleteContact(@Param('id') id: string) {
    return this.erpService.deleteContact(id);
  }

  @Delete('deals/:id')
  @Permissions('crm:write')
  @ApiOperation({ summary: 'Delete deal' })
  deleteDeal(@Param('id') id: string) {
    return this.erpService.deleteDeal(id);
  }

  @Delete('quotes/:id')
  @Permissions('finance:write')
  @ApiOperation({ summary: 'Delete quote' })
  deleteQuote(@Param('id') id: string) {
    return this.erpService.deleteQuote(id);
  }

  @Delete('accounting/:id')
  @Permissions('finance:write')
  @ApiOperation({ summary: 'Delete transaction' })
  deleteTransaction(@Param('id') id: string) {
    return this.erpService.deleteTransaction(id);
  }

  @Delete('employees/:id')
  @Permissions('hr:write')
  @ApiOperation({ summary: 'Delete employee' })
  deleteEmployee(@Param('id') id: string) {
    return this.erpService.deleteEmployee(id);
  }

  // ==========================================
  // NOUVELLES ROUTES (Step 424)
  // ==========================================

  // --- FACTURES ---
  @Get(':companyId/invoices')
  @Permissions('finance:read')
  @ApiOperation({ summary: 'Get invoices' })
  getInvoices(
    @Param('companyId') companyId: string,
    @Query('year') year?: number,
    @Query('month') month?: number,
    @Query('search') search?: string,
  ) {
    return this.erpService.getInvoices(companyId, { year, month, search });
  }

  @Post(':companyId/invoices')
  @Permissions('finance:write')
  @ApiOperation({ summary: 'Create invoice' })
  createInvoice(
    @Param('companyId') companyId: string,
    @Body() data: any,
    @User() user: any,
  ) {
    return this.erpService.createInvoice(companyId, data, user.id);
  }

  @Patch('invoices/:id')
  @Permissions('finance:write')
  @ApiOperation({ summary: 'Update invoice' })
  updateInvoice(
    @Param('id') id: string,
    @Body() data: any,
    @User() user: any,
  ) {
    return this.erpService.updateInvoice(id, data, user.id);
  }

  @Delete('invoices/:id')
  @Permissions('finance:write')
  @ApiOperation({ summary: 'Delete invoice' })
  deleteInvoice(@Param('id') id: string, @User() user: any) {
    return this.erpService.deleteInvoice(id, user.id);
  }

  // --- COMMANDES FOURNISSEURS ---
  @Get(':companyId/purchase-orders')
  @Permissions('stock:read')
  @ApiOperation({ summary: 'Get purchase orders' })
  getPurchaseOrders(
    @Param('companyId') companyId: string,
    @Query('year') year?: number,
    @Query('month') month?: number,
  ) {
    return this.erpService.getPurchaseOrders(companyId, { year, month });
  }

  @Post(':companyId/purchase-orders')
  @Permissions('stock:write')
  @ApiOperation({ summary: 'Create purchase order' })
  createPurchaseOrder(@Param('companyId') companyId: string, @Body() data: any) {
    return this.erpService.createPurchaseOrder(companyId, data);
  }

  @Patch('purchase-orders/:id')
  @Permissions('stock:write')
  @ApiOperation({ summary: 'Update purchase order' })
  updatePurchaseOrder(@Param('id') id: string, @Body() data: any) {
    return this.erpService.updatePurchaseOrder(id, data);
  }

  @Delete('purchase-orders/:id')
  @Permissions('stock:write')
  @ApiOperation({ summary: 'Delete purchase order' })
  deletePurchaseOrder(@Param('id') id: string) {
    return this.erpService.deletePurchaseOrder(id);
  }

  // --- RH (POINTAGE & CONGÉS) ---
  @Get(':companyId/attendances')
  @Permissions('hr:read')
  @ApiOperation({ summary: 'Get attendances' })
  getAttendances(
    @Param('companyId') companyId: string,
    @Query('year') year?: number,
    @Query('month') month?: number,
  ) {
    return this.erpService.getAttendances(companyId, { year, month });
  }

  @Post(':companyId/attendances')
  @Permissions('hr:write') // Should be write for creating attendance
  @ApiOperation({ summary: 'Create attendance' })
  createAttendance(@Param('companyId') companyId: string, @Body() data: any) {
    return this.erpService.createAttendance(companyId, data);
  }

  @Get(':companyId/leave-requests')
  @Permissions('hr:read')
  @ApiOperation({ summary: 'Get leave requests' })
  getLeaveRequests(
    @Param('companyId') companyId: string,
    @Query('year') year?: number,
    @Query('month') month?: number,
  ) {
    return this.erpService.getLeaveRequests(companyId, { year, month });
  }

  @Post(':companyId/leave-requests')
  @Permissions('hr:write') // Employee submitting request
  @ApiOperation({ summary: 'Create leave request' })
  createLeaveRequest(@Param('companyId') companyId: string, @Body() data: any) {
    return this.erpService.createLeaveRequest(companyId, data);
  }

  @Patch('leave-requests/:id')
  @Permissions('hr:write') // Manager approving
  @ApiOperation({ summary: 'Update leave request' })
  updateLeaveRequest(@Param('id') id: string, @Body() data: any) {
    return this.erpService.updateLeaveRequest(id, data);
  }

  // --- TÂCHES ---
  @Get(':companyId/tasks')
  @Permissions('hr:read') // Using HR permissions for now
  @ApiOperation({ summary: 'Get tasks' })
  getTasks(
    @Param('companyId') companyId: string,
    @Query('year') year?: number,
    @Query('month') month?: number,
  ) {
    return this.erpService.getTasks(companyId, { year, month });
  }

  @Post(':companyId/tasks')
  @Permissions('hr:write')
  @ApiOperation({ summary: 'Create task' })
  createTask(@Param('companyId') companyId: string, @Body() data: any) {
    return this.erpService.createTask(companyId, data);
  }

  @Patch('tasks/:id')
  @Permissions('hr:write')
  @ApiOperation({ summary: 'Update task' })
  updateTask(@Param('id') id: string, @Body() data: any) {
    return this.erpService.updateTask(id, data);
  }

  @Delete('tasks/:id')
  @Permissions('hr:write')
  @ApiOperation({ summary: 'Delete task' })
  deleteTask(@Param('id') id: string) {
    return this.erpService.deleteTask(id);
  }

  // --- CONNECTIVITY: WEBHOOKS ---
  @Get(':companyId/webhooks')
  @Permissions('admin:read')
  @ApiOperation({ summary: 'Get webhooks' })
  getWebhooks(@Param('companyId') companyId: string) {
    return this.erpService.getWebhooks(companyId);
  }

  @Post(':companyId/webhooks')
  @Permissions('admin:write')
  @ApiOperation({ summary: 'Create webhook' })
  createWebhook(@Param('companyId') companyId: string, @Body() data: any) {
    return this.erpService.createWebhook(companyId, data);
  }

  @Delete('webhooks/:id')
  @Permissions('admin:write')
  @ApiOperation({ summary: 'Delete webhook' })
  deleteWebhook(@Param('id') id: string) {
    return this.erpService.deleteWebhook(id);
  }

  // --- CONNECTIVITY: API KEYS ---
  @Get(':companyId/api-keys')
  @Permissions('admin:read')
  @ApiOperation({ summary: 'Get API keys' })
  getApiKeys(@Param('companyId') companyId: string) {
    return this.erpService.getApiKeys(companyId);
  }

  @Post(':companyId/api-keys')
  @Permissions('admin:write')
  @ApiOperation({ summary: 'Create API key' })
  createApiKey(@Param('companyId') companyId: string, @Body() data: any) {
    return this.erpService.createApiKey(companyId, data);
  }

  @Delete('api-keys/:id')
  @Permissions('admin:write')
  @ApiOperation({ summary: 'Delete API key' })
  deleteApiKey(@Param('id') id: string) {
    return this.erpService.deleteApiKey(id);
  }

  // --- END OLD MULTI-CURRENCY ---

  // --- GESTION DOCUMENTAIRE (GED) ---
  @Get(':companyId/files')
  @Permissions('admin:read')
  @ApiOperation({ summary: 'Get files' })
  getFiles(@Param('companyId') companyId: string) {
    return this.erpService.getFiles(companyId);
  }

  @Post(':companyId/files')
  @Permissions('admin:write')
  @ApiOperation({ summary: 'Upload file' })
  uploadFile(@Param('companyId') companyId: string, @Body() data: any) {
    return this.erpService.uploadFile(companyId, data);
  }

  @Post('files/:id/versions')
  @Permissions('admin:write')
  @ApiOperation({ summary: 'Create new file version' })
  createNewVersion(@Param('id') id: string, @Body() data: any) {
    return this.erpService.createNewVersion(id, data);
  }

  @Delete('files/:id')
  @Permissions('admin:write')
  @ApiOperation({ summary: 'Delete file' })
  deleteFile(@Param('id') id: string) {
    return this.erpService.deleteFile(id);
  }

  // --- DICTIONARIES ---
  @Get(':companyId/dictionaries')
  @Permissions('admin:read')
  @ApiOperation({ summary: 'Get dictionary items' })
  getDictionaries(
    @Param('companyId') companyId: string,
    @Query('type') type?: string,
  ) {
    return this.erpService.getDictionaries(companyId, type);
  }

  // --- AI ASSISTANT ---
  @Post(':companyId/ai-query')
  @Permissions('admin:read')
  async queryAI(
    @Param('companyId') companyId: string,
    @Body('query') query: string,
  ) {
    // Collect full context (Stock, HR, CRM, Finance)
    const data = await this.erpService.getDashboardSummary(companyId);
    return { response: await this.aiService.analyzeBusinessData(data, query, companyId) };
  }

  @Post(':companyId/ai-generic')
  @Permissions('admin:read')
  @ApiOperation({ summary: 'Generic AI query without ERP context' })
  async genericAI(
    @Param('companyId') companyId: string,
    @Body('prompt') prompt: string,
  ) {
    return { response: await this.aiService.generateContent(prompt, companyId) };
  }

  @Post(':companyId/dictionaries')
  @Permissions('admin:write')
  @ApiOperation({ summary: 'Create dictionary item' })
  createDictionary(@Param('companyId') companyId: string, @Body() data: any) {
    return this.erpService.createDictionary(companyId, data);
  }

  // --- REPORTING BI ---
  @Get(':companyId/bi-dashboard')
  @Permissions('admin:read')
  @ApiOperation({ summary: 'Get BI dashboard' })
  getBiDashboard(@Param('companyId') companyId: string) {
    return this.erpService.getBiDashboard(companyId);
  }

  @Get(':companyId/dashboard-summary')
  @Permissions('admin:read')
  @ApiOperation({ summary: 'Get centralized dashboard overview' })
  getDashboardSummary(@Param('companyId') companyId: string) {
    return this.erpService.getDashboardSummary(companyId);
  }

  // --- SUPPORT ---
  @Get(':companyId/tickets')
  @Permissions('admin:read')
  getTickets(@Param('companyId') companyId: string) {
    return this.erpService.getTickets(companyId);
  }

  @Get('tickets/:id')
  @Permissions('admin:read')
  getTicketById(@Param('id') id: string) {
    return this.erpService.getTicketById(id);
  }

  @Post(':companyId/tickets')
  @Permissions('admin:write')
  createTicket(@Param('companyId') companyId: string, @Body() data: any) {
    return this.erpService.createTicket(companyId, data);
  }

  @Patch('tickets/:id')
  @Permissions('admin:write')
  updateTicket(@Param('id') id: string, @Body() data: any) {
    return this.erpService.updateTicket(id, data);
  }

  @Post('tickets/:id/messages')
  @Permissions('admin:write')
  addTicketMessage(@Param('id') id: string, @Body() data: any) {
    return this.erpService.addTicketMessage(id, data);
  }

  // --- COMPANY SETTINGS ---
  @Get(':companyId/settings')
  @Permissions('admin:read')
  getSettings(@Param('companyId') companyId: string) {
    return this.erpService.getCompanySettings(companyId);
  }

  @Patch(':companyId/settings')
  @Permissions('admin:write')
  updateSettings(@Param('companyId') companyId: string, @Body() data: any) {
    return this.erpService.updateCompanySettings(companyId, data);
  }

  // --- CURRENCIES ---
  @Get(':companyId/currencies')
  @Permissions('admin:read')
  getCurrencies(@Param('companyId') companyId: string) {
    return this.erpService.getCurrencies(companyId);
  }

  @Post(':companyId/currencies')
  @Permissions('admin:write')
  createCurrency(@Param('companyId') companyId: string, @Body() data: any) {
    return this.erpService.createCurrency(companyId, data);
  }

  @Patch('currencies/:id')
  @Permissions('admin:write')
  updateCurrency(@Param('id') id: string, @Body() data: any) {
    return this.erpService.updateCurrency(id, data);
  }

  @Delete('currencies/:id')
  @Permissions('admin:write')
  deleteCurrency(@Param('id') id: string) {
    return this.erpService.deleteCurrency(id);
  }

  @Post(':companyId/scan-invoice')
  @Permissions('finance:write')
  @ApiOperation({ summary: 'Scan an invoice and extract data' })
  async scanInvoice(
    @Param('companyId') companyId: string,
    @Body('filePath') filePath: string,
  ) {
    return this.aiService.scanInvoice(filePath, companyId);
  }
}
