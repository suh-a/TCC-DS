package senai.tcc.zupiapi.zupibackend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import senai.tcc.zupiapi.zupibackend.dto.mapper.ChildReportScoreMapper;
import senai.tcc.zupiapi.zupibackend.dto.request.ChildReportScoreRequest;
import senai.tcc.zupiapi.zupibackend.dto.response.ChildReportScoreResponse;
import senai.tcc.zupiapi.zupibackend.exceptions.ResourceNotFoundException;
import senai.tcc.zupiapi.zupibackend.model.ChildReport;
import senai.tcc.zupiapi.zupibackend.model.ChildReportScore;
import senai.tcc.zupiapi.zupibackend.model.SkillArea;
import senai.tcc.zupiapi.zupibackend.repositories.ChildReportRepository;
import senai.tcc.zupiapi.zupibackend.repositories.ChildReportScoreRepository;
import senai.tcc.zupiapi.zupibackend.repositories.SkillAreaRepository;

@Service
public class ChildReportScoreService {

    @Autowired
    private ChildReportScoreRepository childReportScoreRepository;

    @Autowired
    private SkillAreaRepository skillAreaRepository;

    @Autowired
    private ChildReportScoreMapper scoreMapper;


    public ChildReportScore save(ChildReportScoreRequest scoreRequest, ChildReport childReport) {

        SkillArea skillArea = skillAreaRepository.findById(scoreRequest.themeId())
                .orElseThrow(() -> new ResourceNotFoundException("skill area not found"));

        ChildReportScore score = scoreMapper.toEntity(scoreRequest);

        score.setChildReport(childReport);
        score.setSkillArea(skillArea);

        return childReportScoreRepository.save(score);
    }


}
