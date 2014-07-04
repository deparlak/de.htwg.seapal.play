package de.htwg.seapal.web.models;

/**
 * Stores the parameters for a call to ISimulator.generateTrip()
 * @author Lukas
 *
 */
public final class TripGeneratorArgs {
	
	private String routeFile;
	private int waypointCount = 10;
	private String notesFile;
	private String picturesDir;
	private String thumbsDir;
	private int photoFactor = 30;
	private String boatId;
	
	public String getBoatId() {
		return boatId;
	}
	public void setBoatId(String boatId) {
		this.boatId = boatId;
	}
	
	/**
	 * Path of directory with smaller versions of the pictures in the "PicturesDir".
	 * The thumbnail pictures in this directory and the original pictures must have the same names.
	 */
	public String getThumbsDir() {
		return thumbsDir;
	}
	public void setThumbsDir(String thumbsDir) {
		this.thumbsDir = thumbsDir;
	}
	
	/**
	 * Path of directory with pictures that are randomly added to waypoints of a generated trip.
	 */
	public String getPicturesDir() {
		return picturesDir;
	}
	public void setPicturesDir(String picturesDir) {
		this.picturesDir = picturesDir;
	}
	
	/**
	 * Path of a text file from which random lines are read and used as notes for waypoints of a trip.
	 */
	public String getNotesFile() {
		return notesFile;
	}
	public void setNotesFile(String notesFile) {
		this.notesFile = notesFile;
	}
	
	/**
	 * Path of a text file from which the base coordinates for the trip are read. One LNG,LAT-tuple per line.
	 */
	public String getRouteFile() {
		return routeFile;
	}
	public void setRouteFile(String routeFile) {
		this.routeFile = routeFile;
	}
	
	/**
	 * Chance of uploading a photo on a waypoint of the trip (0 = take no photos, 100 = japanese tourist).
	 */
	public int getPhotoFactor() {
		return photoFactor;
	}
	public void setPhotoFactor(int photoFactor) {
		this.photoFactor = photoFactor;
	}
	
	/**
	 * Total number of waypoints to be generated for the trip.
	 */
	public int getWaypointCount() {
		return waypointCount;
	}
	public void setWaypointCount(int waypointCount) {
		this.waypointCount = waypointCount;
	}
	
}
