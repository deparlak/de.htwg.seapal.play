package de.htwg.seapal.database.impl;

import com.google.inject.Inject;
import com.google.inject.name.Named;
import de.htwg.seapal.database.IRaceDatabase;
import de.htwg.seapal.model.ModelDocument;
import de.htwg.seapal.model._IRace;
import de.htwg.seapal.model.impl._Race;
import de.htwg.seapal.utils.logging.ILogger;
import org.ektorp.CouchDbConnector;
import org.ektorp.CouchDbInstance;
import org.ektorp.DocumentNotFoundException;
import org.ektorp.impl.StdCouchDbConnector;
import org.ektorp.support.CouchDbRepositorySupport;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.UUID;

public class RaceDatabase extends CouchDbRepositorySupport<_Race> implements IRaceDatabase {

	private final ILogger logger;
    private final StdCouchDbConnector connector;

    @Inject
	protected RaceDatabase(@Named("raceCouchDbConnector") CouchDbConnector db, ILogger logger, CouchDbInstance dbInstance) {
		super(_Race.class, db, true);
		super.initStandardDesignDocument();
		this.logger = logger;
        connector = new StdCouchDbConnector(db.getDatabaseName(), dbInstance);
    }

	@Override
	public boolean open() {
		logger.info("RaceDatabase", "Database connection opened");
		return true;
	}

	@Override
	public UUID create() {
		return null;
	}

	@Override
	public boolean save(_IRace data) {
		_Race entity = (_Race)data;

		if (entity.isNew()) {
			// ensure that the id is generated and revision is null for saving a new entity
			entity.setId(UUID.randomUUID().toString());
			entity.setRevision(null);
			add(entity);
			return true;
		}

		update(entity);
		return false;
	}

	@Override
	public _IRace get(UUID id) {
        try {
            return get(id.toString());
        } catch (DocumentNotFoundException e) {
            return null;
        }
    }

	@Override
	public List<_IRace> loadAll() {
		List<_IRace> races = new LinkedList<_IRace>(getAll());
		logger.info("RaceDatabase", "Loaded entities. Count: " + races.size());
		return races;
	}

	@Override
	public void delete(UUID id) {
		logger.info("RaceDatabase", "Removing entity with UUID: " + id.toString());
		remove((_Race)get(id));
	}

	@Override
	public boolean close() {
		return true;
	}
    @Override
    public List<? extends _IRace> queryViews(final String viewName, final String key) {
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
}
