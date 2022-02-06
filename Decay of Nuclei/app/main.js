let nucleusLeftDatasets = []
let nucleusLeftAverageArray = []
let nucleusLeftArray = []
let chartUI
let running = false
let x = null
let y = null
let slowest
let fastest

function calculate() {
    if (running === true) {
        running = false
        return
    } else {
        running = true
    }

    let probability = $("#inputProbability").val()
    let nucleusQuantity = $("#inputNucleusQuantity").val()
    let runs = $("#inputRuns").val()
    nucleusLeftDatasets = []
    nucleusLeftAverageArray = []
    nucleusLeftArray = []

    let run = 1

    let progress = 0
    let progressBar = $("#progress #bar div")
    let progressText = $("#progress #bar div p")
    progressBar.width("0%")
    progressText.text("0%")

    let waitForEnd = setInterval(function () {
        if (run <= runs && running === true) {
            console.log("-----------------------------------------")
            console.log(`Run ${run}:`)

            progress = Math.round(run / runs * 100)
            progressBar.width(`${progress}%`)
            progressText.text(`${progress}%`)

            nucleusLeftArray.push([])

            let nucleusLeft = nucleusQuantity
            let round = 0

            while (running === true) {
                let nucleusDecayed = 0


                nucleusLeftArray[run - 1].push({x: round, y: nucleusLeft})

                round++

                for (let nucleusChecked = 0; nucleusChecked < nucleusLeft; nucleusChecked++) {
                    if (Math.floor(Math.random() * probability) + 1 == 1) {
                        nucleusDecayed += 1;
                    }
                }

                nucleusLeft -= nucleusDecayed;
                console.log(`Round ${round}: ${nucleusDecayed} (${nucleusLeft}) `)
                if (nucleusLeft <= 0) {
                    nucleusLeftArray[run - 1].push({x: round, y: nucleusLeft})
                    if (run < 500) {
                        nucleusLeftDatasets.push({
                            label: run.toString(),
                            pointStyle: 'point',
                            hoverRadius: 3,
                            showLine: true,
                            pointBackgroundColor: 'rgba(141,179,250,0.3)',
                            borderColor: `rgba(${Math.random() * 240},${Math.random() * 240},${Math.random() * 240}, 0.3)`,
                            data: nucleusLeftArray[run - 1],
                            cubicInterpolationMode: "monotone",
                        })
                    }
                    break
                }
            }
            run++
        } else {
            running = false
            $("#stop").hide()
            $("#calculate").show()
            calculateAverageArray()
            showPoints()
            showChart()
            clearInterval(waitForEnd)
        }
    }, 1)
}

function calculateAverageArray() {
    let totalArrayLength = 0
    let slowestLength = nucleusLeftArray[0].length
    let fastestLength = nucleusLeftArray[0].length
    slowest = 1
    fastest = 1
    for (let curArray in nucleusLeftArray) {
        totalArrayLength += nucleusLeftArray[curArray].length
        if (nucleusLeftArray[curArray].length > slowestLength) {
            slowestLength = nucleusLeftArray[curArray].length
            slowest = parseInt(curArray) + 1
        }
        if (nucleusLeftArray[curArray].length < fastestLength) {
            fastestLength = nucleusLeftArray[curArray].length
            fastest = parseInt(curArray) + 1
        }
    }
    let averageArrayLength = Math.round(totalArrayLength / nucleusLeftArray.length)

    for (let curRow = 0; curRow < averageArrayLength; curRow++) {
        let totalNucleusLeft = 0
        for (const curArray in nucleusLeftArray) {
            try {
                totalNucleusLeft += parseInt(nucleusLeftArray[curArray][curRow].y)
            } catch (e) {
            }
        }
        let averageNucleusLeft = Math.round(totalNucleusLeft / nucleusLeftArray.length)
        nucleusLeftAverageArray.push({x: curRow, y: averageNucleusLeft})
    }

    if (nucleusLeftAverageArray[nucleusLeftAverageArray.length - 1].y != 0)
        nucleusLeftAverageArray[nucleusLeftAverageArray.length - 1].y = 0

    nucleusLeftDatasets.unshift({
        label: "Durchschnitts Kurve",
        hoverRadius: 5,
        pointStyle: 'rectRot',
        showLine: true,
        borderWidth: 3,
        pointBackgroundColor: '#8dfabc',
        borderColor: "#b0ffec",
        data: nucleusLeftAverageArray,
        cubicInterpolationMode: "monotone",
    })
}

function showPoints() {
    if ($("#inputPoint").is(':checked')) {
        for (const dataset of nucleusLeftDatasets) {
            dataset.pointRadius = function (context) {
                const index = context.dataIndex;
                if (nucleusLeftAverageArray.length < 50 || index === dataset.data.length - 1)
                    return 2
                else if (nucleusLeftAverageArray.length < 100)
                    return (index % 4) === 0 ? 2 : 0
                else
                    return 0
            }
        }
        nucleusLeftDatasets[0].pointRadius = function (context) {
            const index = context.dataIndex;
            if (index === nucleusLeftAverageArray.length - 1)
                return 3
            else if (nucleusLeftAverageArray.length > 50)
                return (index % Math.floor(nucleusLeftAverageArray.length / 25)) === 0 ? 3 : 0
            else
                return 4
        }
    } else {
        for (const data of nucleusLeftDatasets) {
            data.pointRadius = 0
        }
    }

    if (chartUI)
        showChart()
}

