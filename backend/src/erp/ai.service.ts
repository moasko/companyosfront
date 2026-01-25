import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI } from "@google/genai";
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';

@Injectable()
export class AIService {
    private readonly logger = new Logger(AIService.name);

    constructor(
        private configService: ConfigService,
        private prisma: PrismaService
    ) { }

    private async getAIClient(companyId: string): Promise<GoogleGenAI> {
        const company = await this.prisma.company.findUnique({
            where: { id: companyId },
            select: { geminiKey: true }
        });

        let effectiveKey = company?.geminiKey || this.configService.get<string>('GEMINI_API_KEY');
        if (effectiveKey) effectiveKey = effectiveKey.trim();

        if (!effectiveKey) {
            throw new Error("L'assistant IA n'est pas configuré. Veuillez renseigner votre clé API Gemini.");
        }

        return new GoogleGenAI({
            apiKey: effectiveKey,
            apiVersion: 'v1beta'
        });
    }

    async analyzeBusinessData(data: any, query: string, companyId: string): Promise<string> {
        try {
            const ai = await this.getAIClient(companyId);

            const prompt = `
            Tu es CompanyOS AI, l'assistant stratégique expert de la plateforme CompanyOS (COS). 
            Ton rôle est d'analyser les données réelles de l'entreprise et de fournir des Insights Proactifs.

            DONNÉES EN TEMPS RÉEL :
            ${JSON.stringify(data, null, 2)}
            
            MISSION :
            1. Analyse la question de l'utilisateur : "${query}"
            2. Si la question est analytique (ex: "comment vont mes ventes ?"), donne une réponse structurée avec :
               - État actuel (basé sur les chiffres du JSON)
               - Tendance détectée (ex: croissance des deals, rupture de stock proche)
               - Action recommandée (ex: "Vous devriez réapprovisionner l'article X car il est sous le seuil")
            3. Si c'est une question de prédiction (ex: "prédis mes revenus"), utilise les tendances (bi.trends) pour extrapoler intelligemment.
            
            CONTRAINTES :
            - Réponds en français de manière extrêmement professionnelle et percutante. 
            - Utilise le gras pour souligner les chiffres clés.
            - Format : Markdown propre (listes à puces, tableaux si nécessaire).
            - Ne JAMAIS inventer de données non présentes dans le JSON.
            - Branding : Réfère-toi au système sous le nom "CompanyOS".
            `;

            const result = await this.callAIWithRetry(ai, "gemini-1.5-flash", {
                contents: [{ role: 'user', parts: [{ text: prompt }] }]
            });

            return result.text || "Je n'ai pas pu générer de réponse.";
        } catch (error: any) {
            this.logger.error(`AI Error: ${error.message}`);
            return `Désolé, CompanyOS AI rencontre une difficulté technique : ${error.message}`;
        }
    }

    private async callAIWithRetry(ai: GoogleGenAI, modelName: string, params: any, retries = 2): Promise<any> {
        let lastError: any;
        let currentModel = modelName;

        for (let i = 0; i <= retries; i++) {
            try {
                return await (ai as any).generateContent({
                    model: currentModel,
                    ...params
                });
            } catch (error: any) {
                lastError = error;
                this.logger.warn(`AI attempt ${i + 1} failed for model ${currentModel}: ${error.message} (Status: ${error.status})`);

                // If overloaded (503) or Rate Limit (429), wait and retry
                if (error.status === 503 || error.status === 429) {
                    if (i < retries) {
                        const waitTime = Math.pow(2, i) * 1000;
                        this.logger.log(`Retrying in ${waitTime}ms...`);
                        await new Promise(resolve => setTimeout(resolve, waitTime));

                        // After first failure, maybe try a more stable model
                        if (currentModel.includes("preview")) {
                            currentModel = "gemini-1.5-flash";
                        }
                        continue;
                    }
                }
                throw error;
            }
        }
        throw lastError;
    }

    async scanInvoice(filePath: string, companyId: string): Promise<any> {
        try {
            const ai = await this.getAIClient(companyId);
            const modelName = "gemini-1.5-flash";

            const fullPath = `./${filePath.startsWith('/') ? filePath.substring(1) : filePath}`;
            const fileData = fs.readFileSync(fullPath);
            const base64Data = fileData.toString('base64');
            const mimeType = filePath.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg';

            const prompt = `
            Tu es un expert en comptabilité. Analyse ce document (facture ou reçu) et extrais les informations suivantes au format JSON :
            - date : la date de la facture (format YYYY-MM-DD)
            - ref : le numéro de facture ou référence
            - label : un libellé court décrivant l'achat (ex: "Achat matériel bureau", "Facture électricité")
            - category : la catégorie comptable suggérée (ex: "ACHATS", "SERVICES", "TAXES", "AUTRE")
            - amount : le montant TOTAL (TTC) numérique
            - currency : la devise (ex: "XOF", "EUR", "USD")
            
            Réponds UNIQUEMENT avec le JSON, sans texte avant ou après.
            `;

            const result = await this.callAIWithRetry(ai, modelName, {
                contents: [{
                    role: 'user',
                    parts: [
                        { text: prompt },
                        {
                            inlineData: {
                                data: base64Data,
                                mimeType: mimeType
                            }
                        }
                    ]
                }]
            });

            const text = result.text || '';
            console.log('AI RAW RESPONSE:', text);
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            return JSON.parse(text);
        } catch (error: any) {
            this.logger.error(`AI Scan Error: ${error.message}`);
            throw error;
        }
    }

    async generateContent(prompt: string, companyId: string): Promise<string> {
        try {
            const ai = await this.getAIClient(companyId);
            const result = await this.callAIWithRetry(ai, "gemini-3-flash-preview", {
                contents: prompt
            });
            return result.text || '';
        } catch (error: any) {
            this.logger.error(`AI General Error: ${error.message}`);
            return `Erreur IA: ${error.message}`;
        }
    }
}
