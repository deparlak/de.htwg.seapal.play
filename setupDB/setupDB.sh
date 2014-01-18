#!/bin/bash
HOST=localhost:5984
USERNAME=pakohan
PASSWORD=pakohan

curl -X DELETE http://$USERNAME:$PASSWORD@$HOST/seapal_boat_db/
curl -X DELETE http://$USERNAME:$PASSWORD@$HOST/seapal_mark_db/
curl -X DELETE http://$USERNAME:$PASSWORD@$HOST/seapal_route_db/
curl -X DELETE http://$USERNAME:$PASSWORD@$HOST/seapal_trip_db/
curl -X DELETE http://$USERNAME:$PASSWORD@$HOST/seapal_waypoint_db/
curl -X DELETE http://$USERNAME:$PASSWORD@$HOST/seapal_person_db/

curl -X PUT http://$USERNAME:$PASSWORD@$HOST/seapal_boat_db/
curl -X PUT http://$USERNAME:$PASSWORD@$HOST/seapal_mark_db/
curl -X PUT http://$USERNAME:$PASSWORD@$HOST/seapal_route_db/
curl -X PUT http://$USERNAME:$PASSWORD@$HOST/seapal_trip_db/
curl -X PUT http://$USERNAME:$PASSWORD@$HOST/seapal_waypoint_db/
curl -X PUT http://$USERNAME:$PASSWORD@$HOST/seapal_person_db/

curl -X PUT http://$USERNAME:$PASSWORD@$HOST/seapal_boat_db/_design/Boat -d @boat.json
curl -X PUT http://$USERNAME:$PASSWORD@$HOST/seapal_mark_db/_design/Mark -d @mark.json
curl -X PUT http://$USERNAME:$PASSWORD@$HOST/seapal_route_db/_design/Route -d @route.json
curl -X PUT http://$USERNAME:$PASSWORD@$HOST/seapal_trip_db/_design/Trip -d @trips.json
curl -X PUT http://$USERNAME:$PASSWORD@$HOST/seapal_waypoint_db/_design/Waypoint -d @waypoint.json
curl -X PUT http://$USERNAME:$PASSWORD@$HOST/seapal_person_db/_design/Person -d @person.json
