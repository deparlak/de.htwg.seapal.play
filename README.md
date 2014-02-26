# Seapal Setup

1. clone ```https://github.com/pakohan/de.htwg.seapal.play.git```
2. start your couchDB and change username and password in ```app.de.htwg.seapal.database.module.SeapalBaseTestModule.java``` to your couchDB username and password.
3. run the setup script ```setupDB.sh``` in the Folder ```setupDB```.
4. now you can run the play project and access it with your web browser via ```localhost:9000```

# Documentation

This documentation is an addition to the javadoc in the important classes.

## Special classes in the web project

These classes are important for the logic of the play project.

### de.htwg.seapal.web.controllers.MainAPI

This class is the main interface between the REST client, e.g. the browser and the core library. This class handles everything which is web specific, such as HTTP requests, the bodies of them and cookies. It is used as a layer for everything HTTP specific, so the core library does not depend on the HTTP protocol or JSON. This means it is very lightweight. For example, retrieving a document makes use of cookies to check if the logged in user is authorized to view a certain document. A typical request for a document works this way:

1. retrieve UUID of the requested document and the type from the request parameters. ```/api/mark/123``` retrieves the **mark** with the id **123**.
2. retrieve the UUID of the currently logged in user. This will be used to check, if the logged in user is authorized to see the document.
3. pass the **type**, the **id** and the **users uuid** to the core library.
4. it returns the document as type IModel or ModelDocument (the super classes for all the documents saved in the database) or nothing, if the document does not exist, the user isn't able to see it or another error happened.
5. the MainAPI again converts the Java Object to a JSON document and sends it to the client.

### de.htwg.seapal.web.controllers.AccountAPI

This class handles everything which has to do with user management, such as signup, login, password reset on the play side.

## Special classes in the core project

These classes are important for the logic of the core library.

### de.htwg.seapal.controller.impl.MainController

This class is the main controller class and handles the access to the database layer. Here all the logic takes place for retrieving the documents, creating or updating them. Further information can be found in the javadoc.

### de.htwg.seapal.controller.impl.AccountController

This class handles everything which has to do with user management, such as signup, login, password reset. It retrieves the information needed from play.

### de.htwg.seapal.model.impl.Account

The account object represents the account info to be saved as json document in couchdb and contains all the information the user might be able to see (friendlists and email adress, but not password, token and googleID). this information is not able to be edited directly by the user. he cannot send friend requests by POSTing a new account document but by using the route for it because all the actions changing the account document have side effects to other documents (such as sending mails or changing the account object of an user who receives the friend request.

### de.htwg.seapal.model.impl.SignupAccount

This class represents the POST data of the signup form. it won't be saved as it is, but it is needed to parse the information out of the request the user sends, when he hits "Signup" with a filled form. After the JSON object is parsed, the controller creates the Account object out of the SignupAccount object, hashes the password and saves the Account object.

### de.htwg.seapal.model.impl.PublicPerson

This document is used to exctract the information a user is able to see from an account object. Every account has its account object, containing all the data the user isn't able to change directly (see doc in Account.java). The class PublicPerson represents the JSON object to be sent to the user, such as friend lists and email adress.

### de.htwg.seapal.model.impl.Person
This class just contains all the public data of a users profile the user is able to change directly.