package de.htwg.seapal.web.controllers.helpers;

import java.io.File;
import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.nio.file.NoSuchFileException;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Scanner;
import java.util.UUID;

import org.ektorp.util.Base64;

import com.google.inject.Inject;

import de.htwg.seapal.controller.IMainController;
import de.htwg.seapal.model.impl.Trip;
import de.htwg.seapal.model.impl.Waypoint;
import de.htwg.seapal.utils.logging.ILogger;
import de.htwg.seapal.web.models.TripGeneratorArgs;

/**
 * Provides methods for the generation of fake data - for test modules only.
 * @author Lukas
 *
 */
public class SimpleSimulator implements ISimulator {

	private final int millisecondsPerDay = 86400000;
	private String[] firstNames;
	private String[] lastNames;
	private String[] townNames;
	
	@Inject
	private IMainController controller;

	@Inject
	private ILogger logger;

	public SimpleSimulator() {
		String firstNameList = "Aaron,Abraham,Achaz,Achim,Adalbert,Adam,Adelbert,Adelfried,Adelhard,Adi,Adolf,Adolph,Adrian,Agilbert,Agilmar,Alban,Albert,Albin,Albrecht,Alex,Alexander,Alf,Alfhard,Alfinus,Alfons,Alfred,Alfried,Alhard,Allmar,Alois,Aloisius,Aloys,Aloysius,Alphonsus,Alrik,Altfried,Alwin,Amadeus,Ambros,Ambrosius,Andreas,Andree,Andy,Annik,Anrich,Ansbert,Anselm,Ansgar,Anton,Antonius,Arend,Aribert,Arist,Arkadius,Armin,Arnbert,Arnd,Arndt,Arne,Arnfred,Arnfried,Arnhart,Arnim,Arno,Arnold,Benno,Bernd,Berndt,Bernfried,Bernhard,Bernhardin,Bernhardt,Bernhart,Berni,Berno,Bernold,Bernulf,Bernward,Bert,Berthold,Berti,Bertin,Bertl,Bertold,Bertolt,Burkhard,Burkhardt,Burkhart,Cai,Neithard,Neithart,Nepomuk,Nick,Nicki,Nicky,Nico,Nicolas,Nicolaus,Niels,Niklas,Niklaus,Niko,Nikodem,Nikodemus,Nikolas,Nikolaus,Nils,Norbert,Nordfried,Norfried,Norman,Norwin,Notfried,Notker,Nunzius,Odilo,Olaf,Olf,Oliver,Olli,Ornulf,Ortfried,Ortmund,Pius,Quintus,Quirin,Raik,Raimar,Raimer,Raimond,Raimund,Rainald,Rainer,Rainhard,Rainhardt,Rainmund,Ralf,Ralph,Randolf,Randolph,Raphael,Ronny,Roselius,Rotger,Rothmund,Rouven,Ruben,Rudenz,Rudger,Rudi,Rudolf,Rudolph,Runald,Runfried,Rupert,Rupertus,Ruppert,Rupprecht,Ruprecht,Rutger,Ruthard,Silvio,Simon,Simpert,Sixtus,Sonnfried,Sonnhard,Sonnhardt,Stanislaus,Stefan,Steff,Tino,Titus,Tobias,Tom,Tommy,Toni,Tony,Toralf,Torben,Torge,Torsten,Traugott,Trauhard,Treufried,Treuhard,Treuhart,Tristan,Trudbert,Trutz,Udo,Ulf,Ulfried,Uli,Ulli,Ullrich,Ulrich,Ulvi,Ulwin,Uranius,Urban,Ursus,Utho,Uto,Utto,Utz,Uve,Uwe,Valentin,Valerian,Veit,Veith,Velten,Viktor,Vincenz,Vinzent,Vinzenz,Vitalis,Vitus,Wendemar,Wennemar,Wenzel,Werner,Wernfried,Wernhard,Wernher,Wichard,Wido,Wiegand,Wiegbert,Wieghart,Wieland,Wiethold,Wigand,Wolfdietrich,Wolfeckart,Wolff,Wolfgang,Wolfhard,Wolfhardt,Wolfhart,Wolfhelm,Wolfhermann,Wolfmar,Wolfram,Wolfrid,Wolfried,Wolrad,Wulf,Wulfhard,Wulfhardt,Wunibald,Wunnibald,Xaver,Xaverius,York,Zacharias,Zeno";
		String lastNameList = "Abel,Abele,Abels,Abraham,Abt,Achatz,Achenbach,Aigner,Alber,Albers,Albert,Albrecht,Alex,Alexander,Andersen,Andreas,Andres,Andresen,Anger,Angerer,Angermann,Anton,Apel,Appel,Appelt,Bähr,Baier,Baldauf,Baumgartner,Baumgärtner,Bäumler,Baur,Bausch,Bayer,Becher,Becht,Bechtelnger,Behrmann,Beier,Beil,Bell,Beller,Bellmann,Böhm,Böhme,Böhmer,Bohn,Bohne,Böhner,Bohnert,Böhnke,Bohr,Böhringer,Böker,Boldt,Boll,Borowski,Borrmann,Bosch,Bösch,Bracht,Buchmann,Buchner,Büchner,Buchwald,Buck,Bücker,Budde,Buhl,Bühler,Bühner,Buhr,Bülow,Bunge,Bünger,Bunk,Burg,Burger,Bürger,Burghardt,Burk,Burkard,Burkart,Burkert,Burkhard,Burkhardt,Burkhart,Degen,Degenhardt,Degner,Dehn,Deininger,Demir,Demmer,Demuth,Denecke,Dengler,Denk,Diedrich,Diefenbach,Diehl,Diekmann,Diel,Distler,Dittmann,Dittmar,Dittmer,Dittrich,Domke,Donath,Donner,Dörfler,Döring,Dorn,Ebert,Ebner,Eck,Eckardt,Eckart,Eckel,Emmert,Emrich,Ender,Enderle,Enders,Endres,Engel,Forstn,Frei,Freiberg,Freier,Freitag,Frenz,Frenzel,Frerichs,Frese,Freudenberg,Freund,Frey,Freyer,Freytag,Frick,Frühauf,Fuchs,Fuhr,Führer,Hölzl,Holzmann,Jung,Jungbluth,Junge,Jünger,Junghans,Jüngling,Kaluza,Keitel,Manz,Marek,Mark,Markert,Markgraf,Markmann,Marks,Markus,Marquardt,Marschall,Marschner,Marten,Martens,Martini,Radtke,Rahm,Rahn,Raith,Ramm,Ranft,Rank,Rapp,Reif,Reiff,Schott,Schöttler,Seubert,Siewert,Sigl,Stelzer,Stemmer,Stemmler,Stender,Stengel,Volkert,Völkl,Volkmann,Volkmer,Voll,Vollmer,Vollrath,Volz,Vorwerk,Vos,Zöllner";
		String townNameList = "Dresden,Warmsen,Marklohe,Balge,Wietzen,Liebenau,Binnen,Pennigsehl,Heemsen,Drakenburg,Haßbergen,Rohrsen,Landesbergen,Estorf,Husum,Leese,Steimbke,Linsburg,Rodewald,Stöckse,Stadthagen,Bückeburg,Obernkirchen,Nienstädt,Helpsen,Seggebruch,Hespe,Lindhorst,Beckedorf,Heuerßen,Lüdersfeld,Heeßen,Ahnsen,Buchholz,Luhden,Niedernwöhren,Lauenhagen,Meerbeck,Nordsehl,Pollhagen,Wiedensahl,Rinteln,Auetalringe,Aerzen,Emmerthal,Coppenbrügge,Hülsede,Lauenauenhausen,Enger,Spenge,Bünde,Kirchlengern,Rödinghausen,Lübbecke,Espelkampen,Minden,Petershagen,Hille,Löhne,Vlotho,Hüllhorst,Lemgo,Lügde,Barntrupold,Lage,Schieder-Schwalenberg,Blomberg,Augustdorf,Delbrück,Büren,Salzkotten,Hövelhof,Lichtenau,Borchen,Altenbeken,Schlangenarsewinkel,Herzebrock-Clarholz,LangenbergOerlinghausen,Leopoldshöhe,Werther,Borgholzhausen,Kassel,Guxhagen,Niedenstein,Naumburg,Espenau,Habichtswald,Söhrewald,Malsfeld,Morschen,Körle,Nieste,Staufenberg,Reinhardshagen,Hofgeismar,Immenhausen,Calden,Trendelburg,Grebenstein,Liebenau,Oberweser,Warburg,Marsberg,Borgentreich,Willebadessen,Wolfhagen,Volkmarsen,Diemelstadt,Twistetal,Breuna,Korbach,Waldeck,Vöhl,Diemelsee,Edertal,Fritzlar,Borken,Felsberg,Wabern,Knüllwald,Neuental,Schwalmstadt,Frielendorf,Neukirchen,Willingshausen,Gilserberg,Jesberg,Ottrau,Schrecksbach,Schwarzenborn,Marburg,Marburg,Marburg,Marburg,Gladenbach,Wetter,Ebsdorfergrund,Cölbe,Lahntal,Weimar,Burgwald,Lohra,Lichtenfels,Frankenau,Fronhausen,Münchhausen,Rosenthal,Biedenkopf,Dautphetal,Breidenbach,Steffenberg,Stadtallendorf,Kirchhain,Rauschenberg,Amöneburg,Wohratal,Grünberg,Gießen,Gießen,Hungen,Pohlheim,Buseck,Lich,Langgöns,Wettenberg,Linden,Biebertal,Reiskirchen,Heuchelheim,Lollar,Staufenberg,Fernwald,Rabenau,Solms,Aßlar,Braunfels,Hüttenberg,Ehringshausen,Lahnau,Leun,Schöffengrund,Hohenahr,Waldsolms,Dillenburg,Haiger,Eschenburg,Dietzhölztal,Angelburg,Herborn,Greifenstein,Mittenaar,Driedorf,Sinn,Breitscheid,Siegbach,Weilburg,Weilmünster,Löhnberg,Mengerskirchen,Weinbach,Künzell,Petersberg,Flieden,Schlitz,Ehrenberg,Hilders,Neuhof,Eichenzell,Gersfeld,Eiterfeld,Großenlüder,Tann,Hofbieber,Kalbach,Burghaun,Hosenfeld,Ebersburg,Nentershausen,Ronshausen,Cornberg,Ludwigsau,Niederaula,Kirchheim,Schenklengsfeld,Oberaula,Hauneck,Hohenroda,Neuenstein,Friedewald,Alsfeld,Schwalmtal,Kirtorf,Grebena,Theisseil,Weiden";
		firstNames = firstNameList.split(",");
		lastNames = lastNameList.split(",");
		townNames = townNameList.split(",");
	}
	
