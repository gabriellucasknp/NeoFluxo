package com.neoenergia.cesar.neofluxo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories(considerNestedRepositories = true) // necessário: os repositories ficam dentro de Repos.java
public class NeofluxoApplication {
    public static void main(String[] args) {
        SpringApplication.run(NeofluxoApplication.class, args);
    }
}
