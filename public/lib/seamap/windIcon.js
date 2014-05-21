function windIcon(deg, num) {
  //num = 5;
  var langWindDir = new Array("N", "NNE", "NE", "ENE","E", "ESE", "SE", "SSE","S", "SSW", "SW", "WSW","W", "WNW", "NW", "NNW");

  function windDirLang ($winddir) {
    return langWindDir[Math.floor(((parseInt($winddir) + 11.25) / 22.5))];
  }
  
  // Create the chart
  $('.div-wind-icon' + num).highcharts({
  
      chart: {
          type: 'gauge',
          plotBackgroundColor: 'rgba(0, 0, 0, 0.0)',
          backgroundColor:'rgba(255, 255, 255, 0.0)',
          plotBackgroundImage: null,
          plotBorderWidth: 0,
          plotShadow: false,
          // Größe der Uhr auf der Webseite
          height: 50,
          width: 50,
          margin: 2
      },
      
      credits: {
        // Anzeige von Highcharts
          enabled: false
      },

      title: {
        // Überschrift
        text: ''
      },
      
      pane: {
        background: [{
          // default background
        }, {
          // reflex for supported browsers
          backgroundColor: Highcharts.svg ? {
            radialGradient: {
              cx: 0.5,
              cy: -0.4,
              r: 1.9
            },
            stops: [
              [0.5, 'rgba(255, 255, 255, 0.2)']
            ]
          } : null
        }]
      },
      
      yAxis: {
          // Start- und End-Wert der Zahlen
          min: 0,
          max: 360,
          // Kreis ausenherum
          lineWidth: 0,

          minorTickInterval: 'auto',
          // Breite Skalierungsanzeige
          minorTickWidth: 1,
          // Länder der Skalierung zur Mitte
          minorTickLength: 2,
          // Wo Skalierung in Uhr anfängt
          minorTickPosition: 'inside',
          minorGridLineWidth: 0,
          // Farbe der Skalierung
          minorTickColor: '#666',
  
      // Wo an der Skalierung Zahlen angezeigt werden
          tickInterval: 22.5,
          tickWidth: 1,
          tickLength: 4,
          tickPosition: 'inside',
          tickColor: '#666',
          // Anzeige der Himmelsrichtung
          labels: {
            // Position der Zahlen im Kreis, vom Rand aus
              distance: -11,
            style: {
                  fontSize: '8px',
                  color: '#0059FE',
                  fontWeight: 'bold'
              },
              step: 4,
              rotation: 'auto',
        formatter:
        function() {
          return windDirLang(this.value);
        },
          }
/*              title: {
            // Text in der Uhr
              text: 'degree',
              style: {
                  color: '#BBB',
                  fontWeight: 'bold',
                  fontSize: '12px',
                  // Zeilenabstand
                  lineHeight: '20px'                
              },
              // Position des Texts
              y: 100

          }
*/      
      },
  
      series: [{
          name: 'deg',
          data: [deg],
          tooltip: {
              //valueSuffix: ' km/h'
        enabled: false
          },
          dial: {
            backgroundColor: '#FE0000',
                radius: '100%',
                baseWidth: 4,
                topWidth: 1,
                baseLength: '10%',
                rearLength: 0
            },
            pivot: {
              radius : 3
            }
      }]
  });
}