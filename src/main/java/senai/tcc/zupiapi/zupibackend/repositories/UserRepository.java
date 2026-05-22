package senai.tcc.zupiapi.zupibackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import senai.tcc.zupiapi.zupibackend.model.User;
import senai.tcc.zupiapi.zupibackend.model.enums.PlanType;
import senai.tcc.zupiapi.zupibackend.model.enums.UserType;

import java.util.List;
import java.util.Optional;


public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    List<User> findAllByEmail(String email);

    Optional<User> findByEmailAndPlanType(String email, PlanType planType);

    boolean existsByEmail(String email);

    boolean existsByEmailAndPlanType(String email, PlanType planType);

    List<User> findByUserType(UserType userType);
}
