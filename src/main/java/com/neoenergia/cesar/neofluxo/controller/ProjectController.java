package com.neoenergia.cesar.neofluxo.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.neoenergia.cesar.neofluxo.dto.ProjectRejectRequest;
import com.neoenergia.cesar.neofluxo.dto.ProjectResponse;
import com.neoenergia.cesar.neofluxo.dto.ProjectStepRequest;
import com.neoenergia.cesar.neofluxo.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/projects")
public class ProjectController {
    private final ProjectService service;

    public ProjectController(ProjectService service) {
        this.service = service;
    }

    private UUID uid(Authentication authentication) {
        return UUID.fromString(authentication.getName());
    }

    private boolean admin(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .anyMatch(x -> x.getAuthority().equals("ROLE_ADMIN"));
    }

    private boolean analystOrAdmin(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .anyMatch(x -> x.getAuthority().equals("ROLE_ANALISTA") || x.getAuthority().equals("ROLE_ADMIN"));
    }

    @GetMapping
    public List<ProjectResponse> all(Authentication authentication) {
        return service.all(uid(authentication), analystOrAdmin(authentication));
    }

    @GetMapping("/{id}")
    public ProjectResponse get(@PathVariable UUID id, Authentication authentication) {
        return service.byId(id, uid(authentication), analystOrAdmin(authentication));
    }

    @PostMapping
    public ProjectResponse create(@RequestBody JsonNode data, Authentication authentication) {
        return service.create(uid(authentication), data);
    }

    @PutMapping("/{id}")
    public ProjectResponse update(@PathVariable UUID id, @RequestBody JsonNode data, Authentication authentication) {
        return service.update(id, uid(authentication), admin(authentication), data);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id, Authentication authentication) {
        service.delete(id, uid(authentication), admin(authentication));
    }

    @PutMapping("/{id}/steps/{step}")
    public ProjectResponse step(
            @PathVariable UUID id,
            @PathVariable int step,
            @RequestBody ProjectStepRequest body,
            Authentication authentication) {
        if (step < 1 || step > 6) {
            throw new IllegalArgumentException("A etapa deve estar entre 1 e 6");
        }
        ProjectStepRequest request = new ProjectStepRequest(
                step, body.data(), body.units(), body.serviceLoads(), body.calcResult(),
                body.subestacao(), body.review());
        return service.saveStep(id, uid(authentication), admin(authentication), request);
    }

    @PostMapping("/{id}/submit")
    public ProjectResponse submit(@PathVariable UUID id, Authentication authentication) {
        return service.submit(id, uid(authentication));
    }

    @PostMapping("/{id}/approve")
    public ProjectResponse approve(@PathVariable UUID id, Authentication authentication) {
        return service.approve(id, uid(authentication));
    }

    @PostMapping("/{id}/reject")
    public ProjectResponse reject(
            @PathVariable UUID id,
            @Valid @RequestBody ProjectRejectRequest request,
            Authentication authentication) {
        return service.reject(id, uid(authentication), request);
    }
}
