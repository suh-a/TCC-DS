package senai.tcc.zupiapi.zupibackend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
public class SkillArea {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String name;

    public SkillArea(Long id, String name) {
        this.id = id;
        this.name = name;
    }

    public SkillArea() {}

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

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        SkillArea skillArea = (SkillArea) o;
        return Objects.equals(id, skillArea.id) && Objects.equals(name, skillArea.name);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, name);
    }
}
