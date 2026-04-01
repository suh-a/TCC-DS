package senai.tcc.zupiapi.zupibackend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import senai.tcc.zupiapi.zupibackend.dto.LoginDTO;
import senai.tcc.zupiapi.zupibackend.dto.mapper.UserMapper;
import senai.tcc.zupiapi.zupibackend.dto.request.UserRequest;
import senai.tcc.zupiapi.zupibackend.dto.response.UserResponse;
import senai.tcc.zupiapi.zupibackend.exceptions.ResourceNotFoundException;
import senai.tcc.zupiapi.zupibackend.model.User;
import senai.tcc.zupiapi.zupibackend.repositories.UserRepository;

import java.util.List;


@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserMapper userMapper;

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public List<UserResponse> findAll() {
        return userMapper.toResponseList(userRepository.findAll());
    }

    public UserResponse findById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(()->new ResourceNotFoundException("User not found with id " + id));


        return userMapper.toResponse(user);
    }

    public UserResponse findByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(()->new ResourceNotFoundException("User not found with email " + email));

        return userMapper.toResponse(user);
    }

    public UserResponse save(UserRequest user) {
        User userEntity = userMapper.toEntity(user);

        userEntity.setPassword(passwordEncoder.encode(user.password()));
        userEntity = userRepository.save(userEntity);

        return userMapper.toResponse(userEntity);
    }

    public Boolean validationPassword(LoginDTO user) {
       User userEntity = userRepository.findByEmail(user.email())
               .orElseThrow(()->new ResourceNotFoundException("User not found with email " + user.email())) ;

       return passwordEncoder.matches(user.password(), userEntity.getPassword());
    }
}
