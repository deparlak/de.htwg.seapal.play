package de.htwg.seapal.database.impl;

import com.google.inject.Inject;
import com.google.inject.name.Named;

import de.htwg.seapal.database.ITripDatabase;
import de.htwg.seapal.model.ITrip;
import de.htwg.seapal.model.ModelDocument;
import de.htwg.seapal.model.impl.Trip;
import de.htwg.seapal.utils.logging.ILogger;

import org.ektorp.CouchDbConnector;
import org.ektorp.CouchDbInstance;
import org.ektorp.DocumentNotFoundException;
import org.ektorp.ViewQuery;
import org.ektorp.impl.StdCouchDbConnector;
import org.ektorp.support.CouchDbRepositorySupport;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.UUID;


public class TripDatabase extends CouchDbRepositorySupport<Trip> implements ITripDatabase {

	private final ILogger logger;
	private final StdCouchDbConnector connector;

	@Inject
	protected TripDatabase(@Named("tripCouchDbConnector") CouchDbConnector db, ILogger logger, CouchDbInstance dbInstance) {
		super(Trip.class, db, true);
		super.initStandardDesignDocument();
		this.logger = logger;
		connector = new StdCouchDbConnector(db.getDatabaseName(), dbInstance);
	}

	@Override
	public boolean open() {
		logger.info("TripDatabase", "Database connection opened");
		return true;
	}

	@Override
	public UUID create() {
		return null;
	}

	@Override
	public boolean save(ITrip data) {
		Trip entity = (Trip)data;

		if (entity.isNew()) {
			// ensure that the id is generated and revision is null for saving a new entity
			entity.setId(UUID.randomUUID().toString());
			entity.setRevision(null);
			add(entity);
			return true;
		}

		logger.info("TripDatabase", "Updating entity with UUID: " + entity.getId());
		update(entity);
		return false;
	}

	@Override
	public ITrip get(UUID id) {
		try {
			return get(id.toString());
		} catch (DocumentNotFoundException e) {
			return null;
		}
	}

	@Override
	public List<ITrip> loadAll() {
		List<ITrip> trips = new LinkedList<ITrip>(getAll());
		logger.info("TripDatabase", "Loaded entities. Count: " + trips.size());
		return trips;
	}

	@Override
	public void delete(UUID id) {
		logger.info("TripDatabase", "Removing entity with UUID: " + id.toString());
		remove((Trip)get(id));
	}

	@Override
	public boolean close() {
		return true;
	}
	@Override
	public List<? extends ITrip> queryViews(final String viewName, final String key) {
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

	/**
	 * Returns a set of trip objects for a boat ordered by the startDate.
	 * @param skip Number of items to skip before returning the results
	 */
	@Override
	public List<? extends ITrip> getTripsByBoat(String boatId, long startDate, int skip, int count, boolean descending) {
		String endKey = boatId; // (descending order)
		if (!descending) {
			endKey = endKey + "_\ufff0"; // append high unicode character to select a range (ascending order)
		}
		
		// view contains entries of     "{boat}_{startDate}"  -->  {tripObject}
		ViewQuery query = new ViewQuery();
		query
		.designDocId("_design/Trip")
		.viewName("byDate")
		.startKey(boatId + "_" + startDate)
		.endKey(endKey)  
		.skip(skip)
		.limit(count)
		.descending(descending);

		return db.queryView(query, Trip.class);
	}

	/**
	 * Returns all trips of the specified boat.
	 * Note that only the properties name, startDate, from and to are initialized.
	 */
	@Override
	public List<? extends ITrip> getTripsByBoatSlim(String boatId) {		
		ViewQuery query = new ViewQuery();
		query
		.designDocId("_design/Trip")
		.viewName("byDateMinimalData")
		.startKey(boatId)
		.endKey(boatId + "_\ufff0");  // append high unicode character to select a range

		return db.queryView(query, Trip.class);
	}
}
