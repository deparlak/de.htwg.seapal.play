/**
 *  This method inits the wave direction speed chart
 */
function initWaveDirHeightChart(containerId, data) {
    if (typeof (window.waveDirHeightChart) != "undefined") {
        window.waveDirHeightChart.destroy();
    }

    window.waveDirHeightChart = new Highcharts.Chart({
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
            text: 'Wellenrichtung / Wellenhöhe',
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
                text: 'Meter'
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
            name: 'waveTable',
            type: 'column',
            data: data //[7.0, 6.9, 9.5, 0, 0, 1.5, 0, 7.5, 8.3, 2.3, 1.9, 1.6, 0, 1, 4, 5]
        }]
    });
}