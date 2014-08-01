package database.impl.mock.user;

public class StringMockUserRepository extends AbstractMockUserRepository<String>{

    @Override
    protected String success(String message) {
        return message;
    }

    @Override
    protected String failure(String message) {
        return message;
    }

}