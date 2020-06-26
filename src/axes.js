// const AXES_UNIT_AND_STEP = [{
//         'minMsPerPixel': 0,
//         'pxPerStep': 50,
//         'unit': 'millisecond'
//     },
//     {
//         'minMsPerPixel': 1000,
//         'pxPerStep': 50,
//         'unit': 'second'
//     },
//     {
//         'minMsPerPixel': 60 * 1000,
//         'pxPerStep': 50,
//         'unit': 'minute'
//     },
//     {
//         'minMsPerPixel': 60 * 60 * 1000,
//         'pxPerStep': 50,
//         'unit': 'hour'
//     },
//     {
//         'minMsPerPixel': 24 * 60 * 60 * 1000,
//         'pxPerStep': 50,
//         'unit': 'day'
//     },
//     {
//         'minMsPerPixel': 30 * 24 * 60 * 60 * 1000,
//         'pxPerStep': 50,
//         'unit': 'month'
//     },
//     {
//         'minMsPerPixel': 365 * 24 * 60 * 60 * 1000,
//         'pxPerStep': 50,
//         'unit': 'year'
//     },
// ];

// pixels between 2 vertical grid lines
const PIXEL_STEP_SIZE = 30;

// enforce xAxes data type to 'time'
const setTimeAxesOptions = (chart, start, end) => {
    chart.config.options = !!chart.config.options ? chart.config.options : {};
    chart.config.options.scales = !!chart.config.options.scales ? chart.config.options.scales : {};
    chart.config.options.scales.xAxes = !!chart.config.options.scales.xAxes && chart.config.options.scales.xAxes.length > 0 ? chart.config.options.scales.xAxes : [{}];
    chart.config.options.scales.xAxes[0].time = !!chart.config.options.scales.xAxes[0].time ? chart.config.options.scales.xAxes[0].time : {};
    chart.config.options.scales.xAxes[0].time.displayFormats = !!chart.config.options.scales.xAxes[0].time.displayFormats ? chart.config.options.scales.xAxes[0].time.displayFormats : {};

    // const w = chart.width;
    // const msInterval = (end.getTime() - start.getTime());
    // const msPerPixel = msInterval / w;

    // for (let i = 0; i < AXES_UNIT_AND_STEP.length && AXES_UNIT_AND_STEP[i]['minMsPerPixel'] * AXES_UNIT_AND_STEP[i]['stepSize'] < msPerPixel; i++) {
    //     chart.config.options.scales.xAxes[0].time.unit = AXES_UNIT_AND_STEP[i]['unit'];
    //     chart.config.options.scales.xAxes[0].time.stepSize = AXES_UNIT_AND_STEP[i]['stepSize'];
    // }

    chart.config.options.scales.xAxes[0].type = 'time';
    chart.config.options.scales.xAxes[0].distribution = 'linear';
    // chart.config.options.scales.xAxes[0].time.stepSize = PIXEL_STEP_SIZE; // pixels between 2 vertical grid lines
    chart.config.options.scales.xAxes[0].time.minUnit = 'millisecond';
    chart.config.options.scales.xAxes[0].time.displayFormats.hour = 'MMM D, hA'; // override default momentjs format for 'hour' time unit
}

// fill NaN values into data from Prometheus to fill Gaps (hole in chart is to show missing metrics from Prometheus)
const fillGaps = (chart, start, end, step) => {
    chart.data.datasets.forEach((dataSet, index) => {
        // detect missing data in response
        for (var i = dataSet.data.length - 2; i > 0 ; i--) {
            if ((dataSet.data[i + 1].t - dataSet.data[i].t) > (1100 * step)) {
                for (var steps = (dataSet.data[i + 1].t - dataSet.data[i].t) / (step * 1000); steps > 1; steps--) {
                    dataSet.data.splice(i + 1, 0,
                        { t: new Date(dataSet.data[i + 1].t.getTime() - step * 1000), v: Number.NaN });	
                }
            }
        }
        // at the start of time range
        if (Math.abs(start - dataSet.data[0].t) > (1100 * step)) {
            for (var i = Math.abs(start - dataSet.data[0].t) / (step * 1000); i > 1; i--) {
                chart.data.datasets[index].data.unshift({ t: new Date(dataSet.data[0].t.getTime() - step * 1000), v: Number.NaN });
            }
        }

        // at the end of time range
        if (Math.abs(end - dataSet.data[dataSet.data.length - 1].t) > (1100 * step)) {
            for (var i = Math.abs(end - dataSet.data[dataSet.data.length - 1].t) / (step * 1000); i > 1; i--) {
                chart.data.datasets[index].data.push({ t: new Date(dataSet.data[chart.data.datasets[index].data.length - 1].t.getTime() + step * 1000), v: Number.NaN });
            }
        }
    });
}

export {
    setTimeAxesOptions,
    spanGaps,
};
