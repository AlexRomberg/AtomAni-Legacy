const maxPoints = 50;

export function generateChart(canvasId, borderColor, backgroundColor) {
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
                    beginAtZero: true
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
        }
    };
    let defaults = { global: { animation: { duration: 0 } } }


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