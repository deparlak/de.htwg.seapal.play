/**
 *  This function initalizes the SOG Chart
 */
function initSOGSpeedometer(containerId) {
    if (typeof (window.sogChart) != "undefined") {
        window.sogChart.destroy();
    }

    window.sogChart = new Highcharts.Chart({
        chart: {
            renderTo: containerId,
            type: 'gauge',
            alignTicks: false,
            backgroundColor:'rgba(255, 255, 255, 0.1)',
            backgroundColor:'rgba(255, 255, 255, 0.1)',
            plotBackgroundImage: null,
            plotBorderWidth: 0,
            plotShadow: false
        },
        credits: {
            enabled: false
        },
        title: {
            text: '',
            style: {
                display: 'none'
            }
        },

        pane: {
            startAngle: -150,
            endAngle: 150,
            size: [11],
            center: ['50%', '50%'],
            background: [{
                backgroundColor: {
                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                    stops: [
                        [0, '#FFF'],
                        [1, '#333']
                    ]
                },
                borderWidth: 0,
                outerRadius: '109%'
            }, {
                backgroundColor: {
                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                    stops: [
                        [0, '#333'],
                        [1, '#FFF']
                    ]
                },
                borderWidth: 1,
                outerRadius: '107%'
            }, {
                // default background
            }, {
                backgroundColor: '#DDD',
                borderWidth: 0,
                outerRadius: '105%',
                innerRadius: '103%'
            }]
        },

        // the value axis
        yAxis: {
            min: 0,
            max: 20,

            minorTickInterval: 'auto',
            minorTickWidth: 1,
            minorTickLength: 10,
            minorTickPosition: 'inside',
            minorTickColor: '#666',

            tickPixelInterval: 30,
            tickWidth: 2,
            tickPosition: 'inside',
            tickLength: 10,
            tickColor: '#666',
            labels: {
                step: 1,
                style: {
                    fontSize: '8px',
                    distance: -15
                }
            },
            title: {
                text: 'kn',
                y: 20
            },
            plotBands: [{
                from: 0,
                to: 13,
                color: '#55BF3B' // green
            }, {
                from: 13,
                to: 17,
                color: '#DDDF0D' // yellow
            }, {
                from: 17,
                to: 20,
                color: '#DF5353' // red
            }]
        },

        tooltip: {
            enabled: false
        },

        exporting: {
            enabled: false
        },

        series: [{
            name: 'SOG',
            data: [100],
            tooltip: {
                enabled: false
            }
        }]

    });
}