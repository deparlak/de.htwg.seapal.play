/**
 *  This function initalizes the temperature Chart
 */
function initTemperatureChart(containerId) {
    if (typeof (window.temperatureChart) != "undefined") {
        window.temperatureChart.destroy();
    }

    window.temperatureChart = new Highcharts.Chart({
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
            text: 'Temperatur',
            style: {
                fontSize: '14px'
            }
        },
        yAxis: {
            min: -10,
            max: 40,

            minorTickInterval: 1,
            minorTickWidth: 1,
            minorTickLength: 5,
            minorTickPosition: 'inside',

            tickInterval: 5,
            tickWidth: 3,
            tickLength: 10,
            tickPosition: 'inside',

            title: {
                text: 'C',
                y: +15
            },
            labels: {
                style: {
                    fontSize: '10px'
                },
                step: 1,
                distance: -15
            }
        },
        series: [{
            name: "score",
            data: [10],
            dial: {
                radius: "87%",
                rearLength: "0%"
            }
        }]
    });
};