@ECHO OFF
ECHO **********************************
ECHO Eclipse
ECHO **********************************
ECHO Eclipse right-click on the project and select Debug As, Debug Configurations
ECHO Right-click on Remote Java Application and select New
ECHO Change Port to 9999 and click Apply.
ECHO Click Debug with the previous setup Configuration
ECHO **********************************

activator -jvm-debug 9999 run
pause