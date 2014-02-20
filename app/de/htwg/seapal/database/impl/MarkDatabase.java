package de.htwg.seapal.database.impl;

import com.google.inject.Inject;
import com.google.inject.name.Named;
import de.htwg.seapal.database.IMarkDatabase;
import de.htwg.seapal.model.IMark;
import de.htwg.seapal.model.ModelDocument;
import de.htwg.seapal.model.impl.Mark;
import de.htwg.seapal.utils.logging.ILogger;
import org.ektorp.AttachmentInputStream;
import org.ektorp.CouchDbConnector;
import org.ektorp.CouchDbInstance;
import org.ektorp.DocumentNotFoundException;
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

public class MarkDatabase extends CouchDbRepositorySupport<Mark> implements
        IMarkDatabase {

    private final ILogger logger;
    private final StdCouchDbConnector connector;

    @Inject
    protected MarkDatabase(@Named("markCouchDbConnector") CouchDbConnector db, ILogger logger, CouchDbInstance dbInstance) {
        super(Mark.class, db, true);
        super.initStandardDesignDocument();
        this.logger = logger;
        connector = new StdCouchDbConnector(db.getDatabaseName(), dbInstance);
    }

    @Override
    public boolean open() {
        logger.info("MarkDatabase", "Database connection opened");
        return true;
    }

    @Override
    public UUID create() {
        return null;
    }

    @Override
    public boolean save(IMark data) {
        Mark entity = (Mark) data;

        if (entity.isNew()) {
            // ensure that the id is generated and revision is null for saving a new entity
            entity.setId(UUID.randomUUID().toString());
            entity.setRevision(null);
            add(entity);
            return true;
        }

        logger.info("MarkDatabase", "Updating entity with UUID: " + entity.getId());
        update(entity);
        return false;
    }

    @Override
    public IMark get(UUID id) {
        try {
            return get(id.toString());
        } catch (DocumentNotFoundException e) {
            return null;
        }
    }

    @Override
    public List<IMark> loadAll() {
        List<IMark> marks = new LinkedList<IMark>(getAll());
        logger.info("MarkDatabase", "Loaded entities. Count: " + marks.size());
        return marks;
    }

    @Override
    public void delete(UUID id) {
        logger.info("MarkDatabase", "Removing entity with UUID: " + id.toString());
        remove((Mark) get(id));
    }

    @Override
    public boolean close() {
        return true;
    }

    @Override
    public List<? extends IMark> queryViews(final String viewName, final String key) {
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
    public boolean addPhoto(IMark mark, String contentType, File file) throws FileNotFoundException {
        AttachmentInputStream a = new AttachmentInputStream("photo", new FileInputStream(file), contentType);
        db.createAttachment(mark.getUUID().toString(), mark.getRevision(), a);
        return true;
    }

    @Override
    public InputStream getPhoto(UUID uuid) {
        return db.getAttachment(uuid.toString(), "photo");
    }
}
