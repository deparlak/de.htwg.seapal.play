package global.module;

import play.mvc.Result;

import com.google.inject.AbstractModule;
import com.google.inject.TypeLiteral;
import com.google.inject.name.Names;

import database.*;
import database.model.*;
import database.impl.mock.user.ResultMockUserRepository;

public class TestModule extends AbstractModule {

    @Override
    protected void configure() {
        // configure database configuration
        bind(new TypeLiteral<Repository<Result, User>>(){}).annotatedWith(Names.named("UserRepository")).to(ResultMockUserRepository.class);
        
//        bind(Integer.class).annotatedWith(Names.named("databasePort")).toInstance(80);
//        bind(String.class).annotatedWith(Names.named("databaseURL")).toInstance("http://roroettg.iriscouch.com");        
//        // Use an empty implementation of the test data generator in production mode
//        bind(ISimulator.class).to(SimpleSimulator.class);
//        bind(SimulationAPI.class).to(SimulationAPIFake.class).in(Singleton.class);
    }
}
