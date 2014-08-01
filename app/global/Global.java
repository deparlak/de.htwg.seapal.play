package global;

import java.lang.reflect.Method;
import com.google.inject.Guice;

import play.Logger;
import play.Application;
import play.GlobalSettings;
import play.Logger.ALogger;
import play.mvc.Action;
import play.mvc.Http.Request;

public class Global extends GlobalSettings {
    private final ALogger logger = Logger.of("logger");
     
    @Override
    @SuppressWarnings("rawtypes")
    public Action onRequest(Request request, Method method) {
        logger.info("method=" + request.method() + " uri=" + request.uri() + " remote-address=" + request.remoteAddress());
        return super.onRequest(request, method);
    }
    
    @Override
    public <A> A getControllerInstance(Class<A> controllerClass) throws Exception {
        logger.info("Inject Controller");
        return Guice.createInjector(new global.module.DefaultModule()).getInstance(controllerClass);
    }

    @Override
    public void onStart(Application app) {
        logger.info("Application has started");
    }

    @Override
    public void onStop(Application app) {
        logger.info("Application has stopped");
    }
}
