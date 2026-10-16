package com.neoenergia.cesar.neofluxo.controller;

import com.neoenergia.cesar.neofluxo.dto.CalculationRequest;
import com.neoenergia.cesar.neofluxo.dto.CalculationResponse;
import com.neoenergia.cesar.neofluxo.service.CalculationService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/calc")
public class CalculationController {

    private final CalculationService calculationService;

    public CalculationController(CalculationService calculationService) {
        this.calculationService = calculationService;
    }

    @PostMapping("/demand")
    public CalculationResponse calculateDemand(@RequestBody CalculationRequest request) {
        return calculationService.calculate(request);
    }
}
