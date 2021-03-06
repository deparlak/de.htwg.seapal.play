package de.htwg.seapal.model;

public class Account {
    private String password;
    private String email;
    private String firstName;
    private String lastName;
    
    public Account() {
        
    }
    
    public Account(Account document) {
        this.password = document.password;
        this.email = document.email;
        this.firstName = document.firstName;
        this.lastName = document.lastName;
    }
    public String getPassword() {
        return password;
    }
    public void setPassword(String password) {
        this.password = password;
    }
    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }
    public String getFirstName() {
        return firstName;
    }
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }
    public String getLastName() {
        return lastName;
    }
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
}
