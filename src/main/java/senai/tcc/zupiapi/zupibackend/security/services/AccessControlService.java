package senai.tcc.zupiapi.zupibackend.security.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import senai.tcc.zupiapi.zupibackend.exceptions.ResourceNotFoundException;
import senai.tcc.zupiapi.zupibackend.model.Child;
import senai.tcc.zupiapi.zupibackend.model.School;
import senai.tcc.zupiapi.zupibackend.model.SchoolClass;
import senai.tcc.zupiapi.zupibackend.model.Teacher;
import senai.tcc.zupiapi.zupibackend.model.enums.UserType;
import senai.tcc.zupiapi.zupibackend.repositories.ChildRepository;
import senai.tcc.zupiapi.zupibackend.repositories.SchoolClassRepository;
import senai.tcc.zupiapi.zupibackend.repositories.SchoolRepository;
import senai.tcc.zupiapi.zupibackend.repositories.TeacherRepository;
import senai.tcc.zupiapi.zupibackend.security.SecurityUtils;

@Service
public class AccessControlService {

    @Autowired
    private ChildRepository childRepository;

    @Autowired
    private SchoolRepository schoolRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private SchoolClassRepository schoolClassRepository;

    public void requireUserId(Long userId) {
        SecurityUtils.requireUserId(userId);
    }

    public void ensureCanAccessChild(Long childId) {
        if (SecurityUtils.hasRole(UserType.ADMIN.name())) {
            return;
        }
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new ResourceNotFoundException("Child not found"));
        Long currentId = SecurityUtils.getCurrentUserId();
        if (SecurityUtils.isChildAccount()) {
            if (!currentId.equals(childId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado");
            }
            return;
        }
        if (SecurityUtils.hasRole(UserType.ESCOLA.name()) && canSchoolAccessChild(currentId, child)) {
            return;
        }
        if (SecurityUtils.hasRole(UserType.DOCENTE.name()) && canTeacherAccessChild(currentId, child)) {
            return;
        }
        if (child.getResponsible() == null || !child.getResponsible().getId().equals(currentId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado");
        }
    }

    private boolean canSchoolAccessChild(Long currentUserId, Child child) {
        School school = schoolRepository.findByAccountId(currentUserId).orElse(null);
        if (school == null || !child.isSchoolLinked()) {
            return false;
        }
        return sameSchool(school, child);
    }

    private boolean canTeacherAccessChild(Long currentUserId, Child child) {
        Teacher teacher = teacherRepository.findByAccountId(currentUserId).orElse(null);
        if (teacher == null || teacher.getSchool() == null || !child.isSchoolLinked()) {
            return false;
        }
        if (!sameSchool(teacher.getSchool(), child)) {
            return false;
        }
        String childClass = normalize(child.getSchoolClass());
        return schoolClassRepository.findByTeacherId(teacher.getId()).stream()
                .map(SchoolClass::getName)
                .map(this::normalize)
                .anyMatch(childClass::equals);
    }

    private boolean sameSchool(School school, Child child) {
        boolean sameId = child.getSchool() != null && school.getId().equals(child.getSchool().getId());
        boolean sameName = child.getSchoolName() != null && child.getSchoolName().equalsIgnoreCase(school.getName());
        return sameId || sameName;
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase();
    }
}
