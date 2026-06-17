package senai.tcc.zupiapi.zupibackend.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import senai.tcc.zupiapi.zupibackend.model.Child;
import senai.tcc.zupiapi.zupibackend.model.User;
import senai.tcc.zupiapi.zupibackend.model.enums.UserType;

import java.util.Collection;
import java.util.List;
import java.util.Objects;

public class UserDetailsImpl implements UserDetails {

    private final Long id;
    private final String email;
    private final String password;
    private final Collection<? extends GrantedAuthority> authorities;
    private final boolean active;

    public UserDetailsImpl(Long id, String email, String password, Collection<? extends GrantedAuthority> authorities, boolean active) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.authorities = authorities;
        this.active = active;
    }

    public static UserDetailsImpl build(User user) {
        return build(user, user.getUserType());
    }

    public static UserDetailsImpl build(User user, UserType effectiveType) {
        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + effectiveType.name()));
        return new UserDetailsImpl(user.getId(), user.getEmail(), user.getPassword(), authorities, user.isActive());
    }

    public static UserDetailsImpl buildFromChild(Child child) {
        String role = child.isSchoolLinked() ? "ALUNO_CREDENCIADO" : "CRIANCA";
        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role));
        return new UserDetailsImpl(child.getId(), child.getChildLoginEmail(), child.getChildPasswordHash(), authorities, true);
    }

    public Long getId() {
        return id;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return active;
    }

    @Override
    public boolean isAccountNonLocked() {
        return active;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return active;
    }

    @Override
    public boolean isEnabled() {
        return active;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof UserDetailsImpl)) return false;
        UserDetailsImpl that = (UserDetailsImpl) o;
        return Objects.equals(id, that.id);
    }
}
