function initAirPressureCloudingTemperatureChart(container, data_x, air_pressure_data_y, cloudage_data_y, temperature_data_y, waypoint_ids) {
    $(container).highcharts({
        chart: {
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
        plotOptions: {
            series: {
                cursor: 'pointer',
                point: {
                    events: {
                        click: function () {
                            var waypoint = $('#waypoint_' + waypoint_ids[this.x]);
                            scrollToWaypoint(waypoint);
                        }
                    }
                }
            }
        },
        legend: {
            enabled: false
        },
        title: {
            text: ""
        },
        xAxis: {
            categories: data_x
        },
        yAxis: [
            {
                title: {
                    style: {
                        color: 'black'
                    },
                    text: 'Air Pressure [x]'
                },
                max: 1050,
                min: 950
            },
            {
                title: {
                    style: {
                        color: 'blue'
                    },
                    text: 'Clouding [x]'
                },
                max : 1,
                min: 0
            },
            {
                title: {
                    style: {
                        color: 'green'
                    },
                    text: 'Temperature [°C]'
                },
                max: 45,
                min: -20
            }
        ],
        series: [
            {
                yAxis: 0,
                color: 'black',
                name: "air pressure",
                data: air_pressure_data_y
            },
            {
                yAxis: 1,
                color: 'blue',
                name: "clouding",
                data: cloudage_data_y
            },
            {
                yAxis: 2,
                color: 'green',
                name: "temperature",
                data: temperature_data_y
            }
        ]
    });
}