package senai.tcc.zupiapi.zupibackend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import senai.tcc.zupiapi.zupibackend.dto.mapper.SkillAreaMapper;
import senai.tcc.zupiapi.zupibackend.dto.request.SkillAreaRequest;
import senai.tcc.zupiapi.zupibackend.dto.response.SkillAreaResponse;
import senai.tcc.zupiapi.zupibackend.exceptions.ResourceNotFoundException;
import senai.tcc.zupiapi.zupibackend.model.SkillArea;
import senai.tcc.zupiapi.zupibackend.repositories.SkillAreaRepository;

import java.util.List;

@Service
public class SkillAreaService {

    @Autowired
    private SkillAreaRepository skillAreaRepository;

    @Autowired
    private SkillAreaMapper skillAreaMapper;

    public List<SkillAreaResponse> findAllSkillAreas() {
        return skillAreaMapper.toResponse(skillAreaRepository.findAll());
    }

    public SkillAreaResponse save(SkillAreaRequest skillAreaRequest) {
        SkillArea skillArea = skillAreaMapper.toEntity(skillAreaRequest);
        return skillAreaMapper.toResponse(skillAreaRepository.save(skillArea));
    }
    public SkillAreaResponse update(Long id, SkillAreaRequest skillAreaRequest) {
        SkillArea skillArea = skillAreaRepository.findById(id)
                .orElseThrow(()-> new ResourceNotFoundException("Skill area not found"));

        skillArea.setName(skillAreaRequest.name());

        return skillAreaMapper.toResponse(skillAreaRepository.save(skillArea));
    }

}
