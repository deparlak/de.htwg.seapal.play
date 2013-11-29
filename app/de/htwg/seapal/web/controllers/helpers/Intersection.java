package de.htwg.seapal.web.controllers.helpers;

import de.htwg.seapal.model.IModel;

import java.util.Collection;
import java.util.LinkedList;
import java.util.List;
import java.util.UUID;

public final class Intersection<T extends IModel> {

    final Collection<T> set;

    public Intersection(Collection<T> set) {
        this.set = set;
    }

    public final List<T> select(final Collection<UUID> set1) {
        final List<T> target = new LinkedList<>();

        for (T part : set) {
            if (set1.contains(part.getUUID())) {
                target.add(part);
            }
        }

        return target;
    }
}
