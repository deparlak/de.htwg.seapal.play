/**
 *  This function initalizes the Compass Chart
 */
function initCOGCompass(containerId) {
    if (typeof (window.cogChart) != "undefined") {
        window.cogChart.destroy();
    }

    window.cogChart = new Highcharts.Chart({

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

        exporting: {
            enabled: false
        },

        tooltip: {
            enabled: false
        },

        title: {
            text: '',
            style: {
                display: 'none'
            }
        },
        pane: {
            startAngle: -180,
            endAngle: 180,
            size: [10],
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
                backgroundColor: {
                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                    stops: [
                        [0, '#666'],
                        [1, '#0c0c0c']
                    ]
                },
                borderWidth: 1,
                outerRadius: '107%'
            }, {
                backgroundColor: '#DDD',
                borderWidth: 1,
                outerRadius: '105%',
                innerRadius: '104%'
            }]
        },

        // the value axis
        yAxis: [{
            min: 0,
            max: 360,

            minorTickInterval: 'auto',
            minorTickWidth: 1,
            minorTickLength: 5,
            minorTickPosition: 'inside',
            minorTickColor: '#fff',

            tickInterval: 30,
            tickWidth: 2,
            tickPosition: 'inside',
            tickLength: 8,
            tickColor: '#fff',
            labels: {
                style: {
                    color: '#fff',
                    fontSize: '8px'
                },
                step: 2,
                distance: -15,
                formatter: function () {
                    if (this.value == 'N' || this.value == 'O' || this.value == '360') {
                        return '180';
                    } else if (this.value == '60') {
                        return '240';
                    } else if (this.value == '120') {
                        return '300';
                    } else if (this.value == '180') {
                        return '0';
                    } else if (this.value == '240') {
                        return '60';
                    } else if (this.value == '300') {
                        return '120';
                    }
                }
            }
        }, {
            showlastlabel: false,
            categories: ['N'],
            offset: 10,
            min: 0,
            max: 360,

            minorTickLength: 0,

            tickInterval: 45,
            tickWidth: 2,
            tickPosition: 'outside',
            tickLength: 3,
            tickColor: '#000',

            labels: {
                style: {
                    fontSize: '12px',
                    color: '#000'
                },
                distance: 15,
                formatter: function () {
                    if (this.value == 'N' || this.value == 'O' || this.value == '360') {
                        return 'S';
                    } else if (this.value == '45') {
                        return 'SW';
                    } else if (this.value == '90') {
                        return 'W';
                    } else if (this.value == '135') {
                        return 'NW';
                    } else if (this.value == '180') {
                        return 'N';
                    } else if (this.value == '225') {
                        return 'NE';
                    } else if (this.value == '270') {
                        return 'E';
                    } else if (this.value == '315') {
                        return 'SE';
                    }
                }
            }
        }],

        series: [{
            name: 'Degree Bottom',
            data: [0],
            dial: {
                baseWidth: 4,
                backgroundColor: '#C33',
                borderColor: '#900',
                borderWidth: 1,
                baseLength: 10,
                radius: 80
            },
            tooltip: {
                enabled: false
            }
        }]

    });
};