	/**
	 * Generates a random sailing trip based on data from the TripGeneratorArgs object.
	 * @param args 
	 * @param userId ID of the calling user account.
	 * @throws IOException Thrown on missing input files.
	 */
	@Override
	public void generateTrip(TripGeneratorArgs args, String userId) throws IOException {
		// load random input data from files
		List<Double> tripCoords = interpolateCoords(args, args.getWaypointCount());
		List<String> baseNotes = Files.readAllLines(Paths.get(args.getNotesFile()), Charset.defaultCharset());
		
		Trip trip = new Trip();
		trip.setMarks(tripCoords);
		trip.setId(UUID.randomUUID().toString());
		trip.setBoat(args.getBoatId());
		trip.setName("Trip " + new SimpleDateFormat("dd.MM.yyyy HH:mm:ss").format(new Date()));
		trip.setStartDate(new Date().getTime()); // 1396347664L + (long)(Math.random() * 2522880000L));  // random timestamp
		trip.setEndDate(trip.getStartDate() + (int)(Math.random() * millisecondsPerDay));
		trip.setSkipper(getRandomName());
		trip.setCrew(getRandomName());
		for (int i = 0; i < Math.random() * 10; i++) {  // add up to 10 crew members
			trip.setCrew(trip.getCrew() + ", " + getRandomName());
		}
		trip.setFrom(townNames[(int)(Math.random() * townNames.length)]);
		trip.setTo(townNames[(int)(Math.random() * townNames.length)]);
		trip.setNotes(baseNotes.get((int)(Math.random() * baseNotes.size())));  // select random note

		// get list of random pictures
		File picsDir = new File(args.getPicturesDir());
		File[] pictures = picsDir.listFiles();
		long lastTimestamp = trip.getStartDate();
		double baseTemperature = Math.random() * 25 + 10;
		double baseWindSpeed = Math.random() * 7;
		double baseWindDirection = Math.random() * 360;
		double baseWaveHeight = Math.random() * 3;

		// create waypoints
		for (int n = 0; n < args.getWaypointCount(); n ++) {
			Waypoint wp = new Waypoint();
			wp.set_id(UUID.randomUUID().toString());
			wp.setName("Waypoint " + (n + 1));
			wp.setTrip(trip.get_id());
			wp.setBoat(trip.getBoat());
			wp.setLat(tripCoords.get(2*n));
			wp.setLng(tripCoords.get(2*n + 1));
			wp.setCog(String.valueOf(Math.round(Math.random() * 360 * 100) / 100.0) + "°");  // round 0-360° to 2 decimal places
			wp.setSog(String.valueOf(Math.round(Math.random() * 10 * 100) / 100.0) + " kn");   // round 0-10 to 2 decimal places
			wp.setTempCelsius(baseTemperature + Math.random());
			wp.setWindDirection((baseWindDirection + Math.random() * 5) % 360.0);
			wp.setWindSpeedBeaufort(baseWindSpeed + Math.random());
			wp.setWavesHeight(baseWaveHeight + Math.random() * 0.3);
			wp.setAtmosPressure(950 + Math.random() * 100);
			wp.setCloudage(Math.random());
			wp.setHumidity(Math.random());
			
			long nextDate = lastTimestamp + (long)(Math.random() * 89 + 1) * 60 * 1000;  // random time offset from 1-90 min in milliseconds
			wp.setDate(trip.getStartDate() + nextDate);   // in milliseconds!
			lastTimestamp = nextDate;
			wp.setNote(baseNotes.get((int)(Math.random() * baseNotes.size())));  // select random note

			// sometimes upload a photo
			int pictureIndex = -1;
			if (Math.random() * 100 > (100 - args.getPhotoFactor())) {
				pictureIndex = (int)(Math.random() * pictures.length);
				File picture = pictures[pictureIndex];
				try {
					byte[] thumbData = Files.readAllBytes(Paths.get(args.getThumbsDir(), picture.getName()));
					String thumbEncoded = "data:image/jpg;base64," + Base64.encodeBytes(thumbData);
					wp.setImage_thumb(thumbEncoded);
				} catch (NoSuchFileException e) {
					logger.error("", "Could not find " + picture.getAbsolutePath());
				}
			}

			// must be executed after wp.setImage_thumb:
			controller.creatDocument("waypoint", wp, userId);
			if (pictureIndex != -1) {
				controller.addPhoto(userId, wp.getUUID(), "image/jpg", pictures[pictureIndex], "waypoint");
			}
		}
		controller.creatDocument("trip", trip, userId);

	}
 