function showChart() {
    if (chartUI)
        chartUI.destroy()

    chartUI = new Chart("average-diagram", {
        type: "line",
        data: {
            datasets: nucleusLeftDatasets
        },
        options: {
            interaction: {
                intersect: false,
                mode: 'index',
                axis: 'x'
            },
            responsive: true,
            animation: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            if (context.dataset.label === "Durchschnitts Kurve") {
                                return `${context.dataset.label}: ${context.parsed.y}`
                            }
                            if (context.dataset.label == slowest) {
                                return `Langsamste Kurve: ${context.parsed.y}`
                            }
                            if (context.dataset.label == fastest) {
                                return `Schnellste Kurve: ${context.parsed.y}`
                            }
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Verbleibende Kerne Diagram',
                    font: {
                        size: 16,
                    },
                },
                legend: {
                    display: false,
                },
            },
            scales: {
                x: {
                    max: x,
                    borderWidth: 200,
                    type: 'linear',
                    display: true,
                    title: {
                        display: true,
                        text: 'Durchlauf',
                        font: {
                            size: 14,
                        },
                    },
                },
                y: {
                    max: y,
                    display: true,
                    title: {
                        display: true,
                        text: 'Kerne verbleibend',
                        font: {
                            size: 14,
                        },
                    },
                },
            }
        },
        plugins: [htmlLegendPlugin],
    });

    showTable()
}

function showTable() {
    let first = $("#tables div table .first")[0]
    $("#tables div table").children().remove()
    $("#tables div table").append(first)

    let slowestTable = $("#tables #slowest table");
    for (let round in nucleusLeftArray[slowest - 1]) {
        let curDecay = nucleusLeftArray[slowest - 1][0].y - nucleusLeftArray[slowest - 1][round].y
        curDecay -= (round == 0) ? 0 : nucleusLeftArray[slowest - 1][0].y - nucleusLeftArray[slowest - 1][round-1].y
        let tr = $(slowestTable).append("<tr></tr>")
        $(tr).append(`<td>${round}</td>`)
        $(tr).append(`<td>${curDecay}</td>`)
        $(tr).append(`<td>${nucleusLeftArray[slowest - 1][0].y - nucleusLeftArray[slowest - 1][round].y}</td>`)
        $(tr).append(`<td>${nucleusLeftArray[slowest - 1][round].y}</td>`)
    }


    let averageTable = $("#tables #average table");
    for (let round in nucleusLeftAverageArray) {
        let curDecay = nucleusLeftAverageArray[0].y - nucleusLeftAverageArray[round].y
        curDecay -= (round == 0) ? 0 : nucleusLeftAverageArray[0].y - nucleusLeftAverageArray[round-1].y
        let tr = $(averageTable).append("<tr></tr>")
        $(tr).append(`<td>${round}</td>`)
        $(tr).append(`<td>${curDecay}</td>`)
        $(tr).append(`<td>${nucleusLeftAverageArray[0].y - nucleusLeftAverageArray[round].y}</td>`)
        $(tr).append(`<td>${nucleusLeftAverageArray[round].y}</td>`)
    }

    let fastestTable = $("#tables #fastest table");
    for (let round in nucleusLeftArray[fastest - 1]) {
        let curDecay = nucleusLeftArray[fastest - 1][0].y - nucleusLeftArray[fastest - 1][round].y
        curDecay -= (round == 0) ? 0 : nucleusLeftArray[fastest - 1][0].y - nucleusLeftArray[fastest - 1][round-1].y
        let tr = $(fastestTable).append("<tr></tr>")
        $(tr).append(`<td>${round}</td>`)
        $(tr).append(`<td>${curDecay}</td>`)
        $(tr).append(`<td>${nucleusLeftArray[fastest - 1][0].y - nucleusLeftArray[fastest - 1][round].y}</td>`)
        $(tr).append(`<td>${nucleusLeftArray[fastest - 1][round].y}</td>`)
    }

    $("#tables").css("display", "flex")
}

const htmlLegendPlugin = {
    id: 'htmlLegend',
    afterUpdate(chart, args, options) {
        const ul = $("#legend-container ul")

        $(ul).children().remove()


        for (let i = 0; i < 2; i++) {
            let item = chart.options.plugins.legend.labels.generateLabels(chart)[i]
            let li = $('<li></li>')

            if (i < 1) {
                li.on("click", function () {
                    chart.getDatasetMeta(0).hidden = !chart.getDatasetMeta(0).hidden
                    chart.update()
                })
            } else {
                li.on("click", function () {
                    for (let j = 1; j < chart.data.datasets.length; j++) {
                        chart.getDatasetMeta(j).hidden = !chart.getDatasetMeta(j).hidden
                    }
                    chart.update()
                })
            }

            $(li).append('<span></span>')

            $(li).append(`<p>${((i < 1) ? item.text : "Andere Kurven")}</p>`).css("text-decoration", item.hidden ? 'line-through' : '')

            $(ul).append(li)
        }
    }
};

$(document).ready(function () {
    $("#stop").hide()
    $("#calculate").on("click", function () {
        $(this).hide()
        $("#stop").show()
        calculate()
    })
    $("#stop").on("mousedown", function () {
        $(this).hide()
        $("#calculate").show()
        calculate()
    })
    $("#inputX").on("change", function () {
        if ($(this).val() == 0)
            x = null
        else
            x = parseInt($(this).val())

        if (chartUI)
            showChart()
    })
    $("#inputY").on("change", function () {
        if ($(this).val() == 0)
            y = null
        else
            y = parseInt($(this).val())

        if (chartUI)
            showChart()
    })
})
