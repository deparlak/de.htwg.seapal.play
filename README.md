#Preconditions.
- [typesafe Activator](https://typesafe.com/platform/getstarted)
- sbt launcher version 0.13.0
- Java 1.8.0
- [Sync Gateway 1.0.2-9](http://www.couchbase.com/nosql-databases/downloads)

#Description
This is the Webserver for Seapal. It displays some information about seapal and provide
a WebApp.
The WebApp can be reached under localhost:9000/app

#Configuration
Before you can start, you have to start the sync Gateway with the following [configuration](https://github.com/deparlak/de.htwg.seapal.play/blob/app/Sync%20Gateway/config.json)
Also make sure that the path to Sync Gateway is correctly set, so that the WebApp can use the
Sync Gateway. This should be done
by setting the variable **syncGatewayInterface** and **syncGatewayAdminInterface** to the correct URL in
[this file](https://github.com/deparlak/de.htwg.seapal.play/blob/app/app/de/htwg/seapal/web/global/module/TestModule.java)
The default URL is set to **http://localhost:4984/sync_gateway/** and **http://localhost:4985/sync_gateway/**.

If you like to see the feature for viewing all active users on the map,
you have to start an [Observer](https://github.com/deparlak/de.htwg.seapal.worker.trip.observer) and any number of 
[trip simulation bots](https://github.com/deparlak/de.htwg.seapal.worker.trip.simulator). Please note that
the Sync Gateway Configuration contain some Test User Accounts which are required for the Bot Servers.
Also do not forget to login, because only a logged in user can see other users (localhost:9000/login). For the login we could
use the Account "test@test.de" with the Password "12345678".
If you like to use a Couchbase Server Backend you should enter the server address into the Sync Gateway Configuration, instead
of using walrus. This is especially necessary if you use an Observer which uses the View Mechanism. Read more about the Observer
[here](https://github.com/deparlak/de.htwg.seapal.worker.trip.observer).

The document handling on the client side can be found [here](https://github.com/deparlak/de.htwg.seapal.play/blob/app/public/js/app/isLoggedIn.js)
To display the boats on the map, we use the [MarkerClustererPlus for Google Maps V3 library](http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerclusterer/docs/examples.html).
The MarkerClustererPlus lib will be used in [this](https://github.com/deparlak/de.htwg.seapal.play/blob/app/public/lib/boatCluster.js) file.

#Execute
To run the application you should start a command line and switch to the root folder
of the project.
Before you start, make sure that the Sync Gateway is running with [this](https://github.com/deparlak/de.htwg.seapal.play/blob/app/Sync%20Gateway/config.json) configuration.
``` 
# run the project
activator run
# if you like to use the activator web developer tool
activator ui
```