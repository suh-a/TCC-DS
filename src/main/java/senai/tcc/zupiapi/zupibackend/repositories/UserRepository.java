package senai.tcc.zupiapi.zupibackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import senai.tcc.zupiapi.zupibackend.model.User;
import senai.tcc.zupiapi.zupibackend.model.enums.UserType;

import java.util.List;
import java.util.Optional;


public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    List<User> findAllByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByUserType(UserType userType);

    boolean existsByCpf(String cpf);

    Optional<User> findByCpf(String cpf);
}
