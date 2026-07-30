package com.example.demo.controller;

import com.example.demo.model.BomLink;
import com.example.demo.model.MrpResult;
import com.example.demo.model.Part;
import com.example.demo.repository.BomLinkRepository;
import com.example.demo.repository.PartRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@CrossOrigin(origins = "*")
public class MrpController {

    @Autowired
    private PartRepository partRepository;

    @Autowired
    private BomLinkRepository bomLinkRepository;

    @GetMapping("/mrp/calculate")
    public List<MrpResult> calculateMRP(@RequestParam Long partId, @RequestParam Integer quantity) {
        List<MrpResult> results = new ArrayList<>();

        // 1. Look up all component connections linked to this parent product ID
        List<BomLink> links = bomLinkRepository.findByParentItemId(partId);

        // 2. Loop through each component to calculate material requirements
        for (BomLink link : links) {
            Part component = partRepository.findById(link.getChildItemId()).orElse(null);
            
            if (component != null) {
                // Gross = Production demand quantity * quantity needed per parent unit
                int grossRequirement = quantity * link.getQuantityRequired();
                
                // Net = Gross requirement minus current stock
                int netRequirement = grossRequirement - component.getCurrentStock();
                if (netRequirement < 0) netRequirement = 0; // No negative shortages

                // Uses external com.example.demo.model.MrpResult
                MrpResult result = new MrpResult(
                    component.getId(),
                    component.getPartName(),
                    grossRequirement,
                    component.getCurrentStock(),
                    netRequirement,
                    component.getLeadTimeDays()
                );
                results.add(result);
            }
        }
        return results;
    }
}
