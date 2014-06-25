/**
 *  This function initalizes the clouds Chart
 */
function initCloudsChart(containerId) {
    if (typeof (window.cloudsChart) != "undefined") {
        window.cloudsChart.destroy();
    }

    window.cloudsChart = new Highcharts.Chart({
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
            text: 'Bewölkung',
            style: {
                fontSize: '14px'
            }
        },
        yAxis: {
            min: 0,
            max: 1,

            minorTickInterval: 0.05,
            minorTickWidth: 2,
            minorTickLength: 8,
            minorTickPosition: 'inside',

            tickInterval: 0.2,
            tickWidth: 3,
            tickLength: 10,
            tickPosition: 'inside'
        },
        series: [{
            name: "score",
            data: [0.5],
            dial: {
                radius: "90%",
                rearLength: "0%"
            }
        }]
    });
};