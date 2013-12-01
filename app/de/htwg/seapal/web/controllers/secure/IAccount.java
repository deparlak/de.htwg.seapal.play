package de.htwg.seapal.web.controllers.secure;

import de.htwg.seapal.model.IModel;

import java.util.List;
import java.util.UUID;

public interface IAccount
        extends IModel {

    String getAccountName();

    void setAccountName(String email);

    String getAccountPassword();

    void setAccountPassword(String password);

    List<UUID> getBoats();

    void setBoats(List<UUID> boats);

    boolean hasBoat(UUID uuid);

    void addBoat(final UUID uuid);

    void deleteBoat(UUID id);
}
