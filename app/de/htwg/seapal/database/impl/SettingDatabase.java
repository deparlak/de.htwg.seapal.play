package de.htwg.seapal.database.impl;

import com.google.inject.Inject;
import com.google.inject.name.Named;
import de.htwg.seapal.database.ISettingDatabase;
import de.htwg.seapal.model.ISetting;
import de.htwg.seapal.model.ModelDocument;
import de.htwg.seapal.model.impl.Setting;
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

public final class SettingDatabase extends CouchDbRepositorySupport<Setting> implements ISettingDatabase {
    private final ILogger logger;
    private final StdCouchDbConnector connector;

    @Inject
    protected SettingDatabase(@Named("settingCouchDbConnector") CouchDbConnector db, ILogger logger, CouchDbInstance dbInstance) {
        super(Setting.class, db, true);
        super.initStandardDesignDocument();
        this.logger = logger;
        connector = new StdCouchDbConnector(db.getDatabaseName(), dbInstance);
    }

    @Override
    public boolean open() {
        logger.info("SettingDatabase", "Database connection opened");
        return true;
    }

    @Override
    public UUID create() {
        return null;
    }

    @Override
    public boolean save(ISetting data) {
        Setting entity = (Setting) data;

        if (entity.isNew()) {
            // ensure that the id is generated and revision is null for saving a new entity
            entity.setId(UUID.randomUUID().toString());
            entity.setRevision(null);
            add(entity);
            return true;
        }

        logger.info("SettingDatabase", "Updating entity with UUID: " + entity.getId());
        update(entity);
        return false;
    }

    @Override
    public ISetting get(UUID id) {
        try {
            return get(id.toString());
        } catch (DocumentNotFoundException e) {
            return null;
        }
    }

    @Override
    public List<ISetting> loadAll() {
        List<ISetting> Settings = new LinkedList<ISetting>(getAll());
        logger.info("SettingDatabase", "Loaded entities. Count: " + Settings.size());
        return Settings;
    }

    @Override
    public void delete(UUID id) {
        logger.info("SettingDatabase", "Removing entity with UUID: " + id.toString());
        remove((Setting) get(id));
    }

    @Override
    public boolean close() {
        return true;
    }

    @Override
    public List<? extends ISetting> queryViews(final String viewName, final String key) {
        return super.queryView(viewName, key);
    }

    @Override
    public List<Setting> queryView(final String viewName, final String key) {
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
