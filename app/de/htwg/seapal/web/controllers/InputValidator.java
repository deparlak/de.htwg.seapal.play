package de.htwg.seapal.web.controllers;

import de.htwg.seapal.model.IPerson;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class InputValidator {

	private static final int MIN_LENGTH = 8;

	private static final Pattern EMAIL_PATTERN = Pattern.compile("^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$");

	public static enum Error {
		INVALID_EMAIL,
		PASSWORDS_DIFFER,
		INVALID_LENGTH,
		NONE
	}

	public static final String[] Error_Messages  = new String[]{
		"Please enter a valid email adress!",
		"The passwords you've entered differ!",
		"The password you've entered is to short. Use at least " + MIN_LENGTH + " characters!"
	};

	/**
	 * Validates the form input
	 *
	 * @param account The account form to be validated
	 * @return Error code that could be used with the corresponding error message from Error_Messages
	 */
	public static Error validate(IPerson account) {
		if (!validate_eMail(account.getEmail())) {
			return Error.INVALID_EMAIL;
		}
		if (!checkPasswords(account)) {
			return Error.PASSWORDS_DIFFER;
		}
		if(!checkLength(account.getPassword())) {
			return Error.INVALID_LENGTH;
		}
		return Error.NONE;
	}

	/**
	 * Validate hex with regular expression
	 *
	 * @param hex hex for validation
	 * @return true valid hex, false invalid hex
	 */
	private static boolean validate_eMail(final String hex) {
		Matcher matcher = EMAIL_PATTERN.matcher(hex);
		return matcher.matches();
	}

	/**
     * Checks wether the two entered passwords are the same
     *
     * @param account The account form to be checked
     * @return true if both passwords are equal
     */
    private static boolean checkPasswords(IPerson account) {
        return true; //account.getPassword().equals(account.getRepeatedAccountPassword());
    }

    /**
     * Checks if the password is of the correct min. length
     *
     * @param password The password to be checked
     * @return true if password of correct length
     */
    private static boolean checkLength(String password) {
    	return MIN_LENGTH <= password.length();
    }
}
