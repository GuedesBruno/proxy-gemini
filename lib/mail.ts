import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key');
const FROM_EMAIL = 'LIBER 2026.AI <no-reply@tecassistiva.com.br>';
const DASHBOARD_LINK = process.env.NEXT_PUBLIC_APP_URL || 'https://liber.tecassistiva.com.br/login';

export const sendWelcomeEmail = async (email: string, name: string, serialNumber: string) => {
    try {
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: email,
            subject: 'Bem-vindo ao LIBER® 2026.AI - Acesso Liberado',
            html: `
                <!DOCTYPE html>
                <html lang="pt-BR">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Acesso Liberado - LIBER® 2026.AI</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: 'Inter', Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #334155;">
                    <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 1px solid #f1f5f9;">
                        
                        <!-- Header -->
                        <div style="background-color: #002554; padding: 40px 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">
                                LIBER<sup style="font-size: 14px;">®</sup> 2026.AI
                            </h1>
                            <p style="color: #93c5fd; margin-top: 8px; font-size: 14px; font-weight: 500; letter-spacing: 0.5px; text-transform: uppercase;">
                                Central de Inteligência
                            </p>
                        </div>
                        
                        <!-- Content -->
                        <div style="padding: 40px 30px;">
                            <h2 style="color: #0f172a; margin-top: 0; margin-bottom: 24px; font-size: 20px; font-weight: 700;">
                                Olá, ${name || 'Usuário'}!
                            </h2>
                            
                            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px; color: #475569;">
                                Bem-vindo ao <strong>LIBER® 2026.AI</strong>! Seu acesso foi liberado com sucesso em nossa plataforma.
                            </p>
                            
                            <div style="background-color: #f1f5f9; border-left: 4px solid #002554; padding: 20px; border-radius: 0 8px 8px 0; margin-bottom: 32px;">
                                <p style="margin: 0 0 12px 0; font-size: 15px; color: #334155;">
                                    Use o seu e-mail e o seu Número de Série (S/N) abaixo como chave de verificação para acessar seu painel:
                                </p>
                                <div style="font-family: monospace; background-color: #ffffff; padding: 12px 16px; border-radius: 6px; border: 1px solid #e2e8f0; color: #0f172a; font-weight: bold; font-size: 16px; text-align: center; letter-spacing: 1px;">
                                    ${serialNumber || 'N/D'}
                                </div>
                            </div>
                            
                            <div style="text-align: center; margin-bottom: 32px;">
                                <a href="${DASHBOARD_LINK}" style="display: inline-block; background-color: #002554; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: bold; font-size: 16px; transition: background-color 0.2s;">
                                    Acessar Meu Painel
                                </a>
                            </div>
                            
                            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
                            
                            <p style="font-size: 14px; color: #64748b; line-height: 1.5; margin: 0;">
                                Se você não solicitou este acesso ou tiver alguma dúvida, por favor, entre em contato com o administrador Tecassistiva.
                            </p>
                        </div>
                        
                        <!-- Footer -->
                        <div style="background-color: #f8fafc; padding: 24px 30px; text-align: center; border-top: 1px solid #f1f5f9;">
                            <p style="margin: 0; font-size: 12px; color: #94a3b8; font-weight: 500;">
                                © 2026 Grupo Liber | Tecassistiva. Todos os direitos reservados.
                            </p>
                        </div>
                    </div>
                </body>
                </html>
            `
        });

        if (error) {
            console.error('Erro na API da Resend:', error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (err) {
        console.error('Falha interna ao tentar enviar email de boas-vindas:', err);
        return { success: false, error: err };
    }
};
