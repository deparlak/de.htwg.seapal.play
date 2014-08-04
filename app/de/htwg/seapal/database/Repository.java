package de.htwg.seapal.database;

import play.libs.F.Promise;

public interface Repository<R, T> {
    
    Promise<R> create(T document, Options options);
    
    Promise<R> delete(T document, Options options);
    
    Promise<R> update(T document, Options options);
    
    Promise<R> query(Specification specification, Options options);
}
