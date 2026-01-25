import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    // D'abord, essayer de trouver un utilisateur standard
    let user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        ownedCompanies: {
          include: { company: true },
        },
        employeeProfiles: {
          include: {
            company: true,
            permissions: true,
            customRole: {
              include: { permissions: { include: { permission: true } } },
            },
          },
        },
      },
    });

    if (user && (await bcrypt.compare(pass, user.passwordHash))) {
      const { passwordHash, ...result } = user;
      return result;
    }

    // Si l'utilisateur standard n'existe pas ou mot de passe incorrect, 
    // essayer de trouver un employé avec ce mail
    const employee = await this.prisma.employee.findFirst({
      where: { email },
      include: {
        company: true,
        user: true,
        permissions: true,
        customRole: {
          include: { permissions: { include: { permission: true } } },
        },
      },
    });

    if (employee && employee.temporaryPassword && 
        (await bcrypt.compare(pass, employee.temporaryPassword))) {
      // Vérifier si le mot de passe temporaire n'est pas expiré
      if (employee.temporaryPasswordExpiresAt && 
          new Date() > employee.temporaryPasswordExpiresAt) {
        return null; // Mot de passe expiré
      }
      
      // Mettre à jour la dernière connexion
      await this.prisma.employee.update({
        where: { id: employee.id },
        data: { lastLogin: new Date() },
      });
      
      // Convertir l'employé en objet utilisateur simplifié
      return {
        id: employee.id,
        email: employee.email,
        name: employee.fullName,
        globalRole: null,
        ownedCompanies: [],
        employeeProfiles: [{
          id: employee.id,
          userId: employee.userId,
          companyId: employee.companyId,
          company: employee.company,
          role: employee.role,
          status: employee.status,
          permissions: employee.permissions,
          customRole: employee.customRole,
        }],
      };
    }
    
    return null;
  }

  async login(user: any) {
    // Extract roles/companies for the payload
    const ownedCompanyIds = user.ownedCompanies.map((oc: any) => oc.companyId);

    const employeeProfiles = user.employeeProfiles.map((ep: any) => {
      // Base permissions according to role
      const basePerms: string[] = [];

      // Note: ADMIN and SUPER_ADMIN roles are handled as 'full access' in guards,
      // but we can also populate their permission list for the UI.
      if (ep.role === 'ADMIN' || ep.role === 'SUPER_ADMIN') {
        basePerms.push('*'); // Global wildcard
      } else if (ep.role === 'MANAGER') {
        basePerms.push(
          'stock:read',
          'stock:write',
          'crm:read',
          'crm:write',
          'finance:read',
          'finance:write',
          'hr:read',
          'hr:write',
          'site:write',
        );
      } else if (ep.role === 'EMPLOYEE') {
        basePerms.push('stock:read', 'stock:write', 'crm:read', 'crm:write', 'finance:read');
      } else if (ep.role === 'VIEWER') {
        basePerms.push('stock:read', 'crm:read', 'finance:read', 'hr:read');
      }

      // Flatten custom permissions (Direct + from Custom Role)
      const directPerms = ep.permissions.map((p: any) => p.code);
      const rolePerms = ep.customRole?.permissions.map((rp: any) => rp.permission.code) || [];

      // Combine everything
      const allPerms = Array.from(new Set([...basePerms, ...directPerms, ...rolePerms]));

      return {
        companyId: ep.companyId,
        role: ep.role,
        status: ep.status,
        permissions: allPerms,
      };
    });

    const payload = {
      email: user.email,
      sub: user.id,
      ownedCompanyIds,
      employeeProfiles,
      globalRole: user.globalRole,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        ownedCompanies: user.ownedCompanies.map((oc: any) => oc.company),
        employeeProfiles: user.employeeProfiles.map((ep: any) => {
          const calculated = employeeProfiles.find((p: any) => p.companyId === ep.companyId);
          return {
            company: ep.company,
            role: ep.role,
            permissions: calculated ? calculated.permissions : [],
          };
        }),
        globalRole: user.globalRole,
      },
    };
  }

  async register(data: { email: string; passwordHash: string; name?: string }) {
    const existingUser = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.passwordHash, 10);
    return this.prisma.user.create({
      data: {
        ...data,
        passwordHash: hashedPassword,
      },
    });
  }
}
