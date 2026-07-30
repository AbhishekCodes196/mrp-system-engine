package com.example.demo.controller;

import com.example.demo.model.BomNode;
import com.example.demo.service.MRPService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(origins = "*")
@RestController
public class ProductController {

    @Autowired
    private MRPService mrpService;

    @GetMapping("/explode/{id}")
    public BomNode getBom(@PathVariable Long id) {
        return mrpService.getBomTree(id, 1.0);
    }
}
