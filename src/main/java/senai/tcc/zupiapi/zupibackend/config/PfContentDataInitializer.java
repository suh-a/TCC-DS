package senai.tcc.zupiapi.zupibackend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import senai.tcc.zupiapi.zupibackend.model.SkillArea;
import senai.tcc.zupiapi.zupibackend.model.WeeklyQuiz;
import senai.tcc.zupiapi.zupibackend.model.WeeklyQuizQuestion;
import senai.tcc.zupiapi.zupibackend.model.enums.PlanType;
import senai.tcc.zupiapi.zupibackend.repositories.SkillAreaRepository;
import senai.tcc.zupiapi.zupibackend.repositories.WeeklyQuizRepository;
import java.util.List;

@Component
public class PfContentDataInitializer implements CommandLineRunner {
    private static final List<String> PF_SKILL_AREAS = List.of(
            "Motricidade", "Comunicação", "Cognição", "Socialização", "Autocuidado", "Regulação Emocional");

    private final SkillAreaRepository skillAreaRepository;
    private final WeeklyQuizRepository weeklyQuizRepository;

    public PfContentDataInitializer(SkillAreaRepository skillAreaRepository,
                                    WeeklyQuizRepository weeklyQuizRepository) {
        this.skillAreaRepository = skillAreaRepository;
        this.weeklyQuizRepository = weeklyQuizRepository;
    }

    @Override
    public void run(String... args) {
        seedSkillAreas();
        seedWeeklyQuizzes();
    }

    private void seedSkillAreas() {
        PF_SKILL_AREAS.forEach(name -> {
            SkillArea area = skillAreaRepository.findByName(name);
            if (area == null) {
                area = new SkillArea();
                area.setName(name);
                area.setPlanType(PlanType.PESSOA_FISICA);
                skillAreaRepository.save(area);
            }
        });
    }

    private void seedWeeklyQuizzes() {
        if (!weeklyQuizRepository.existsBySlug("como-eu-me-sinto-hoje")) {
            WeeklyQuiz quiz = quiz("como-eu-me-sinto-hoje", "Como eu me sinto hoje?",
                    "Identificar emoções e descobrir formas gentis de cuidar delas.",
                    "Todo sentimento pode aparecer. Você fez um ótimo trabalho percebendo como está hoje!");
            quiz.addQuestion(question(1, "Como você está se sentindo agora?", "😊 Feliz", "😌 Tranquilo", "😟 Preocupado", "😠 Bravo"));
            quiz.addQuestion(question(2, "Quando algo não sai como eu quero, eu geralmente...", "😤 Fico bravo", "😢 Fico triste", "🙋 Peço ajuda", "🌬️ Respiro e tento de novo"));
            quiz.addQuestion(question(3, "Quando um lugar está muito barulhento, eu prefiro...", "🎧 Usar proteção", "🚪 Ir para um lugar calmo", "🤝 Ficar perto de alguém", "🙂 Continuar brincando"));
            quiz.addQuestion(question(4, "O que ajuda quando sinto uma emoção muito forte?", "🌬️ Respirar devagar", "🧸 Abraçar algo macio", "🗣️ Contar para alguém", "🎨 Desenhar"));
            quiz.addQuestion(question(5, "Como posso mostrar que preciso de uma pausa?", "✋ Fazer um sinal", "💬 Falar ou apontar", "🪪 Mostrar um cartão", "🤝 Pedir ajuda"));
            weeklyQuizRepository.save(quiz);
        }

        if (!weeklyQuizRepository.existsBySlug("meus-superpoderes")) {
            WeeklyQuiz quiz = quiz("meus-superpoderes", "Meus superpoderes!",
                    "Reconhecer habilidades, interesses e fortalecer a autoestima.",
                    "Seus jeitos de pensar, criar e cuidar são superpoderes. Continue usando cada um deles!");
            quiz.addQuestion(question(1, "O que você faz muito bem?", "🔎 Lembro detalhes", "🎨 Sou criativo", "🤝 Ajudo amigos", "⚡ Aprendo rápido"));
            quiz.addQuestion(question(2, "Quando encontro um desafio, meu superpoder é...", "🧩 Tentar outro jeito", "🙋 Pedir ajuda", "⏳ Ter paciência", "🔁 Tentar novamente"));
            quiz.addQuestion(question(3, "Qual atividade combina mais com você?", "📚 Descobrir histórias", "🔢 Resolver padrões", "🎵 Criar sons", "🖍️ Inventar desenhos"));
            quiz.addQuestion(question(4, "Como você ajuda outras pessoas?", "👂 Escuto com atenção", "😊 Faço companhia", "💡 Dou ideias", "🧹 Ajudo nas tarefas"));
            quiz.addQuestion(question(5, "O que deixa você orgulhoso?", "🌱 Aprender algo novo", "💪 Não desistir", "💛 Ser gentil", "✨ Ser eu mesmo"));
            weeklyQuizRepository.save(quiz);
        }
    }

    private WeeklyQuiz quiz(String slug, String title, String objective, String feedback) {
        WeeklyQuiz quiz = new WeeklyQuiz();
        quiz.setSlug(slug);
        quiz.setTitle(title);
        quiz.setObjective(objective);
        quiz.setFeedback(feedback);
        quiz.setPlanType(PlanType.PESSOA_FISICA);
        return quiz;
    }

    private WeeklyQuizQuestion question(int position, String prompt, String... options) {
        return new WeeklyQuizQuestion(position, prompt, List.of(options));
    }
}
