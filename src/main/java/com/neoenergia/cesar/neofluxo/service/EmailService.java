package com.neoenergia.cesar.neofluxo.service;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.util.HtmlUtils;

/**
 * Envio de e-mail (SMTP configurado por variável de ambiente, ver .env.example).
 *
 * Roda em outra thread (@Async): o POST /auth/forgot-password responde na hora,
 * mesmo com o SMTP lento ou fora do ar. Falha de envio vira log, nunca erro na tela.
 * Sem MAIL_USERNAME o e-mail não sai e o link vai pro log em WARN, pra quem não tem
 * credencial conseguir testar a US-02 mesmo assim.
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final ObjectProvider<JavaMailSender> mailSender;
    private final String username;
    private final String from;

    public EmailService(ObjectProvider<JavaMailSender> mailSender,
                        @Value("${spring.mail.username:}") String username,
                        @Value("${app.mail.from:}") String from) {
        this.mailSender = mailSender;
        this.username = username == null ? "" : username.trim();
        this.from = from == null || from.isBlank() ? this.username : from.trim();
    }

    public boolean smtpConfigurado() {
        return !username.isEmpty() && mailSender.getIfAvailable() != null;
    }

    @Async
    public void enviarRedefinicaoSenha(String para, String nome, String link, int validadeMinutos) {
        if (!smtpConfigurado()) {
            log.warn("SMTP não configurado (MAIL_USERNAME vazio): e-mail de redefinição NÃO enviado. "
                    + "Link para {}: {}", mascarar(para), link);
            return;
        }
        try {
            JavaMailSender sender = mailSender.getObject();
            MimeMessage msg = sender.createMimeMessage();
            MimeMessageHelper h = new MimeMessageHelper(msg, true, "UTF-8");
            h.setFrom(from, "NeoFluxo");
            h.setTo(para);
            h.setSubject("Redefinição de senha — NeoFluxo");
            h.setText(textoPuro(nome, link, validadeMinutos), html(nome, link, validadeMinutos));
            sender.send(msg);
            log.info("E-mail de redefinição de senha enviado para {}", mascarar(para));
        } catch (Exception e) {
            log.error("Falha ao enviar e-mail de redefinição para {}: {}", mascarar(para), e.getMessage());
        }
    }

    static String textoPuro(String nome, String link, int validadeMinutos) {
        return saudacao(nome) + "\n\n"
                + "Recebemos um pedido para redefinir a senha da sua conta no NeoFluxo.\n"
                + "Para cadastrar uma nova senha, abra o link abaixo:\n\n"
                + link + "\n\n"
                + "O link expira em " + validadeMinutos + " minutos e só pode ser usado uma vez.\n"
                + "Se você não pediu a redefinição, ignore este e-mail: sua senha continua a mesma.\n\n"
                + "NeoFluxo — Portal de Projetos Elétricos";
    }

    static String html(String nome, String link, int validadeMinutos) {
        String n = HtmlUtils.htmlEscape(saudacao(nome));
        String l = HtmlUtils.htmlEscape(link);
        return """
                <!doctype html>
                <html lang="pt-BR">
                <body style="margin:0;padding:0;background:#f3f5f9;font-family:Arial,Helvetica,sans-serif;color:#1a2233;">
                  <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="background:#f3f5f9;padding:32px 16px;">
                    <tr><td align="center">
                      <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:12px;overflow:hidden;">
                        <tr><td style="background:#0033A0;padding:20px 32px;color:#ffffff;font-size:18px;font-weight:bold;">NeoFluxo</td></tr>
                        <tr><td style="padding:32px;">
                          <p style="margin:0 0 16px;font-size:20px;font-weight:bold;color:#1a2233;">Redefinição de senha</p>
                          <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">%s</p>
                          <p style="margin:0 0 24px;font-size:15px;line-height:1.6;">Recebemos um pedido para redefinir a senha da sua conta no NeoFluxo. Clique no botão abaixo para cadastrar uma nova senha.</p>
                          <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="border-radius:8px;background:#0033A0;">
                            <a href="%s" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:8px;">Redefinir senha</a>
                          </td></tr></table>
                          <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#4a5568;">O link expira em <strong>%d minutos</strong> e só pode ser usado uma vez.</p>
                          <p style="margin:8px 0 0;font-size:13px;line-height:1.6;color:#4a5568;">Se o botão não funcionar, copie e cole este endereço no navegador:<br><a href="%s" style="color:#0033A0;word-break:break-all;">%s</a></p>
                          <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#4a5568;">Se você não pediu a redefinição, ignore este e-mail: sua senha continua a mesma.</p>
                        </td></tr>
                        <tr><td style="padding:16px 32px;border-top:1px solid #e5e8ef;font-size:12px;color:#718096;">NeoFluxo — Portal de Projetos Elétricos</td></tr>
                      </table>
                    </td></tr>
                  </table>
                </body>
                </html>
                """.formatted(n, l, validadeMinutos, l, l);
    }

    private static String saudacao(String nome) {
        if (nome == null || nome.isBlank()) return "Olá.";
        return "Olá, " + nome.trim().split("\\s+")[0] + ".";
    }

    static String mascarar(String email) {
        if (email == null || !email.contains("@")) return "***";
        int at = email.indexOf('@');
        return email.substring(0, Math.min(3, at)) + "***" + email.substring(at);
    }
}
