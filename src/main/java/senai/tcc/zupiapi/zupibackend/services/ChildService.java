package senai.tcc.zupiapi.zupibackend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.stereotype.Service;
import senai.tcc.zupiapi.zupibackend.dto.mapper.ChildMapper;
import senai.tcc.zupiapi.zupibackend.dto.request.ChildRequest;
import senai.tcc.zupiapi.zupibackend.dto.response.ChildResponse;
import senai.tcc.zupiapi.zupibackend.exceptions.DataBaseExceptions;
import senai.tcc.zupiapi.zupibackend.exceptions.ResourceNotFoundException;
import senai.tcc.zupiapi.zupibackend.model.Child;
import senai.tcc.zupiapi.zupibackend.model.User;
import senai.tcc.zupiapi.zupibackend.repositories.ChildRepository;
import senai.tcc.zupiapi.zupibackend.repositories.UserRepository;

import java.util.List;

@Service
public class ChildService {

    @Autowired
    private ChildRepository childRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ChildMapper childMapper;

    public List<ChildResponse> findAll() {
        return childMapper.toResponseList(childRepository.findAll());
    }

    public ChildResponse findById(Long id) {
        Child child =  childRepository.findById(id)
                .orElseThrow(()-> new ResourceNotFoundException("Child not found"));

        return childMapper.toResponse(child);
    }

    public ChildResponse save(ChildRequest childRequest) {
        User user = userRepository.findById(childRequest.responsibleId())
                .orElseThrow(()-> new ResourceNotFoundException("User not found"));

        Child child = childMapper.toEntity(childRequest);

        child.setResponsible(user);

        return childMapper.toResponse(childRepository.save(child));
    }

    public ChildResponse update(Long id, ChildRequest childRequest) {
        Child child = childRepository.findById(id)
                .orElseThrow(()-> new ResourceNotFoundException("Child not found"));

        child.setName(childRequest.name());
        child.setBirthDate(childRequest.birthDate());
        child.setSchoolClass(childRequest.schoolClass());
        child.setCondition(childRequest.condition());

        return childMapper.toResponse(childRepository.save(child));
    }

    public void delete(Long id) {
        try {
            childRepository.deleteById(id);
        }catch(DataIntegrityViolationException e){
            throw new DataBaseExceptions("Error deleting child");
        }
    }

    public List<ChildResponse> findByResponsibleId(Long id) {
        List<Child> list = childRepository.findByResponsibleId(id);

        return childMapper.toResponseList(list);
    }
}
