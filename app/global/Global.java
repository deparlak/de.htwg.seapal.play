package global;

import java.lang.reflect.Method;

import com.google.inject.AbstractModule;
import com.google.inject.Guice;

import play.Logger;
import play.Application;
import play.GlobalSettings;
import play.Logger.ALogger;
import play.Play;
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
    	String module = Play.application().configuration().getString("global.module");
    	return Guice.createInjector((loadModule(module))).getInstance(controllerClass);
    }

    @Override
    public void onStart(Application app) {
    	logger.info("Application has started");
    }

    @Override
    public void onStop(Application app) {
    	logger.info("Application has stopped");
    }

	private AbstractModule loadModule(String path) {
		try {
			AbstractModule module = (AbstractModule) Class.forName(path).newInstance();
			logger.info("Loaded module : "+path);
			return module;
		} catch (InstantiationException | IllegalAccessException | ClassNotFoundException e1) {
			logger.info("Loaded default module : global.module.DefaultModule");
			return new global.module.DefaultModule();
		}
    }
}
