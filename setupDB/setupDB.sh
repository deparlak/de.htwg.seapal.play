#!/bin/bash
HOST=localhost:5984
#USERNAME=pakohan
#PASSWORD=pakohan

curl -s -X DELETE http://$HOST/seapal_boat_db/
curl -s -X DELETE http://$HOST/seapal_mark_db/
curl -s -X DELETE http://$HOST/seapal_route_db/
curl -s -X DELETE http://$HOST/seapal_trip_db/
curl -s -X DELETE http://$HOST/seapal_waypoint_db/
curl -s -X DELETE http://$HOST/seapal_person_db/
curl -s -X DELETE http://$HOST/seapal_account_db/

curl -s -X PUT http://$HOST/seapal_boat_db/
curl -s -X PUT http://$HOST/seapal_mark_db/
curl -s -X PUT http://$HOST/seapal_route_db/
curl -s -X PUT http://$HOST/seapal_trip_db/
curl -s -X PUT http://$HOST/seapal_waypoint_db/
curl -s -X PUT http://$HOST/seapal_person_db/
curl -s -X PUT http://$HOST/seapal_account_db/

curl -s -X PUT http://$HOST/seapal_boat_db/_design/Boat -d @boat.json
curl -s -X PUT http://$HOST/seapal_mark_db/_design/Mark -d @mark.json
curl -s -X PUT http://$HOST/seapal_route_db/_design/Route -d @route.json
curl -s -X PUT http://$HOST/seapal_trip_db/_design/Trip -d @trips.json
curl -s -X PUT http://$HOST/seapal_waypoint_db/_design/Waypoint -d @waypoint.json
curl -s -X PUT http://$HOST/seapal_person_db/_design/Person -d @person.json
curl -s -X PUT http://$HOST/seapal_account_db/_design/Account -d @account.json
