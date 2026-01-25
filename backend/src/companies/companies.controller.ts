import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('companies')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get('public')
  @ApiOperation({ summary: 'Get all companies (public info)' })
  findAllPublic() {
    return this.companiesService.findAllPublic();
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new company' })
  create(@Body() data: any, @Request() req: any) {
    return this.companiesService.create(data, req.user.userId);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all companies the user has access to' })
  findAll(@Request() req: any) {
    return this.companiesService.findAll(req.user);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a specific company by ID' })
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.companiesService.findOne(id, req.user);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a company' })
  update(@Param('id') id: string, @Body() data: any, @Request() req: any) {
    return this.companiesService.update(id, data, req.user);
  }
}
