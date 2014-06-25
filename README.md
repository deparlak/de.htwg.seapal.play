
#SEAPAL WEB APP


This document describe the structure of the Web  APP of SeaPal.
The frontend has two parts: the "app" which is used for tracking sailing trips,
and a "logbook" which can be used to present a trip in a blog-like format that 
can be shown to friends.

The backend is realized using Java and the Play Framework and makes use of 
CouchDB as database system. The classes which are shared with the native
Android App (closed source) are located in a separate Seapal.Core project,
these are mainly the model classes, non-web-related controllers and the DAO interfaces.   
The core project can be found at https://github.com/lukaseckert2/de.htwg.seapal.core.

For testing purposes we use a free CouchDb instance at  
https://seapaldev.couchappy.com/_utils/  (The admin credentials will be provided by Prof. Boger)
 

###1. The basic file structure

- app : Contains the backend code (controllers, views, DB implementations, ...) .

- conf : PLAY configuration like the routes of the server.

- lib : The static libraries which will be used by PLAY. Here is also the Sepal Core library "de.htwg.seapal.core-1.1-SNAPSHOT.jar" stored. This file has to be replaced manually to update to a new core revision.

- project : Build specific settings for PLAY with SBT like the dependencies.

- public : Public browser stuff like stylesheets, css, javascript, images...
    - js
        - app : app specific javascript files
            - callbacks : callbacks which are sorted by map, menubar and toolsbar.
        - homepage : homepage specific javascript files
        
    - lib : self-contained javsascript libaries

- setupDB :     Contains the definition of the databases (views, validate_doc_update,..) and
 a script (setupDb.sh) to clear existing databases and create new empty databases.
 Note that it is required to change the USERNAME and PASSWORD in setupDB.sh to the admin account of your CouchDB.  
 **Important**: When modifying the CouchDB views in the admin tool, do not forget to save the
 modified design document of the database in this directory!

###2. Setup the project

- Start your CouchDB if not using the test DB at couchappy.com.
- Change username and password in ```app.de.htwg.seapal.database.module.SeapalBaseTestModule.java``` 
  to your couchDB admin username and password.
- Change the password and username in ```setup.DB``` to your couchDB admin username and password.
- Run the setup script ```setupDB.sh``` in the folder ```setupDB```.
- Start the Play project with ```play run``` and you are ready to go.

###3. Server side controll flow

The server side stuff is stored under the 'app' folder. The reachable routes can be found in the 'conf\routes' file. 
The html is stored under 'de.htwg.seapal.play\app\de\htwg\seapal\web\views' where we divide into the homepage files 
stored in 'pageContent' and the app files stored in 'appContent'. 
The logbook pages are stored in 'logbookContent'.

###4. Client side controll flow  
  
**For the Logbook**  
The logbook has only one page, which is constructed from multiple view templates on the server side.
All trip-specific contents are loaded using AJAX and inserted into page at client side.  
This is achieved with the Handlebars javascript library which fills the HTML templates using the JSON objects
from the server. These templates (&lt;script&gt;-Tags with type "x-handlebars-template") are usually stored 
at the locations where their instances would be inserted.  
  
The API requests are encapsulated in a "logbookapi.js" script, and the page itself only has to provide the
callback functions that accept the trips, waypoints, ... that the server delivers.


**For the Tracking App**  
The main libraries for the client side control flow are the menubar (public/lib/menubar) and the seamap (public/lib/seamap).
In the 'file public/js/app/globals.js' we first create a new menubar for the menu of the app and another menubar for the
tools of the app. After that, we can use the global variables (menu and tools) to add callback functions which will 
be called if a leftclick or rightclick to an entry of a menu will be done. Therefore we create in the html
element of the menu entry a class which will be observed. E.g.

