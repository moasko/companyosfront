import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ErpService } from './erp.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('kiosk')
@Controller('kiosk')
export class KioskController {
  constructor(private readonly erpService: ErpService) {}

  @Get(':companyId/employees')
  @ApiOperation({ summary: 'Get employees for kiosk' })
  getKioskEmployees(@Param('companyId') companyId: string) {
    return this.erpService.getEmployees(companyId);
  }

  @Get(':companyId/stats')
  @ApiOperation({ summary: 'Get attendance stats for kiosk' })
  async getKioskStats(@Param('companyId') companyId: string) {
    const attendances = await this.erpService.getAttendances(companyId);
    const today = new Date().toISOString().split('T')[0];
    const presentToday = attendances.filter(
      (a: any) => new Date(a.date).toISOString().split('T')[0] === today,
    ).length;

    const employees = await this.erpService.getEmployees(companyId);
    return {
      present: presentToday,
      total: employees.length,
    };
  }

  @Post(':companyId/attendance')
  @ApiOperation({ summary: 'Record attendance via kiosk' })
  recordAttendance(@Param('companyId') companyId: string, @Body() data: any) {
    // Here we could add facial recognition validation logic if we had the actual image
    return this.erpService.createAttendance(companyId, data);
  }
}
