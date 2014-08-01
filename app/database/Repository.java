package database;

import play.libs.F.Promise;

public interface Repository<R, T> {
    
    Promise<R> create(T document);
    
    Promise<R> delete(T document);
    
    Promise<R> update(T document);
    
    Promise<R> query(Specification specification);
}