html file with a menu (also see app\de\htwg\seapal\web\views\app.scala.html where the menu is stored)
```
    <li><a class='menu-icon icon-selected-boat action' data-type='boat'>This is a selected Boat.</a></li>
    <li><a class='menu-icon icon-selected-person action' data-type='person'>This is a selected Person.</a></li>
```
javascript file
```
    menu.addCallback('leftclick', ['icon-slected-boat', 'icon-selected-person'], function (self) {
        console.log("leftclick on "+self.data('type'));
    });
    
    menu.addCallback('rightclick', ['icon-slected-boat', 'icon-selected-person'], function (self) {
        console.log("rightclick on "+self.data('type'));
    });
```
As we can see in our example above, we create two entries in a menu of our html file. The important thing is that the menu
entries has a class called 'action', which let the entry be observed by the menubar lib. We can add any other class we like, it doesn't matter if a class change the style of the menubar entry or not. In our javascipt we check if an menubar entry of the 'menu' ('menu' is a global variable in 'public/js/app/globals.js') was clicked. Note that a rightclick is the same as a longpress, so it also work on mobile devices. This is the basic mechanism to handle the menubars. Each callback for a menubar entry is defined in a javascript file stored in the 'public\js\app\callbacks' folder. So if you click for example on a track in the menu, a callback function will be fired which execute the required code (for example show the track on the map or open a modal to edit the track).
We also have to mention that the entries of the menus will be created dynamically with the Handlebars library. Handlebars will
also be used to render content (for example the information about a boat or mark) to the modals we use dynamically. Therefore we have created some helper functions for handlebars, stored in 'public\js\app\handlebarHelpers.js'.
For more information about handlebars goto http://handlebarsjs.com/.

When you study the code stored in the callbacks folder, you will notice that there are 

- menu.addCallback(..) for the callbacks of the menu (upper left corner of the app)
- tools.addCallback(..) for the callbacks of the tools (upper right corner of the app)

and 

- map.addCallback(..) for the callbacks of the map.

The map callbacks are not for any menu entries. In 'public/js/app/globals.js' we create the global 'map' variable, which is the handle of the seamap lib (public/lib/seamap). With the map handle we can trigger map specific actions e.g. map.startTracking() to start tracking
or map.set('boat', obj) to set a element (boat, trip, route, mark, waypoint).
To handle events there is also a callback mechanism implemented in the seamap lib. The available events can be get with map.getEvents(). So for example if you start tracking with map.startTracking() and there is no boat selected, a callback will be fired where the error message is stored in. If we create a new element, for examle a trip, we can use the map.getTemplate('trip') method, to get a new object. This new object has a id wich is set to null. If we like to store our new created element to the map using map.set('trip', obj), the seamap lib will detect that it is a new created object and fire some events. The events will than execute the functions which observe the events. In our example it would cause that the map.getEvents().SERVER_CREATE event will be fired, which upload the new created trip to our server.
 
The callback mechanism makes it easy to switch the GUI. For example we have added a callback for errors which occurr in seamap.js, so that we show a modal with output.error(..) on every ERROR in seamap.js. If you like to show another modal you can easily siwtch the callback without any changes to the seamap lib. It is also possible to call the same function on multiple events
```
    //on ERROR callback
    map.addCallback(events.ERROR, function (self) {
        output.error(self.msg);
    });

    //listen to multiple events
    map.addCallback([events.LEFT_SECURITY_CIRCLE, events.NO_GEO_SUPPORT], function (self) {
        output.error(self.msg);
    });
```
If we talk about the callbacks of the map, we also have to mention the two files:
- public\js\app\isLoggedIn.js
- public\js\app\isLoggedOut.js
Depending if a user is logged in or not, one of these files will be used (see app\de\htwg\seapal\web\views\appContent\header.scala.html).
If a user is logged in we load isLoggedIn.js. There we use the callback map.getEvents().SERVER_CREATE to upload our object to the server or delete a object with map.getEvents().SERVER_DELETE from the server. 
We also poll our friend list every minute, to show up incomming friend requests or new friends who acceppted our friend request.

If no user is logged in we load isLoggedOut.js. There we do not poll a friend list. We also do not upload anything to the server. In isLoggedOut.js we create some default data and simulate a server to give the user a nice experience for trying the app with no need to create an account.

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

## Replication

The following script starts a replication. It is just a prove of concept. It has to be started for every database (mark, trip, waypoint, etc.) and for every account (own account and every friend).

TODO: create database user, which is only allowed to read from the databases except the _users and the seapal_account_db databases. But how do we update documents from client to server?

```
#!/bin/bash
$USER=pakohan
$PASSWORD=pakohan
$SOURCE=141.70.111.17
$DATABASE=seapal_mark_db
$TARGET=127.0.0.1
$ACCOUNT_ID=123
curl -H 'Content-Type: application/json' -X POST http://$USER:$PASSWORD@$TARGET:5984/_replicate -d \
'{
    "source":"http://$USER:$PASSWORD@$SOURCE:5984/$DATABASE",
    "create_target":true,
    "continuous":true,
    "target":"http://$USER:$PASSWORD@$TARGET:5984/$DATABASE",
    "filter":"Mark/owner",
    "query_params": {
        "owner":"$ACCOUNT_ID"
    }
}'
```

### Team project SS14