#!/bin/bash
HOST=localhost:5984
USERNAME=pakohan
PASSWORD=pakohan
curl -X PUT http://$USERNAME:$PASSWORD@$HOST/seapal_account_db/_design/Account -d '{"_id":"_design/Account", "_deleted":true}'
curl -X PUT http://$USERNAME:$PASSWORD@$HOST/seapal_boats_db/_design/Boat -d '{"_id":"_design/Boat", "_deleted":true}'
curl -X PUT http://$USERNAME:$PASSWORD@$HOST/seapal_mark_db/_design/Mark -d '{"_id":"_design/Mark", "_deleted":true}'
curl -X PUT http://$USERNAME:$PASSWORD@$HOST/seapal_route_db/_design/Route -d '{"_id":"_design/Route", "_deleted":true}'
curl -X PUT http://$USERNAME:$PASSWORD@$HOST/seapal_trips_db/_design/Trips -d '{"_id":"_design/Trips", "_deleted":true}'
curl -X PUT http://$USERNAME:$PASSWORD@$HOST/seapal_waypoint_db/_design/Waypoint -d '{"_id":"_design/Waypoint", "_deleted":true}'
#curl -X PUT http://$USERNAME:$PASSWORD@$HOST/seapal_person_db/_design/Person -d '{"_id":"_design/Person", "_deleted":true}'

curl -X PUT http://$USERNAME:$PASSWORD@$HOST/seapal_account_db/_design/Account -d @account.json
curl -X PUT http://$USERNAME:$PASSWORD@$HOST/seapal_boats_db/_design/Boat -d @boat.json
curl -X PUT http://$USERNAME:$PASSWORD@$HOST/seapal_mark_db/_design/Mark -d @mark.json
curl -X PUT http://$USERNAME:$PASSWORD@$HOST/seapal_route_db/_design/Route -d @route.json
curl -X PUT http://$USERNAME:$PASSWORD@$HOST/seapal_trips_db/_design/Trips -d @trips.json
curl -X PUT http://$USERNAME:$PASSWORD@$HOST/seapal_waypoint_db/_design/Waypoint -d @waypoint.json
#curl -X PUT http://$USERNAME:$PASSWORD@$HOST/seapal_person_db/_design/Person -d @person.json

