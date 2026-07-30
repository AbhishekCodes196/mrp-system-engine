package com.example.demo.controller;

import com.example.demo.model.BomLink;
import com.example.demo.repository.BomLinkRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "*")
public class BomController {

    @Autowired
    private BomLinkRepository bomLinkRepository;

    // Receives parent and child links from the dashboard UI and writes them to the DB
    @PostMapping("/bom/add")
    public BomLink addBomLink(@RequestBody BomLink bomLink) {
        return bomLinkRepository.save(bomLink);
    }
    
    // NEW FEATURE: Fetch all active parent-component relationships for the UI grid
    @GetMapping("/bom-links")
    public java.util.List<com.example.demo.model.BomLink> getAllBomLinks() {
        return bomLinkRepository.findAll();
    }
    
}
