function initSpeedChart(container, data_x, data_y, waypoint_names, waypoint_ids, title, description) {
    $(container).highcharts({
        chart: {
            height: 250,
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
            text: title,
            x: -20 //center
        },
        xAxis: {
            categories: data_x
        },
        yAxis: {
            title: {
                text: 'Speed [kn]'
            }
        },
        tooltip: {
            formatter: function () {
                return '<b>' + description + '</b><br>' + waypoint_names[this.x - 1] + ': ' + this.y + 'kn';
            }
        },
        series: [{
            name: description,
            data: data_y
        }]
    });
}