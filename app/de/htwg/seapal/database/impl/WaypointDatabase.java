package de.htwg.seapal.database.impl;

import com.google.inject.Inject;
import com.google.inject.name.Named;

import de.htwg.seapal.database.IWaypointDatabase;
import de.htwg.seapal.model.IWaypoint;
import de.htwg.seapal.model.ModelDocument;
import de.htwg.seapal.model.impl.Waypoint;
import de.htwg.seapal.utils.logging.ILogger;

import org.ektorp.AttachmentInputStream;
import org.ektorp.CouchDbConnector;
import org.ektorp.CouchDbInstance;
import org.ektorp.DocumentNotFoundException;
import org.ektorp.ViewQuery;
import org.ektorp.ViewResult;
import org.ektorp.ViewResult.Row;
import org.ektorp.impl.StdCouchDbConnector;
import org.ektorp.support.CouchDbRepositorySupport;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.UUID;

public class WaypointDatabase extends CouchDbRepositorySupport<Waypoint> implements IWaypointDatabase {

	private final ILogger logger;
	private final StdCouchDbConnector connector;


	public static class WaypointPictureBean {
		private String waypointId;
		private String thumbPicture;

		public String getWaypointId() {
			return waypointId;
		}
		public void setWaypointId(String waypointId) {
			this.waypointId = waypointId;
		}
		/**
		 * Returns the thumb image data in the form "data:image/jpg;base64,[binaryData]"
		 * to be set as img-Tag directly.
		 */
		public String getThumbPicture() {
			return thumbPicture;
		}
		public void setThumbPicture(String thumbPicture) {
			this.thumbPicture = thumbPicture;
		}
	}

	@Inject
	protected WaypointDatabase(@Named("waypointCouchDbConnector") CouchDbConnector db, ILogger logger, CouchDbInstance dbInstance) {
		super(Waypoint.class, db, true);
		super.initStandardDesignDocument();
		this.logger = logger;
		connector = new StdCouchDbConnector(db.getDatabaseName(), dbInstance);
	}

	@Override
	public boolean open() {
		logger.info("WaypointDatabase", "Database connection opened");
		return true;
	}

	@Override
	public UUID create() {
		return null;
	}

	@Override
	public boolean save(IWaypoint data) {
		Waypoint entity = (Waypoint)data;

		if (entity.isNew()) {
			// ensure that the id is generated and revision is null for saving a new entity
			entity.setId(UUID.randomUUID().toString());
			entity.setRevision(null);
			add(entity);
			return true;
		}

		logger.info("WaypointDatabase", "Updating entity with UUID: " + entity.getId());
		update(entity);
		return false;
	}

	@Override
	public Waypoint get(UUID id) {
		try {
			return get(id.toString());
		} catch (DocumentNotFoundException e) {
			return null;
		}
	}

	@Override
	public List<IWaypoint> loadAll() {
		List<IWaypoint> waypoints = new LinkedList<IWaypoint>(getAll());
		logger.info("WaypointDatabase", "Loaded entities. Count: " + waypoints.size());
		return waypoints;
	}

	@Override
	public void delete(UUID id) {
		logger.info("WaypointDatabase", "Removing entity with UUID: " + id.toString());
		remove(get(id));
	}

	@Override
	public boolean close() {
		return true;
	}
	@Override
	public List<? extends IWaypoint> queryViews(final String viewName, final String key) {
		try {
			return super.queryView(viewName, key);
		} catch (DocumentNotFoundException e) {
			return new ArrayList<>();
		}
	}

	@Override
	public void create(ModelDocument doc) {
		connector.create(doc);
	}

	@Override
	public void update(ModelDocument document) {
		connector.update(document);
	}

	@Override
	public String addPhoto(IWaypoint mark, String contentType, File file) throws FileNotFoundException {
		AttachmentInputStream a = new AttachmentInputStream("photo", new FileInputStream(file), contentType);
		return db.createAttachment(mark.getUUID().toString(), mark.getRevision(), a);
	}

	@Override
	public InputStream getPhoto(UUID uuid) {
		return db.getAttachment(uuid.toString(), "photo");
	}

	/**
	 * Gets all waypoints of a trip which have a picture assigned.
	 * Returns a list of JSON objects of the form {waypointId, thumbImage}.
	 * thumbImage is of the form "data:image/jpg;base64,[binaryData]" for direct use as src of image tags.
	 * @param startIndex Number of entries to skip before returning the values.
	 * @author Lukas
	 */
	public List<WaypointPictureBean> getPhotosByTripId(UUID tripId, int startIndex, int count) {
		// the pictures view contains entries of the form   (tripID  ->  {wayPointId: ..., thumbImage: ...})
		// for all waypoints which have a picture assigned
		ViewQuery query = new ViewQuery()
		.designDocId("_design/Waypoint")
		.viewName("pictures")
		.key(tripId.toString())
		.skip(startIndex)
		.limit(count);

		return connector.queryView(query, WaypointPictureBean.class);
	}

	/**
	 * Gets the waypoints objects of a trip.
	 * @param startIndex Number of entries to skip before returning the values.
	 * @author Lukas
	 */
	public List<? extends IWaypoint> getWaypointsByTripId(UUID tripId, int startIndex, int count) {
		ViewQuery query = new ViewQuery()
		.designDocId("_design/Waypoint")
		.viewName("byTrip")
		.startKey(tripId.toString())
		.endKey(tripId.toString() + "\ufff0")  // append high unicode character for string ranges, see http://wiki.apache.org/couchdb/View_collation
		.skip(startIndex)
		.limit(count);

		return connector.queryView(query, Waypoint.class);
	}
	
	/**
	 * Returns all waypoints of the specified trip. Note that not all properties get initialized!
	 * @author Lukas
	 */
	public List<? extends IWaypoint> getAllWaypointsOfTrip(UUID tripId) {
		ViewQuery query = new ViewQuery()
		.designDocId("_design/Waypoint")
		.viewName("byTripMinimalData")
		.startKey(tripId.toString())
		.endKey(tripId.toString() + "\ufff0");  // append high unicode character for string ranges, see http://wiki.apache.org/couchdb/View_collation
		
		return connector.queryView(query, Waypoint.class);
	}

}
