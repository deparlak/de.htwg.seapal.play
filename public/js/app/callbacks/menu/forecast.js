$(function() {
	$( "#chart_small" ).dialog({
		autoOpen: false,
		show: {
			effect: "blind",
			duration: 1000
		},
		hide: {
			effect: "explode",
			duration: 1000
		},
		height: 460,
		width: 850,
	});
});



var forecast = [];
var time_zone = 1000 * (new Date().getTimezoneOffset())*(-60);
var url = null;
var city = null;

function postData(position) {

	var lat = position.lat();
	var lng = position.lng();

	// url= "http://api.openweathermap.org/data/2.5/forecast?lat=47.662782760137446&lon=9.205708103179973?callback=test?&units=metric";
	url = "http://api.openweathermap.org/data/2.5/forecast?lat=" + lat + "&lon=" + lng + "?callback=test?&units=metric";

  	$.ajax({
		type: "POST",
		dataType: "jsonp",
		url: url,
		async: false,
		success: function (data) {
			showForecast(data);
		},
		error: function (errorData) {
			alert("Error while getting weather data :: " + errorData.status);
		}
  	}).done(function() {
  		$( "#chart_small" ).dialog( "open" );
	});
}


function showHourlyForecastChart() {
	var curdate = new Date( (new Date()).getTime()- 180 * 60 * 1000 );
	var cnt=0;
	var time = new Array();
	var tmp = new Array();
	var pres = new Array();
	var wind = new Array();
	for(var i = 0; i < forecast.length; i ++){
		var dt = new Date(forecast[i].dt * 1000);
		if( curdate > dt ) continue;
		if(cnt > 10) break;
		cnt++;
		tmp.push( Math.round(10*(forecast[i].main.temp))/10 );
		pres.push( Math.round(10*(forecast[i].main.pressure))/10 );
		time.push( new Date( forecast[i].dt * 1000 + time_zone) );
		wind.push(forecast[i].wind.speed);
	}

	$('#chart_small').highcharts({
        chart: {
            width: 800,
            height: 400,
            zoomType: 'xy'
        },
        credits: {
            enabled: false
        },
        title: {
            text: city
        },
        subtitle: {
            text: 'Open Weather Maps'
        },
        xAxis: [{
            categories: time,
                type: 'datetime',
                labels: {
                    formatter: function() {
                        return Highcharts.dateFormat('%H:%M', this.value);
                    }
                }
        }],
        yAxis: [{ // Primary yAxis
            gridLineWidth: 0,
            labels: {
                format: '{value} °C',
                style: {
                    color: 'red'
                }
            },
            title: {
                text: 'Temperature',
                style: {
                    color: 'red'
                }
            },
            opposite: true

        }, { // Secondary yAxis
            gridLineWidth: 0,
            title: {
                text: 'Pressure',
                style: {
                    color: 'blue'
                }
            },
            labels: {
                format: '{value} hPa',
                style: {
                    color: 'blue'
                }
            }

        }, { // Tertiary yAxis
            gridLineWidth: 0,
            title: {
                text: 'Wind',
                style: {
                    color: 'green'
                }
            },
            labels: {
                format: '{value} m/s',
                style: {
                    color: 'green'
                }
            },
            opposite: true
        }],
        tooltip: {
            shared: true
        },
        legend: {
            layout: 'vertical',
            margin: 20,
            align: 'left',
            x: 0,
            verticalAlign: 'top',
            y: -18,
            floating: true,
            backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
        },
        series: [{
            name: 'Pressure',
            type: 'spline',
            color: 'blue',
            yAxis: 1,
            data: pres,
            tooltip: {
                valueSuffix: ' hPa'
            }

        }, {
            name: 'Wind',
            type: 'spline',
            color: 'green',
            yAxis: 2,
            data: wind,
            marker: {
                enabled: false
            },
            tooltip: {
                valueSuffix: ' m/s'
            }

        }, {
            name: 'Temperature',
            type: 'spline',
            color: 'red',
            data: tmp,
            tooltip: {
                valueSuffix: ' °C'
            }
        }]
    });
};


function showForecast(d) {
	forecast = d.list;
	city = d.city.name;
	showHourlyForecastChart();
}

function errorHandler(e)	{
	alert(e.status +' '+e.statusText);
} 