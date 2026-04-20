package com.engineering.alumni.controller;
import com.engineering.alumni.dto.ApiResponse;
import com.engineering.alumni.entity.Alumni;
import com.engineering.alumni.entity.User;
import com.engineering.alumni.repository.AlumniRepository;
import com.engineering.alumni.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/users")
public class UserProfileController {
    private final UserRepository repo;
    private final AlumniRepository alumniRepo;

    public UserProfileController(UserRepository repo, AlumniRepository alumniRepo) {
        this.repo = repo;
        this.alumniRepo = alumniRepo;
    }

    @GetMapping("/alumni")
    public ResponseEntity<?> getAllAlumni() {
        List<Map<String, Object>> result = new ArrayList<>();
        repo.findAll().stream().filter(u -> "ALUMNI".equals(u.getRole())).forEach(u -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", u.getId()); m.put("name", u.getName()); m.put("email", u.getEmail());
            m.put("branch", u.getBranch()); m.put("graduationYear", u.getGraduationYear());
            m.put("phone", u.getPhone()); m.put("currentPosition", u.getCurrentPosition());
            m.put("company", u.getCompany()); m.put("location", u.getLocation());
            m.put("linkedinUrl", u.getLinkedinUrl()); m.put("skills", u.getSkills());
            m.put("workExperience", u.getWorkExperience()); m.put("source", "registered");
            result.add(m);
        });
        Set<String> added = new HashSet<>();
        result.forEach(m -> added.add((String) m.get("email")));
        alumniRepo.findAll().forEach(a -> {
            if (a.getEmail() != null && !added.contains(a.getEmail())) {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id", a.getId()); m.put("name", a.getName()); m.put("email", a.getEmail());
                m.put("branch", a.getBranch() != null ? a.getBranch().name() : null);
                m.put("graduationYear", a.getGraduationYear()); m.put("phone", a.getPhone());
                m.put("company", a.getCompany()); m.put("currentPosition", a.getCurrentPosition());
                m.put("location", a.getLocation()); m.put("linkedinUrl", a.getLinkedinUrl());
                m.put("source", "uploaded");
                result.add(m); added.add(a.getEmail());
            }
        });
        return ResponseEntity.ok(ApiResponse.success("Alumni list", result));
    }

    @GetMapping("/students")
    public ResponseEntity<?> getAllStudents() {
        return ResponseEntity.ok(ApiResponse.success("Student list",
            repo.findAll().stream().filter(u -> "STUDENT".equals(u.getRole())).toList()));
    }

    @GetMapping("/{email}")
    public ResponseEntity<?> getProfile(@PathVariable String email) {
        return repo.findByEmail(email)
            .map(u -> ResponseEntity.ok(ApiResponse.success("Profile", u)))
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{email}")
    public ResponseEntity<?> updateProfile(@PathVariable String email, @RequestBody Map<String, Object> body) {
        return repo.findByEmail(email).map(u -> {
            if (body.containsKey("name")) u.setName((String) body.get("name"));
            if (body.containsKey("phone")) u.setPhone((String) body.get("phone"));
            if (body.containsKey("branch")) u.setBranch((String) body.get("branch"));
            if (body.get("graduationYear") != null && !body.get("graduationYear").toString().isBlank()) {
                try { u.setGraduationYear(Integer.parseInt(body.get("graduationYear").toString())); } catch (NumberFormatException ignored) {}
            }
            if (body.containsKey("currentPosition")) u.setCurrentPosition((String) body.get("currentPosition"));
            if (body.containsKey("company")) u.setCompany((String) body.get("company"));
            if (body.get("workExperience") != null && !body.get("workExperience").toString().isBlank()) {
                try { u.setWorkExperience(Integer.parseInt(body.get("workExperience").toString())); } catch (NumberFormatException ignored) {}
            }
            if (body.containsKey("location")) u.setLocation((String) body.get("location"));
            if (body.containsKey("linkedinUrl")) u.setLinkedinUrl((String) body.get("linkedinUrl"));
            if (body.containsKey("skills")) u.setSkills((String) body.get("skills"));
            repo.save(u);
            return ResponseEntity.ok(ApiResponse.success("Updated", u));
        }).orElse(ResponseEntity.notFound().build());
    }
}
