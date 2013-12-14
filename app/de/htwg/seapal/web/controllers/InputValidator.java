package de.htwg.seapal.web.controllers;
 
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import de.htwg.seapal.web.controllers.secure.IAccount;
 
public class InputValidator {
 
	private static final String EMAIL_PATTERN = 
		"^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@"
		+ "[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$";
 
	/**
	 * Validate hex with regular expression
	 * 
	 * @param hex hex for validation
	 * @return true valid hex, false invalid hex
	 */
	public static boolean validate(final String hex) {
 		Pattern pattern = Pattern.compile(EMAIL_PATTERN);
		Matcher matcher = pattern.matcher(hex);
		return matcher.matches(); 
	}

	/**
     * Checks wether the two entered passwords are the same
     * 
     * @param account The account form to be checked
     * @return true if both passwords are equal
     */
    public static boolean checkPasswords(IAccount account) {
        return account.getAccountPassword().equals(account.getRepeatedAccountPassword());
    }
}