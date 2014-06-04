function windIcon(deg, speed, num) {
  var langWindDir = new Array("N", "NNE", "NE", "ENE","E", "ESE", "SE", "SSE","S", "SSW", "SW", "WSW","W", "WNW", "NW", "NNW");
  var windColor;


  function windDirLang ($winddir) {
    return langWindDir[Math.floor(((parseInt($winddir) + 11.25) / 22.5))];
  }

  function getColor() {
    if (speed < 1.5) {
      return 'rgba(0, 0, 180, 1.0)'; // dark blue
    } else if (speed < 3) {
      return 'rgba(0, 0, 223, 1.0)'; // blue
    } else if (speed < 5) {
      return 'rgba(0, 24, 254, 1.0)'; // blue
    } else if (speed < 6.5) {
      return 'rgba(0, 114, 254, 1.0)'; // light blue
    } else if (speed < 8.5) {
      return 'rgba(0, 173, 254, 1.0)'; // cyan blue
    } else if (speed < 10) {
      return 'rgba(0, 238, 254, 1.0)'; // cyan
    } else if (speed < 12) {
      return 'rgba(43, 254, 211, 1.0)'; // light cyan
    } else if (speed < 13.5) {
      return 'rgba(103, 254, 151, 1.0)'; // green cyan
    } else if (speed < 15.5) {
      return 'rgba(155, 254, 99, 1.0)'; // light green
    } else if (speed < 17) {
      return 'rgba(211, 254, 43, 1.0)'; // yellow green
    } else if (speed < 19) {
      return 'rgba(254, 243, 0, 1.0)'; // yellow
    } else if (speed < 20.5) {
      return 'rgba(254, 183, 0, 1.0)'; // orange yellow
    } else if (speed < 22.5) {
      return 'rgba(254, 121, 0, 1.0)'; // orange
    } else if (speed < 24) {
      return 'rgba(254, 75, 0, 1.0)'; // red orange
    } else if (speed < 25.5) {
      return 'rgba(254, 23, 0, 1.0)'; // light red
    } else if (speed < 27.5) {
      return 'rgba(220, 0, 0, 1.0)'; // red
    } else if (speed < 29) {
      return 'rgba(173, 0, 0, 1.0)'; // dark red
    } else {
      return 'rgba(254, 0, 0, 1.0)'; // red
    }
  }

  windColor = getColor();
  
  // Create the chart
  $('#div-wind-icon' + num).highcharts({
  
      chart: {
          type: 'gauge',
          backgroundColor:'rgba(0, 0, 0, 0.0)',
          plotBackgroundColor: 'rgba(0, 0, 0, 0.0)',
          plotBackgroundImage: null,
          plotBorderWidth: 0,
          plotShadow: false,
          // size
          height: 50,
          width: 50,
          margin: 5
      },
      
      credits: {
        // logo
        enabled: false
      },

      title: {
        // headline
        text: ''
      },
      
      pane: {
        background: [{
          backgroundColor: 'rgba(0, 0, 0, 0.0)',
          borderColor: 'rgba(0, 0, 0, 0.0)'
        }]
      },
      
      yAxis: {
          min: 0,
          max: 360,
          lineWidth: 0,

          minorTickInterval: 'auto',
          minorTickWidth: 1,
          minorTickLength: 2,
          minorTickPosition: 'inside',
          minorGridLineWidth: 0,
          minorTickColor: 'rgba(0, 0, 0, 0.0)',
  
          tickInterval: 22.5,
          tickWidth: 1,
          tickLength: 4,
          tickPosition: 'inside',
          tickColor: 'rgba(0, 0, 0, 0.0)',
          labels: {
              distance: -11,
              style: {
                  fontSize: '8px',
                  color: 'rgba(0, 0, 0, 0.0)',
                  fontWeight: 'bold'
              },
              step: 4,
              rotation: 'auto',
              formatter:
              function() {
                return windDirLang(this.value);
              },
          }
      },

      series: [{
        name: 'deg',
        enableMouseTracking: false,
        data: [{
            id: 'top',
            y: deg + 180,
            dial: {
              backgroundColor: windColor,
              baseLength: '70%',
              baseWidth: 15,
              radius: '100%',
              rearLength: '-70%',
              topWidth: 1
            }
          },{
            id: 'base',
            y: deg + 180,
            dial: {
              backgroundColor: windColor,
              baseLength: '100%',
              baseWidth: 5,
              radius: '70%',
              rearLength: '130%',
              topWidth: 1
            }
        }],
        tooltip: {
          //valueSuffix: ' km/h'
          enabled: false,
        },
        pivot: {
          radius : 3
        },
          
        animation: false,
        dataLabels: {
          enabled: false
        }
      }]
  });
}