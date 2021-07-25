const maxPoints = 50;

export function generateChart(canvasId, chartTitle, borderColor, backgroundColor) {
    let type = 'line';
    let data = {
        datasets: [{
            data: [],
            borderColor,
            backgroundColor
        }],
        labels: []
    };
    let options = {
        aspectRatio: 3,
        maintainAspectRatio: false,
        responsive: true,
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true,
                    fontColor: "#000"
                }
            }],
            xAxes: [{
                ticks: {
                    fontColor: "#000"
                }
            }]
        },
        legend: {
            display: false
        },
        elements: {
            point: {
                radius: 0
            }
        },
        tooltips: {
            enabled: false
        }
    };
    let defaults = {
        global: {
            animation: { duration: 0 }
        }
    };

    createChartBox(chartTitle, canvasId);

    var ctx = document.getElementById(canvasId).getContext('2d');
    let chart = new Chart(ctx, {
        type,
        data,
        options,
        defaults
    });

    return chart
};

export function addPoint(chart, point, label) {
    let labels = chart.data.labels;
    let data = chart.data.datasets[0].data;
    labels.push(label);
    data.push(point);

    if (data.length > maxPoints) {
        labels.shift();
        data.shift();
    }

    chart.update(250);
}

function createChartBox(chartTitle, canvasId) {
    $('.charts').append('<div class="chart"><h4>' + chartTitle + '</h4 ><div class="chart-container" style="position: relative; width:100%; height: 150px;"><canvas id="' + canvasId + '"></canvas></div></div >');
}

export function remove() {
    $('.charts').text('');
}