package database.impl.mock.user;

import play.mvc.Result;

public class ResultMockUserRepository extends AbstractMockUserRepository<Result>{

    @Override
    protected Result success(String message) {
        return play.mvc.Controller.ok(message);
    }
    @Override
    protected Result failure(String message) {
        return play.mvc.Controller.ok(message);
    }

}
