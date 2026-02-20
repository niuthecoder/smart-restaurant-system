package com.example.restaurant.backend.DTO;

/**
 * Table available for the requested date/time slot (90-min window).
 */
public class AvailableTableDTO {

    private Long id;
    private Integer number;
    private Integer capacity;
    private String salon;
    private Boolean smokingAllowed;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Integer getNumber() { return number; }
    public void setNumber(Integer number) { this.number = number; }
    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }
    public String getSalon() { return salon; }
    public void setSalon(String salon) { this.salon = salon; }
    public Boolean getSmokingAllowed() { return smokingAllowed; }
    public void setSmokingAllowed(Boolean smokingAllowed) { this.smokingAllowed = smokingAllowed; }
}
