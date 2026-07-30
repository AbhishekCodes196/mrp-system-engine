package com.example.demo.repository;

import com.example.demo.model.Part;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PartRepository extends JpaRepository<Part, Long> {
    
    // Fetches all parts automatically ordered by primary key ID
    List<Part> findAllByOrderByIdAsc();
}