	private List<Double> interpolateCoords(TripGeneratorArgs args, int numPoints) throws IOException {
		List<Double> baseCoords = new ArrayList<Double>();
		List<Double> tripCoords = new ArrayList<Double>();
		// read base coordinates from file
		Scanner scanner = new Scanner(new File(args.getRouteFile()));
		while (scanner.hasNextLine()) {
			String[] lineParts = scanner.nextLine().split(",");
			baseCoords.add(Double.valueOf(lineParts[0]));  // Latitude
			baseCoords.add(Double.valueOf(lineParts[1]));  // Longitude
		}
		scanner.close();

		// base coordinate for interpolated points:
		int startIndex = 0;
		// number of interpolated points after which the next base coordinate is used:
		int interpolatesPerStep = (int)(numPoints / (baseCoords.size() / 2));  
		interpolatesPerStep = Math.max(1, interpolatesPerStep) + 2 ;

		while (tripCoords.size() < 2*numPoints) {
			double dx = baseCoords.get(startIndex + 2) - baseCoords.get(startIndex);  // linear interpolation
			double dy = baseCoords.get(startIndex + 3) - baseCoords.get(startIndex + 1);
			dx = dx / interpolatesPerStep;
			dy = dy / interpolatesPerStep;
			for (int i = 0; i < interpolatesPerStep; i++) {
				double lat = baseCoords.get(startIndex) + i * dx;
				double lng = baseCoords.get(startIndex + 1) + i * dy;
				// apply random translation to the point
				lat = lat + lat * (Math.random() * 0.001 - 0.0005);  // +-  0.5% 
				lng = lng + lng * (Math.random() * 0.001 - 0.0005);  // +-  0.5% 

				tripCoords.add(lat);
				tripCoords.add(lng);
			}
			startIndex += 2;  // move to next linear section of the trip's path
		}

		return tripCoords.subList(0, 2 * numPoints);  // clipping to requested size

	}

	private String getRandomName() {
		return firstNames[(int)(Math.random() * firstNames.length)] + " " + lastNames[(int)(Math.random() * lastNames.length)];
	}
	
}
