package senai.tcc.zupiapi.zupibackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import senai.tcc.zupiapi.zupibackend.model.SchoolChatMessage;

import java.util.List;

public interface SchoolChatMessageRepository extends JpaRepository<SchoolChatMessage, Long> {
    List<SchoolChatMessage> findTop50BySchoolIdOrderByCreatedAtDesc(Long schoolId);
}
