package de.htwg.seapal.utils.logger.iml;

import play.Logger;

import de.htwg.seapal.utils.logging.ILogger;

public class WebLogger implements ILogger {

	private static final String LOG_FORMAT = "[%s]: %s";

    private static String getLineNumber() {
        Exception e = new Exception();
        StackTraceElement s = e.getStackTrace()[2];
        return String.format("%s.%s, %d", s.getClassName(), s.getMethodName(), s.getLineNumber());
    }


    @Override
	public void error(String tag, String msg) {
        System.out.printf("E (%s): <%s> <%s>%n", getLineNumber(), tag, msg);
    }

    @Override
    public void exc(Exception e) {
        Exception exception = new Exception();
        Logger.error(String.format("Error in %s%n", exception.getStackTrace()[1]), e);
    }

    @Override
	public void info(String tag, String msg) {
        System.out.printf("I (%s): <%s> <%s>%n", getLineNumber(), tag, msg);
    }

	@Override
	public void warn(String tag, String msg) {
        System.out.printf("W (%s): <%s> <%s>%n", getLineNumber(), tag, msg);
    }
}
