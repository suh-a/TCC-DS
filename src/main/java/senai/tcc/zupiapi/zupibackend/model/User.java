package senai.tcc.zupiapi.zupibackend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import senai.tcc.zupiapi.zupibackend.model.enums.PlanType;
import senai.tcc.zupiapi.zupibackend.model.enums.UserType;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "usuarios", uniqueConstraints = {
        @UniqueConstraint(name = "uk_usuario_email", columnNames = {"email"})
})
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String email;

    private String password;

    @Column(unique = true)
    private String googleId;

    private Boolean googleAccount;

    private String provider;

    @Column(unique = true)
    private String cpf;

    private java.time.LocalDate birthDate;

    @Enumerated(EnumType.STRING)
    private UserType userType = UserType.RESPONSAVEL;

    @Enumerated(EnumType.STRING)
    private PlanType planType;

    private String phone;
    @Embedded
    private Address address;
    private boolean active = true;
    private boolean twoFactorEnabled;

    private String profilePhotoUrl;

    @OneToMany(mappedBy = "responsible")
    private List<Child> children = new ArrayList<>();

    @OneToMany(mappedBy = "user")
    private List<Event> events = new ArrayList<>();

    public User() {}

    public User(Long id, String name, String email, String password) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public java.time.LocalDate getBirthDate() {
        return birthDate;
    }

    public void setBirthDate(java.time.LocalDate birthDate) {
        this.birthDate = birthDate;
    }

    public UserType getUserType() {
        return userType;
    }

    public void setUserType(UserType userType) {
        this.userType = userType;
    }

    public PlanType getPlanType() {
        return planType;
    }

    
    public void setPlanType(PlanType planType) {
        this.planType = planType;
    }



    public boolean isTwoFactorEnabled() {
        return twoFactorEnabled;
    }

    public void setTwoFactorEnabled(boolean twoFactorEnabled) {
        this.twoFactorEnabled = twoFactorEnabled;
    }

    public String getProfilePhotoUrl() {
        return profilePhotoUrl;
    }

    public void setProfilePhotoUrl(String profilePhotoUrl) {
        this.profilePhotoUrl = profilePhotoUrl;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }


    public Address getAddress() {
        return address;
    }

    public void setAddress(Address address) {
        this.address = address;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public List<Child> getChildren() {
        return children;
    }

    public void setChildren(List<Child> children) {
        this.children = children;
    }

    public List<Event> getEvents() {
        return events;
    }

    public void setEvents(List<Event> events) {
        this.events = events;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        User user = (User) o;
        return Objects.equals(id, user.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
