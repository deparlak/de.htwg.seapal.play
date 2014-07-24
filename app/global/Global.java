package global;

import java.lang.reflect.Method;

import global.module.*;

import com.google.inject.Guice;
import com.google.inject.Injector;

import play.Logger;
import play.Application;
import play.GlobalSettings;
import play.Logger.ALogger;
import play.mvc.Action;
import play.mvc.Http.Request;

public class Global extends GlobalSettings {
    private final static Injector INJECTOR = createInjector();
    private final ALogger logger = Logger.of("logger");
    
    private static Injector createInjector() {
        return Guice.createInjector(new TestModule());
    }
     
    @Override
    @SuppressWarnings("rawtypes")
    public Action onRequest(Request request, Method method) {
    	System.out.println("Before every request");
    	logger.info("method=" + request.method() + " uri=" + request.uri() + " remote-address=" + request.remoteAddress());
        
    	return super.onRequest(request, method);
    }
    
    @Override
    public <A> A getControllerInstance(Class<A> controllerClass) throws Exception {
    	return INJECTOR.getInstance(controllerClass);
    }

    @Override
    public void onStart(Application app) {
    	app.configuration().getClass("my.thing");
    	Logger.info(value);
    	Logger.info("Application has started");
    }

    @Override
    public void onStop(Application app) {
    	logger.info("Application has stopped");
    }
}
