
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { CompaniesModule } from './companies/companies.module.js';
import { CmsModule } from './cms/cms.module.js';
import { ErpModule } from './erp/erp.module.js';
import { UploadModule } from './upload/upload.module.js';
import { SettingsModule } from './settings/settings.module.js';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
    imports: [
        ServeStaticModule.forRoot({
            rootPath: join(process.cwd(), 'uploads'),
            serveRoot: '/uploads',
        }),
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        PrismaModule,
        AuthModule,
        CompaniesModule,
        CmsModule,
        ErpModule,
        UploadModule,
        SettingsModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule { }
