package senai.tcc.zupiapi.zupibackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import senai.tcc.zupiapi.zupibackend.model.LibraryBook;

import java.util.List;
import java.util.Optional;

public interface LibraryBookRepository extends JpaRepository<LibraryBook, Long> {
    List<LibraryBook> findBySchoolId(Long schoolId);
    Optional<LibraryBook> findByIdAndSchoolId(Long id, Long schoolId);
}
