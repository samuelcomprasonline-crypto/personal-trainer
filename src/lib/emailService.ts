import AsyncStorage from '@react-native-async-storage/async-storage';

const RESEND_API_KEY_STORAGE = '@personal_trainer:resend_api_key';
const SENDER_EMAIL_STORAGE = '@personal_trainer:sender_email';

export type SendEmailResult = {
  success: boolean;
  message: string;
  id?: string;
  needsConfig?: boolean;
};

/**
 * Obtém a chave de API da Resend (do .env ou do AsyncStorage)
 */
export async function getResendApiKey(): Promise<string | null> {
  const envKey = process.env.EXPO_PUBLIC_RESEND_API_KEY;
  if (envKey && envKey.trim().length > 5) return envKey.trim();

  try {
    const saved = await AsyncStorage.getItem(RESEND_API_KEY_STORAGE);
    return saved && saved.trim().length > 5 ? saved.trim() : null;
  } catch {
    return null;
  }
}

/**
 * Salva a chave de API da Resend no dispositivo do treinador
 */
export async function saveResendApiKey(apiKey: string): Promise<void> {
  await AsyncStorage.setItem(RESEND_API_KEY_STORAGE, apiKey.trim());
}

/**
 * Obtém o e-mail de remetente configurado
 */
export async function getSenderEmail(): Promise<string> {
  const envSender = process.env.EXPO_PUBLIC_SENDER_EMAIL;
  if (envSender && envSender.trim().length > 3) return envSender.trim();

  try {
    const saved = await AsyncStorage.getItem(SENDER_EMAIL_STORAGE);
    if (saved && saved.trim().length > 3) return saved.trim();
  } catch {
    // Fallback
  }
  // Domínio padrão de testes do Resend para envio imediato sem validação de domínio
  return 'Personal Trainer <onboarding@resend.dev>';
}

/**
 * Salva o e-mail de remetente
 */
export async function saveSenderEmail(sender: string): Promise<void> {
  await AsyncStorage.setItem(SENDER_EMAIL_STORAGE, sender.trim());
}

/**
 * Monta o template HTML moderno com a identidade visual do app
 */
export function buildInviteEmailHtml(params: {
  studentName: string;
  studentEmail: string;
  code: string;
  planType: string;
  monthlyPrice: string;
  dueDay: string;
  workoutProgram: string;
}): string {
  const nome = params.studentName || 'Aluno(a)';

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Seu Acesso ao Personal Trainer</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0A0E13; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #FFFFFF;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0A0E13; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="560" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #121820; border-radius: 20px; overflow: hidden; border: 1px solid #1E293B;">
          <!-- HEADER -->
          <tr>
            <td style="padding: 24px; text-align: center; background: linear-gradient(180deg, rgba(16, 185, 129, 0.12) 0%, rgba(17, 23, 34, 0) 100%);">
              <div style="display: inline-block; padding: 6px 14px; background-color: rgba(16, 185, 129, 0.12); border: 1px solid #10B981; border-radius: 999px; margin-bottom: 12px;">
                <span style="color: #10B981; font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">⚡ PERSONAL TRAINER</span>
              </div>
              <h1 style="color: #FFFFFF; font-size: 22px; margin: 0 0 8px 0; font-weight: 700;">Acesso Liberado à Consultoria!</h1>
              <p style="color: #94A3B8; font-size: 14px; margin: 0; line-height: 20px;">Olá <strong>${nome}</strong>, seu cadastro e periodização já estão prontos no aplicativo.</p>
            </td>
          </tr>

          <!-- CÓDIGO DE ATIVAÇÃO EM DESTAQUE -->
          <tr>
            <td style="padding: 0 24px 20px 24px; text-align: center;">
              <div style="background-color: #080C10; border: 2px dashed #10B981; border-radius: 12px; padding: 20px 16px;">
                <p style="color: #94A3B8; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 6px 0;">Seu Código Exclusivo de Ativação</p>
                <div style="font-size: 34px; font-weight: 800; color: #10B981; letter-spacing: 4px; font-family: monospace;">${params.code}</div>
                <p style="color: #64748B; font-size: 11px; margin: 8px 0 0 0;">Insira este código na tela inicial do app para conectar sua conta.</p>
              </div>
            </td>
          </tr>

          <!-- RESUMO DO CONTRATO E TREINO -->
          <tr>
            <td style="padding: 10px 24px 24px 24px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #151D2A; border-radius: 10px; padding: 14px;">
                <tr>
                  <td style="padding: 6px 0; color: #94A3B8; font-size: 13px;">🏋️ Treino Atribuído:</td>
                  <td style="padding: 6px 0; color: #FFFFFF; font-weight: 600; font-size: 13px; text-align: right;">${params.workoutProgram}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94A3B8; font-size: 13px;">💳 Plano & Mensalidade:</td>
                  <td style="padding: 6px 0; color: #FFFFFF; font-weight: 600; font-size: 13px; text-align: right;">${params.planType} · R$ ${params.monthlyPrice},00/mês</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94A3B8; font-size: 13px;">🗓 Dia de Vencimento:</td>
                  <td style="padding: 6px 0; color: #FFFFFF; font-weight: 600; font-size: 13px; text-align: right;">Todo dia ${params.dueDay}</td>
                </tr>
              </table>

              <!-- DICAS DE ACESSO -->
              <div style="margin-top: 20px; padding: 12px; background-color: rgba(255, 255, 255, 0.03); border-radius: 8px; border-left: 3px solid #10B981;">
                <p style="color: #FFFFFF; font-size: 13px; font-weight: 600; margin: 0 0 4px 0;">Como acessar seu treino:</p>
                <p style="color: #94A3B8; font-size: 12px; margin: 0; line-height: 18px;">
                  1. Abra o app <strong>Personal Trainer</strong>.<br>
                  2. Clique em <strong>Sou Aluno</strong> e selecione <strong>Ativar com Código</strong>.<br>
                  3. Digite o código <strong>${params.code}</strong> para carregar sua ficha de treino e dieta.
                </p>
              </div>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding: 20px 30px; text-align: center; border-top: 1px solid #1E293B; background-color: #0A0E13;">
              <p style="color: #64748B; font-size: 11px; margin: 0;">Mensagem automática gerada pela plataforma Personal Trainer.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Dispara o e-mail de convite de forma 100% automática via API Resend
 */
export async function sendAutomaticInviteEmail(params: {
  studentName: string;
  studentEmail: string;
  code: string;
  planType: string;
  monthlyPrice: string;
  dueDay: string;
  workoutProgram: string;
}): Promise<SendEmailResult> {
  const apiKey = await getResendApiKey();

  if (!apiKey) {
    return {
      success: false,
      needsConfig: true,
      message: 'Chave de envio automático (Resend) não configurada.',
    };
  }

  const sender = await getSenderEmail();
  const html = buildInviteEmailHtml(params);

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: sender,
        to: [params.studentEmail.trim()],
        subject: `🏋️ Bem-vindo(a) ao Personal Trainer — Seu Código de Acesso: ${params.code}`,
        html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data?.message || data?.error || 'Erro ao enviar pela API de e-mail';
      return {
        success: false,
        message: `Falha na API: ${errorMsg}`,
      };
    }

    return {
      success: true,
      id: data?.id,
      message: `E-mail enviado automaticamente para ${params.studentEmail}!`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Erro de rede ao enviar e-mail: ${err?.message || err}`,
    };
  }
}
