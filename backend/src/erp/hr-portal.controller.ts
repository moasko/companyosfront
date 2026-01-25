import { Controller, Get, Param, UseGuards, Request, Post, Body } from '@nestjs/common';
import { ErpService } from './erp.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('hr-portal')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('hr')
export class HrPortalController {
    constructor(
        private readonly erpService: ErpService,
        private readonly prisma: PrismaService,
    ) { }

    @Get('profile')
    @ApiOperation({ summary: 'Get current employee profile' })
    async getProfile(@Request() req: any) {
        const userId = req.user.userId;

        // Try to find if this is a direct employee login (userId is employeeId)
        let employee = await this.prisma.employee.findUnique({
            where: { id: userId },
            include: { company: true },
        });

        if (!employee) {
            // If not, try to find the employee profile linked to this User account
            employee = await this.prisma.employee.findFirst({
                where: { userId: userId },
                include: { company: true },
            });
        }

        return employee;
    }

    @Get('employees/:id/payslips')
    @ApiOperation({ summary: 'Get employee payslips' })
    async getPayslips(@Param('id') id: string) {
        return this.prisma.payslip.findMany({
            where: { employeeId: id },
            orderBy: { period: 'desc' },
        });
    }

    @Get('employees/:id/attendances')
    @ApiOperation({ summary: 'Get employee attendances' })
    async getAttendances(@Param('id') id: string) {
        return this.prisma.attendance.findMany({
            where: { employeeId: id },
            orderBy: { date: 'desc' },
        });
    }

    @Get('employees/:id/leave-requests')
    @ApiOperation({ summary: 'Get employee leave requests' })
    async getLeaveRequests(@Param('id') id: string) {
        return this.prisma.leaveRequest.findMany({
            where: { employeeId: id },
            orderBy: { startDate: 'desc' },
        });
    }

    @Post('leave-requests')
    @ApiOperation({ summary: 'Create a new leave request' })
    async createLeaveRequest(@Body() data: any, @Request() req: any) {
        const userId = req.user.userId;

        let employee = await this.prisma.employee.findUnique({
            where: { id: userId },
        });

        if (!employee) {
            employee = await this.prisma.employee.findFirst({
                where: { userId: userId },
            });
        }

        if (!employee) {
            throw new Error('Employé non trouvé');
        }

        return this.prisma.leaveRequest.create({
            data: {
                type: data.type,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                reason: data.reason,
                status: 'Pending',
                employeeId: employee.id,
                companyId: employee.companyId,
            },
        });
    }
}
