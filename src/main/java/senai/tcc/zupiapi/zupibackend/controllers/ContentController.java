package senai.tcc.zupiapi.zupibackend.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import senai.tcc.zupiapi.zupibackend.dto.response.SchoolActivityResponse;
import senai.tcc.zupiapi.zupibackend.dto.response.SchoolQuizResponse;
import senai.tcc.zupiapi.zupibackend.dto.response.WeeklyQuizResponse;
import senai.tcc.zupiapi.zupibackend.services.SchoolLearningService;
import senai.tcc.zupiapi.zupibackend.services.WeeklyQuizService;

@RestController
@CrossOrigin("*")
@RequestMapping("/content")
public class ContentController {

    @Autowired
    private WeeklyQuizService weeklyQuizService;

    @Autowired
    private SchoolLearningService schoolLearningService;

    @GetMapping("/dicas-inclusao")
    public ResponseEntity<List<Map<String, String>>> dicas() {
        return ResponseEntity.ok(List.of(
                Map.of("title", "O que é neurodivergência?",
                        "body", "Neurodivergência refere-se a variações naturais no funcionamento neurológico, como autismo, TDAH e dislexia. Cada criança tem ritmo e formas únicas de aprender."),
                Map.of("title", "Rotina previsível",
                        "body", "Manter horários consistentes reduz ansiedade. Use quadros visuais com pictogramas para as atividades do dia."),
                Map.of("title", "Estímulos sensoriais",
                        "body", "Observe o que incomoda ou acalma: luz, som, textura. Crie um cantinho de regulação em casa."),
                Map.of("title", "Comunicação respeitosa",
                        "body", "Fale de forma clara e objetiva. Dê tempo para processar perguntas e valide as emoções da criança."),
                Map.of("title", "Estratégias na escola",
                        "body", "Combine com a docente adaptações: tempo extra, instruções por etapas e pausas entre atividades.")
        ));
    }

    @GetMapping("/feed")
    public ResponseEntity<List<Map<String, String>>> feed() {
        return ResponseEntity.ok(List.of(
                Map.of("title", "Inclusão começa em casa",
                        "category", "Família",
                        "summary", "Pequenas adaptações no cotidiano fazem grande diferença no bem-estar."),
                Map.of("title", "Jogos que desenvolvem atenção",
                        "category", "Atividades",
                        "summary", "Memória e sequência ajudam foco de forma lúdica."),
                Map.of("title", "Parceria escola-família",
                        "category", "Comunicação",
                        "summary", "Relatórios automáticos facilitam o diálogo com professores.")
        ));
    }

    @GetMapping("/atividades/{childId}")
    public ResponseEntity<List<Map<String, Object>>> atividades(@PathVariable Long childId) {
        return ResponseEntity.ok(List.of(
                Map.of("title", "Caça ao tesouro sensorial",
                        "description", "Esconda objetos com texturas diferentes e peça para a criança descrever o que sentiu.",
                        "duration", "15 min",
                        "materials", List.of("Objetos variados", "Cesta")),
                Map.of("title", "História em sequência",
                        "description", "Monte uma história com 4 imagens e peça para ordenar os eventos.",
                        "duration", "20 min",
                        "materials", List.of("Cartões ilustrados"))
        ));
    }

    @GetMapping("/school/activities/{childId}")
    public ResponseEntity<List<SchoolActivityResponse>> schoolActivities(@PathVariable Long childId) {
        return ResponseEntity.ok(schoolLearningService.activitiesForChild(childId));
    }

    @GetMapping("/guia-casa/{childId}")
    public ResponseEntity<Map<String, Object>> guiaCasa(@PathVariable Long childId) {
        return ResponseEntity.ok(Map.of(
                "recomendacoes", List.of(
                        "15 min de leitura compartilhada por dia",
                        "Atividade de cores 2x por semana",
                        "Pausa sensorial após tarefas escolares"
                ),
                "recursos", List.of("Guia de rotina visual", "Lista de jogos adaptados"),
                "acompanhamento", "Registre humor e energia em um diário simples para compartilhar com a escola."
        ));
    }

    @GetMapping("/desafios-semanais")
    public ResponseEntity<List<Map<String, String>>> desafios() {
        return ResponseEntity.ok(List.of(
                Map.of("title", "Quiz: Emoções", "questions", "5", "status", "disponível"),
                Map.of("title", "Quiz: Cores e formas", "questions", "8", "status", "disponível")
        ));
    }

    @GetMapping("/school/desafios-semanais/{childId}")
    public ResponseEntity<List<SchoolQuizResponse>> schoolDesafios(@PathVariable Long childId) {
        return ResponseEntity.ok(schoolLearningService.quizzesForChild(childId));
    }

    @GetMapping("/pf/desafios-semanais")
    public ResponseEntity<List<WeeklyQuizResponse>> desafiosPf() {
        return ResponseEntity.ok(weeklyQuizService.findPfQuizzes());
    }
}
