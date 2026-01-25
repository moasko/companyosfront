import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../auth/permissions.decorator';

@Controller('settings')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get(':companyId')
  // @Permissions('settings:read') // Allow all authenticated for read/dropdowns?
  // Usually everyone needs to read dictionary values.
  findAll(@Param('companyId') companyId: string) {
    return this.settingsService.findAll(companyId);
  }

  @Post(':companyId')
  // @Permissions('settings:write')
  create(@Param('companyId') companyId: string, @Body() body: any) {
    return this.settingsService.create(companyId, body);
  }

  @Patch(':id')
  // @Permissions('settings:write')
  update(@Param('id') id: string, @Body() body: any) {
    return this.settingsService.update(id, body);
  }

  @Delete(':id')
  // @Permissions('settings:write')
  remove(@Param('id') id: string) {
    return this.settingsService.remove(id);
  }

  @Get(':companyId/printers')
  getPrinterSettings(@Param('companyId') companyId: string) {
    return this.settingsService.getPrinterSettings(companyId);
  }

  @Get(':companyId/printers/discover')
  discoverPrinters() {
    return this.settingsService.discoverPrinters();
  }

  @Post(':companyId/printers')
  savePrinterSettings(@Param('companyId') companyId: string, @Body() body: any) {
    return this.settingsService.upsertPrinterSettings(companyId, body);
  }
}
