import { Module } from '@nestjs/common';
import { ErpService } from './erp.service';
import { ErpController } from './erp.controller';
import { KioskController } from './kiosk.controller';
import { HrPortalController } from './hr-portal.controller';
import { AIService } from './ai.service';
import { ConfigModule } from '@nestjs/config';

import { WorkflowService } from './workflow.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [ErpController, KioskController, HrPortalController],
  providers: [ErpService, AIService, WorkflowService],
  exports: [ErpService, AIService, WorkflowService],
})
export class ErpModule { }
