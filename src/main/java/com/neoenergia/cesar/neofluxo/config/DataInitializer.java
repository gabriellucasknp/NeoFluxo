package com.neoenergia.cesar.neofluxo.config;
import com.neoenergia.cesar.neofluxo.entity.User; import com.neoenergia.cesar.neofluxo.repository.UserRepository; import org.springframework.boot.CommandLineRunner; import org.springframework.context.annotation.*; import org.springframework.security.crypto.password.PasswordEncoder;
@Configuration public class DataInitializer {
  @Bean CommandLineRunner seed(UserRepository r, PasswordEncoder e) {
    return args -> {
      if (r.findByEmailIgnoreCase("admin@example.com").isEmpty()) {
        r.save(createAdmin(e));
      }
    };
  }

  private User createAdmin(PasswordEncoder encoder) {
    User user = new User();
    user.setName("Administrador");
    user.setEmail("admin@example.com");
    user.setPasswordHash(encoder.encode("Admin@123"));
    user.setRole(User.Role.ADMIN);
    user.setDepartment("Engenharia");
    user.setActive(true);
    return user;
  }
}
