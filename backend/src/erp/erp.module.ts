
import { Module } from '@nestjs/common';
import { ErpService } from './erp.service.js';
import { ErpController } from './erp.controller.js';
import { KioskController } from './kiosk.controller.js';

@Module({
    controllers: [ErpController, KioskController],
    providers: [ErpService],
    exports: [ErpService],
})
export class ErpModule { }
