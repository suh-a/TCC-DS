package senai.tcc.zupiapi.zupibackend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import senai.tcc.zupiapi.zupibackend.dto.ChildRegistrationResponse;
import senai.tcc.zupiapi.zupibackend.dto.request.ChildRequest;
import senai.tcc.zupiapi.zupibackend.dto.request.ResponsibleRegisterRequest;
import senai.tcc.zupiapi.zupibackend.dto.response.ResponsibleSummaryResponse;
import senai.tcc.zupiapi.zupibackend.exceptions.BusinessException;
import senai.tcc.zupiapi.zupibackend.exceptions.ResourceNotFoundException;
import senai.tcc.zupiapi.zupibackend.model.Address;
import senai.tcc.zupiapi.zupibackend.model.School;
import senai.tcc.zupiapi.zupibackend.model.User;
import senai.tcc.zupiapi.zupibackend.model.enums.PlanType;
import senai.tcc.zupiapi.zupibackend.model.enums.UserType;
import senai.tcc.zupiapi.zupibackend.repositories.ChildRepository;
import senai.tcc.zupiapi.zupibackend.repositories.SchoolRepository;
import senai.tcc.zupiapi.zupibackend.repositories.UserRepository;
import senai.tcc.zupiapi.zupibackend.security.SecurityUtils;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class SchoolService {

    @Autowired
    private SchoolRepository schoolRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ChildRepository childRepository;

    @Autowired
    private ChildService childService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public School requireCurrentSchool() {
        if (!SecurityUtils.hasRole(UserType.ESCOLA.name())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso restrito à escola");
        }
        Long accountId = SecurityUtils.getCurrentUserId();
        return schoolRepository.findByAccountId(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Escola não encontrada para esta conta"));
    }

    public List<ResponsibleSummaryResponse> searchResponsibles(String query) {
        School school = requireCurrentSchool();
        String schoolName = school.getName();
        String q = query == null ? "" : query.trim().toLowerCase();

        Map<Long, User> byId = new LinkedHashMap<>();

        childRepository.findBySchoolLinkedTrueAndSchoolName(schoolName).forEach(child -> {
            User resp = child.getResponsible();
            if (resp != null && resp.getUserType() == UserType.RESPONSAVEL) {
                byId.putIfAbsent(resp.getId(), resp);
            }
        });

        if (!q.isBlank()) {
            String digits = q.replaceAll("\\D", "");
            if (digits.length() == 11) {
                userRepository.findByCpf(digits)
                        .filter(u -> u.getUserType() == UserType.RESPONSAVEL)
                        .ifPresent(u -> byId.putIfAbsent(u.getId(), u));
            }
            userRepository.findByUserType(UserType.RESPONSAVEL).stream()
                    .filter(u -> matchesQuery(u, q, digits))
                    .forEach(u -> byId.putIfAbsent(u.getId(), u));
        }

        List<ResponsibleSummaryResponse> result = new ArrayList<>();
        byId.values().stream()
                .sorted((a, b) -> a.getName().compareToIgnoreCase(b.getName()))
                .forEach(u -> result.add(toSummary(u)));
        return result;
    }

    public ResponsibleSummaryResponse registerResponsible(ResponsibleRegisterRequest request) {
        requireCurrentSchool();

        if (request.name() == null || request.name().isBlank()) {
            throw new BusinessException("Nome do responsável é obrigatório");
        }
        if (request.email() == null || request.email().isBlank()) {
            throw new BusinessException("E-mail é obrigatório");
        }
        if (request.password() == null || request.password().length() < 6) {
            throw new BusinessException("Senha deve ter no mínimo 6 caracteres");
        }

        String cpf = onlyDigits(request.cpf());
        if (cpf.length() != 11) {
            throw new BusinessException("CPF inválido");
        }
        if (userRepository.existsByCpf(cpf)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "CPF já cadastrado");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail ja cadastrado");
        }
        if (request.birthDate() == null) {
            throw new BusinessException("Data de nascimento é obrigatória");
        }

        User user = new User();
        user.setName(request.name().trim());
        user.setEmail(request.email().trim());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setCpf(cpf);
        user.setBirthDate(request.birthDate());
        user.setPhone(request.phone());
        user.setUserType(UserType.RESPONSAVEL);
        user.setPlanType(PlanType.PESSOA_FISICA);
        user.setAddress(new Address());

        User saved = userRepository.save(user);
        return toSummary(saved);
    }

    public ChildRegistrationResponse registerStudent(ChildRequest request) {
        School school = requireCurrentSchool();
        if (request.responsibleId() == null) {
            throw new BusinessException("Selecione um responsável cadastrado");
        }

        User responsible = userRepository.findById(request.responsibleId())
                .orElseThrow(() -> new ResourceNotFoundException("Responsável não encontrado"));
        if (responsible.getUserType() != UserType.RESPONSAVEL) {
            throw new BusinessException("Usuário selecionado não é um responsável");
        }

        ChildRequest schoolChild = new ChildRequest(
                request.name(),
                null,
                request.cpf(),
                request.birthDate(),
                request.schoolClass(),
                request.condition(),
                responsible.getId(),
                true,
                school.getName()
        );

        return childService.saveForSchool(schoolChild);
    }

    private static boolean matchesQuery(User u, String q, String digits) {
        if (u.getName() != null && u.getName().toLowerCase().contains(q)) return true;
        if (!digits.isBlank() && u.getCpf() != null && u.getCpf().contains(digits)) return true;
        return false;
    }

    private static String onlyDigits(String value) {
        if (value == null) return "";
        return value.replaceAll("\\D", "");
    }

    private static ResponsibleSummaryResponse toSummary(User u) {
        return new ResponsibleSummaryResponse(
                u.getId(),
                u.getName(),
                u.getEmail(),
                u.getCpf(),
                u.getPhone()
        );
    }
}
