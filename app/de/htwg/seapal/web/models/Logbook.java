package de.htwg.seapal.web.models;

public class Logbook {
	
	private String initialTripId;
	private String boatId;
	

	public Logbook(String initialTripId, String boatId) {
		this.setInitialTripId(initialTripId);
		this.setBoatId(boatId);
	}
	
	
	public String getBoatId() {
		return boatId;
	}

	public void setBoatId(String boatId) {
		this.boatId = boatId;
	}

	public String getInitialTripId() {
		return initialTripId;
	}

	public void setInitialTripId(String initialTripId) {
		this.initialTripId = initialTripId;
	}
	
	

}
