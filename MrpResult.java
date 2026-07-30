package com.example.demo.model;

public class MrpResult {
    private Long id;
    private String partName;
    private Integer grossRequirement;
    private Integer currentStock;
    private Integer netRequirement;
    private Integer leadTimeDays;

    public MrpResult() {}

    public MrpResult(Long id, String partName, Integer grossRequirement, 
                     Integer currentStock, Integer netRequirement, Integer leadTimeDays) {
        this.id = id;
        this.partName = partName;
        this.grossRequirement = grossRequirement;
        this.currentStock = currentStock;
        this.netRequirement = netRequirement;
        this.leadTimeDays = leadTimeDays;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getPartName() { return partName; }
    public void setPartName(String partName) { this.partName = partName; }

    public Integer getGrossRequirement() { return grossRequirement; }
    public void setGrossRequirement(Integer grossRequirement) { this.grossRequirement = grossRequirement; }

    public Integer getCurrentStock() { return currentStock; }
    public void setCurrentStock(Integer currentStock) { this.currentStock = currentStock; }

    public Integer getNetRequirement() { return netRequirement; }
    public void setNetRequirement(Integer netRequirement) { this.netRequirement = netRequirement; }

    public Integer getLeadTimeDays() { return leadTimeDays; }
    public void setLeadTimeDays(Integer leadTimeDays) { this.leadTimeDays = leadTimeDays; }
}
