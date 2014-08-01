package database;


public class SessionOptions implements Options {
    private String username;
    
    
    @Override
    public void setUsername(String username) {
        this.username = username;
    }

    @Override
    public String getUsername() {
        return username;
    }

}
