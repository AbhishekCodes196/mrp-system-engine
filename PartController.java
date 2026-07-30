package com.example.demo.controller;

import com.example.demo.model.Part;
import com.example.demo.repository.PartRepository;
import com.example.demo.repository.BomLinkRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
public class PartController {

    @Autowired
    private PartRepository partRepository;

    @Autowired
    private BomLinkRepository bomLinkRepository;

    // 1. Fetch all items
    @GetMapping("/parts")
    public List<Part> getAllParts() {
        return partRepository.findAllByOrderByIdAsc(); // Sorts cleanly by ID
    }

    // 2. Accept and write new items from frontend
    @PostMapping("/parts")
    public Part savePart(@RequestBody Part part) {
        return partRepository.save(part);
    }

    // 3. Update an existing item
    @PutMapping("/parts/{id}")
    public Part updatePart(@PathVariable Long id, @RequestBody Part partDetails) {
        Part part = partRepository.findById(id).orElse(null);
        if (part != null) {
            part.setPartName(partDetails.getPartName());
            part.setCurrentStock(partDetails.getCurrentStock());
            part.setLeadTimeDays(partDetails.getLeadTimeDays());
            return partRepository.save(part);
        }
        return null;
    }
    
    // 4. Safe Cascade Delete: Clears associated BOM links first
    @DeleteMapping("/parts/{id}")
    public void deletePart(@PathVariable Long id) {
        bomLinkRepository.deleteByParentItemId(id);
        bomLinkRepository.deleteByChildItemId(id);
        partRepository.deleteById(id);
    }
    
    // 5. Reset database utility safely
    @PostMapping("/parts/reset")
    public String resetDatabase() {
        bomLinkRepository.deleteAll(); // Clear relational links first
        partRepository.deleteAll();   // Clear main part records
        return "{\"status\":\"Database cleared successfully\"}";
    }
}
