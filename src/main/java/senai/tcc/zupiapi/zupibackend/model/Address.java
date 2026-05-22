package senai.tcc.zupiapi.zupibackend.model;

import jakarta.persistence.Embeddable;

@Embeddable
public class Address {
    private String cep;
    private String street;
    private String number;
    private String neighborhood;
    private String state;
    private String country;

    // getters e setters
    public String getCep() { return cep; }
    public void setCep(String cep) { this.cep = cep; }

    public String getStreet() { return street; }
    public void setStreet(String street) { this.street = street; }

    public String getNumber() { return number; }
    public void setNumber(String number) { this.number = number; }

    public String getNeighborhood() { return neighborhood; }
    public void setNeighborhood(String neighborhood) { this.neighborhood = neighborhood; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    @Override
    public String toString() {
        return street + ", " + number + " - " + neighborhood + ", " + state + ", " + country + ", CEP: " + cep;
    }
}