/**
 *  This method inits the wind direction speed chart
 */
function initWindDirSpeedChart(containerId, data) {
    if (typeof (window.windDirSpeedChart) != "undefined") {
        window.windDirSpeedChart.destroy();
    }

    window.windDirSpeedChart = new Highcharts.Chart({
        chart: {
            renderTo: containerId,
            polar: true,
            type: 'column',
            backgroundColor:'rgba(255, 255, 255, 0.1)',
            plotBackgroundImage: null,
            plotBorderWidth: 0,
            plotShadow: false
        },

        credits: {
            enabled: false
        },

        exporting: {
            enabled: false
        },

        tooltip: {
            enabled: false
        },

        title: {
            text: 'Windrichtung / Windgeschwindigkeit',
            style: {
                fontSize: '14px'
            }
        },
        pane: {
            size: [11],
            center: ['50%', '50%']
        },

        xAxis: {
            tickmarkPlacement: 'on'
        },

        legend: {
            enabled: false
        },
        plotOptions: {
            series: {
                stacking: 'normal',
                shadow: false,
                groupPadding: 0,
                pointPlacement: 'on'
            }
        },
        xAxis: [{
            categories: ['N', 'NNO', 'NO', 'ONO', 'O', 'OSO','SO', 'SSO', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'],
            labels: {
                style: {
                    fontSize: '9px'
                },
                distance: 9
            }
        }],
        yAxis: {
            min: 0,
            max: 5,
            tickInterval: 1,
            endOnTick: false,
            showLastLabel: true,
            title: {
                style: {
                    fontSize: '9px'
                },
                text: 'Beaufort',
                useHTML: true
            },
            labels: {
                style: {
                    fontSize: '8px'
                },
                formatter: function () {
                    return this.value;
                }
            }
        },
        series: [{
            name: 'windTable',
            type: 'column',
            data: data //[0.0, 6.9, 0, 10, 0, 6.5, 3, 7.5, 8.3, 0, 3.9, 4.6, 0, 0, 0, 0]
        }]
    });
}