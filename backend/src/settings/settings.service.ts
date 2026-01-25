import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string) {
    const dictionaries = await this.prisma.dictionary.findMany({
      where: { companyId },
      orderBy: { value: 'asc' },
    });

    // Group by type for easier frontend consumption,
    // OR return flat list. Let's return flat list and let frontend filter,
    // OR group it. Grouping is nice.
    return dictionaries;
  }

  async findByType(companyId: string, type: string) {
    return this.prisma.dictionary.findMany({
      where: { companyId, type },
      orderBy: { value: 'asc' },
    });
  }

  async create(
    companyId: string,
    data: { type: string; value: string; code?: string; color?: string },
  ) {
    return this.prisma.dictionary.create({
      data: {
        ...data,
        companyId,
      },
    });
  }

  async update(id: string, data: { value?: string; code?: string; color?: string }) {
    return this.prisma.dictionary.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.dictionary.delete({
      where: { id },
    });
  }

  // Printer Settings
  async getPrinterSettings(companyId: string) {
    return this.prisma.printerSettings.findUnique({
      where: { companyId },
    });
  }

  async upsertPrinterSettings(
    companyId: string,
    data: {
      documentPrinter?: string;
      barcodePrinter?: string;
      labelWidth?: number;
      labelHeight?: number;
    },
  ) {
    return this.prisma.printerSettings.upsert({
      where: { companyId },
      create: {
        companyId,
        ...data,
      },
      update: {
        ...data,
      },
    });
  }

  async discoverPrinters() {
    const printers: any[] = [];

    // 1. Local/Network Installed Printers (via PowerShell)
    try {
      const { exec } = await import('child_process');
      const util = await import('util');
      const execAsync = util.promisify(exec);
      // Get Name, PortName, and DriverName
      const { stdout } = await execAsync(
        'powershell -Command "Get-Printer | Select-Object Name, PortName, DriverName, PrinterStatus | ConvertTo-Json"',
      );

      if (stdout && stdout.trim()) {
        const psPrinters = JSON.parse(stdout);
        const list = Array.isArray(psPrinters) ? psPrinters : [psPrinters];
        printers.push(
          ...list.map((p) => ({
            name: p.Name,
            type: 'INSTALLED',
            details: `Port: ${p.PortName}, Driver: ${p.DriverName}`,
            status: p.PrinterStatus,
          })),
        );
      }
    } catch (e) {
      console.error('PowerShell discovery failed:', e);
    }

    // 2. Network Discovery (Bonjour/IPP)
    try {
      // Dynamic import to ensure package availability
      const module = await import('bonjour-service');
      const Bonjour = module.default || module.Bonjour;
      const bonjour = new Bonjour();

      const networkPrinters = await new Promise<any[]>((resolve) => {
        const found: any[] = [];
        const browser = bonjour.find({ type: 'ipp' }, (service) => {
          // Avoid duplicates if possible (simple check by name)
          if (!found.find((f) => f.name === service.name)) {
            found.push({
              name: service.name,
              type: 'NETWORK_IPP',
              details: `Host: ${service.host} (${service.addresses?.join(', ')})`,
              ip: service.addresses?.[0],
            });
          }
        });

        // Scan for 3 seconds
        setTimeout(() => {
          browser.stop();
          resolve(found);
        }, 3000);
      });

      // Merge network printers, avoiding exact name duplicates from installed list
      networkPrinters.forEach((np) => {
        if (!printers.find((p) => p.name === np.name)) {
          printers.push(np);
        }
      });
    } catch (e) {
      console.error('Bonjour discovery failed:', e);
    }

    return printers;
  }
}
