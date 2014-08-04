/**
 *  This function initalizes the Air Pressure Chart
 */
function initAirPressureChart(containerId) {
    if (typeof (window.airPressureChart) != "undefined") {
        window.airPressureChart.destroy();
    }

    window.airPressureChart = new Highcharts.Chart({
        chart: {
            renderTo: containerId,
            type: 'gauge',
            backgroundColor:'rgba(255, 255, 255, 0.1)',
            plotBackgroundImage: null,
            plotBorderWidth: 0,
            plotShadow: false
        },
        credits: {
            enabled: false
        },
        pane: {
            startAngle: -150,
            endAngle: 150,
            size: [11],
            center: ['50%', '55%']
        },
        exporting: {
            enabled: false
        },
        tooltip: {
            enabled: false
        },
        title: {
            text: 'Luftdruck',
            style: {
                fontSize: '14px'
            }
        },
        yAxis: {
            min: 960,
            max: 1060,

            minorTickInterval: 1,
            minorTickWidth: 2,
            minorTickLength: 10,
            minorTickPosition: 'inside',

            tickInterval: 20,
            tickWidth: 3,
            tickLength: 15,
            tickPosition: 'inside',

            labels: {
                style: {
                    fontSize: '9px'
                }
            },

            title: {
                text: 'mBar',
                y: +15
            }
        },
        series: [{
            name: "score",
            data: [990],
            dial: {
                radius: "87%",
                rearLength: "0%"
            }
        }]
    });
};