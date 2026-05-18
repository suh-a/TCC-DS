package senai.tcc.zupiapi.zupibackend.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import senai.tcc.zupiapi.zupibackend.exceptions.ResourceNotFoundException;
import senai.tcc.zupiapi.zupibackend.model.Child;
import senai.tcc.zupiapi.zupibackend.model.enums.UserType;
import senai.tcc.zupiapi.zupibackend.repositories.ChildRepository;

@Service
public class AccessControlService {

    @Autowired
    private ChildRepository childRepository;

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
        if (!child.getResponsible().getId().equals(currentId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado");
        }
    }
}
