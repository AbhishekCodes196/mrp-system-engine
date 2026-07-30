package com.example.demo.repository;

import com.example.demo.model.BomLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Repository
public interface BomLinkRepository extends JpaRepository<BomLink, Long> {
    
    // Core lookup query method for parent assembly component dependencies
    List<BomLink> findByParentItemId(Long parentItemId);

    @Transactional
    void deleteByParentItemId(Long parentItemId);

    @Transactional
    void deleteByChildItemId(Long childItemId);
}
