package de.htwg.seapal.web.models;

public class Logbook {
	
	private String initialTripId;
	
	public Logbook(String initialTripId) {
		this.initialTripId = initialTripId;
	}
	

	public String getInitialTripId() {
		return initialTripId;
	}

	public void setInitialTripId(String initialTripId) {
		this.initialTripId = initialTripId;
	}
	
	

}
