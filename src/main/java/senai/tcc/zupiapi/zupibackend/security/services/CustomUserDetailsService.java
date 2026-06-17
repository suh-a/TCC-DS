package senai.tcc.zupiapi.zupibackend.security.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import senai.tcc.zupiapi.zupibackend.model.Child;
import senai.tcc.zupiapi.zupibackend.model.User;
import senai.tcc.zupiapi.zupibackend.model.enums.UserType;
import senai.tcc.zupiapi.zupibackend.repositories.ChildRepository;
import senai.tcc.zupiapi.zupibackend.repositories.UserRepository;
import senai.tcc.zupiapi.zupibackend.security.UserDetailsImpl;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ChildRepository childRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        if (username != null && username.matches("\\d+")) {
            User user = userRepository.findById(Long.parseLong(username)).orElse(null);
            if (user != null) {
                return UserDetailsImpl.build(user, effectiveUserType(user));
            }
        }

        Child child = childRepository.findByChildLoginEmail(username).orElse(null);
        if (child != null) {
            return UserDetailsImpl.buildFromChild(child);
        }

        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario nao encontrado: " + username));
        return UserDetailsImpl.build(user, effectiveUserType(user));
    }

    private UserType effectiveUserType(User user) {
        if (user.getUserType() == UserType.RESPONSAVEL
                && childRepository.findByResponsibleId(user.getId()).stream().anyMatch(Child::isSchoolLinked)) {
            return UserType.RESPONSAVEL_CREDENCIADO;
        }
        return user.getUserType();
    }
}
