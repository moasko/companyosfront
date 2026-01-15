
import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { CmsService } from './cms.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CompanyGuard } from '../auth/company.guard.js';
import { PermissionsGuard } from '../auth/permissions.guard.js';
import { Permissions } from '../auth/permissions.decorator.js';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('cms')
@Controller('cms')
export class CmsController {
    constructor(private readonly cmsService: CmsService) { }

    @Get(':companyId')
    @ApiOperation({ summary: 'Get full public content for a company' })
    getFullContent(@Param('companyId') companyId: string) {
        return this.cmsService.getFullContent(companyId);
    }

    @Post(':companyId/hero')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, CompanyGuard, PermissionsGuard)
    @Permissions('site:write')
    @ApiOperation({ summary: 'Update hero section' })
    updateHero(@Param('companyId') companyId: string, @Body() data: any) {
        return this.cmsService.updateHero(companyId, data);
    }

    @Post(':companyId/about')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, CompanyGuard, PermissionsGuard)
    @Permissions('site:write')
    @ApiOperation({ summary: 'Update about section' })
    updateAbout(@Param('companyId') companyId: string, @Body() data: any) {
        return this.cmsService.updateAbout(companyId, data);
    }

    @Post(':companyId/contact')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, CompanyGuard, PermissionsGuard)
    @Permissions('site:write')
    @ApiOperation({ summary: 'Update contact section' })
    updateContact(@Param('companyId') companyId: string, @Body() data: any) {
        return this.cmsService.updateContact(companyId, data);
    }

    @Post(':companyId/seo')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, CompanyGuard, PermissionsGuard)
    @Permissions('site:write')
    @ApiOperation({ summary: 'Update seo section' })
    updateSeo(@Param('companyId') companyId: string, @Body() data: any) {
        return this.cmsService.updateSeo(companyId, data);
    }

    @Post(':companyId/careers')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, CompanyGuard, PermissionsGuard)
    @Permissions('site:write')
    @ApiOperation({ summary: 'Update careers section' })
    updateCareers(@Param('companyId') companyId: string, @Body() data: any) {
        return this.cmsService.updateCareers(companyId, data);
    }

    @Post(':companyId/stats')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, CompanyGuard, PermissionsGuard)
    @Permissions('site:write')
    @ApiOperation({ summary: 'Update stats' })
    updateStats(@Param('companyId') companyId: string, @Body() stats: any[]) {
        return this.cmsService.updateStats(companyId, stats);
    }

    @Post(':companyId/locations')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, CompanyGuard, PermissionsGuard)
    @Permissions('site:write')
    @ApiOperation({ summary: 'Update locations' })
    updateLocations(@Param('companyId') companyId: string, @Body() locations: any[]) {
        return this.cmsService.updateLocations(companyId, locations);
    }

    @Post(':companyId/services')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, CompanyGuard, PermissionsGuard)
    @Permissions('site:write')
    @ApiOperation({ summary: 'Update services' })
    updateServices(@Param('companyId') companyId: string, @Body() services: any[]) {
        return this.cmsService.updateServices(companyId, services);
    }

    @Post(':companyId/portfolio')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, CompanyGuard, PermissionsGuard)
    @Permissions('site:write')
    @ApiOperation({ summary: 'Update portfolio' })
    updateRealizations(@Param('companyId') companyId: string, @Body() data: any) {
        return this.cmsService.updateRealizations(companyId, data);
    }

    @Post(':companyId/seed')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, CompanyGuard, PermissionsGuard)
    @Permissions('site:write')
    @ApiOperation({ summary: 'Seed default content' })
    seedContent(@Param('companyId') companyId: string) {
        return this.cmsService.seedContent(companyId);
    }
}
