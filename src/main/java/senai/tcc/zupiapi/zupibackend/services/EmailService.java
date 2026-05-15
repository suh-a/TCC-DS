package senai.tcc.zupiapi.zupibackend.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import senai.tcc.zupiapi.zupibackend.dto.request.ContactRequest;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private static final String TEAM_EMAIL = "equipezupi@gmail.com";

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    public void sendContactMessage(ContactRequest contact) {
        String body = """
                Nova mensagem de contato — Zupi

                Nome: %s
                E-mail: %s
                Assunto: %s

                Mensagem:
                %s
                """.formatted(contact.name(), contact.email(), contact.subject(), contact.message());

        if (mailSender == null || fromEmail == null || fromEmail.isBlank()) {
            log.info("E-mail simulado para {}:\n{}", TEAM_EMAIL, body);
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(TEAM_EMAIL);
        message.setReplyTo(contact.email());
        message.setSubject("[Zupi Contato] " + contact.subject());
        message.setText(body);
        mailSender.send(message);
    }

    public void sendPasswordResetEmail(String toEmail, String resetLink) {
        String body = "Olá!\n\nRecebemos uma solicitação para redefinir sua senha no Zupi.\n\n"
                + "Acesse o link abaixo (válido por 1 hora):\n" + resetLink
                + "\n\nSe você não solicitou, ignore este e-mail.";

        if (mailSender == null || fromEmail == null || fromEmail.isBlank()) {
            log.info("Reset de senha para {}: {}", toEmail, resetLink);
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Redefinição de senha — Zupi");
        message.setText(body);
        mailSender.send(message);
    }
}
