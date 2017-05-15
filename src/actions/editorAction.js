import config from '../config'

const actions = {

    getCodeData: (chartId, callback) => (dispatch) => {
        fetch(`${config.dataApiHost}/data/chart/${config.request.token}/${chartId}`, {
            method: "GET",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (response.status >= 400) {
                    throw new Error("Bad response from server")
                }
                return response.json()
            })
            .then(data => {
                if (data.code === 200) {
                    debugger
                    const dataSet = {
                        sourceId: data.data.sourceId,    //数据源Id
                        type: data.data.type,   //图表类型
                        sql: data.data.sql || '',  //sql语句
                        dimensions: data.data.dimensions || [{
                            comment: "空",
                            name: "null",
                            sort: "降序"
                        }],
                        model: data.data.model || 2,
                        values: data.data.values || [],
                        codeFilter: data.data.codeFilter || [],
                    }
                    dispatch({
                        type: 'SETDATASET',
                        payload: dataSet
                    })
                    const chartSet = {
                        chartId: data.data.chartId,
                        title: data.data.title || '',
                        style: data.data.style ? JSON.parse(data.data.style) : {
                                showX: true,
                                showY: true,
                                yName: '',
                                pieShowName: true
                            }
                    }
                    dispatch({
                        type: 'SETCHARTSET',
                        payload: chartSet
                    })
                    if (callback) {
                        callback(data.data.sourceId, dataSet)
                    }
                }
            })
    },

    getSourceTable: (sourceId, parameter) => (dispatch, getState) => {
        fetch(`${config.mgmtApiHost}/source/sourceTable/0/${sourceId}/0/-1?parameter=${parameter || ''}`, {
            method: "GET",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (response.status >= 400) {
                    throw new Error("Bad response from server")
                }
                return response.json()
            })
            .then(data => {
                if (data.code === 200) {
                    dispatch({
                        type: 'SETSOURCE',
                        payload: data.data
                    })
                }
            })
    },

    getChart: (dataSet, callback) => (dispatch, getState) => {
        dataSet = getState().dataSet
        fetch(`${config.dataApiHost}/data/all/${config.request.token}`, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataSet)
        })
            .then(response => {
                if (callback) {
                    callback()
                }
                if (response.status >= 400) {
                    throw new Error("Bad response from server")
                }
                return response.json()
            })
            .then(data => {
                if (data.code === 200 && data.data) {
                    if (callback) {
                        callback()
                    }
                    const set = {
                        type: getState().dataSet.type,
                        title: getState().chartSet.title,
                        style: getState().chartSet.style
                    }
                    const chart = data.data
                    let option = {
                        type: set.type,
                        title: {
                            text: set.title,
                            left: '20xp',
                            top: '15px',
                            textStyle: {
                                fontSize: '18',
                                fontWeight: 'normal'
                            }
                        },
                        legend: {
                            data: chart.legend,
                            textStyle: {
                                fontSize: '12'
                            },
                            top: '60px',
                            left: '20xp',
                            itemGap: 7,
                            formatter: ' {name}  ',
                            itemWidth: 20,
                            itemHeight: 10
                        },
                        grid: {
                            left: '25px',
                            right: '25px',
                            top: '110px',
                            bottom: '25x',
                            containLabel: true
                        },
                        series: chart.series,
                        tooltip: {
                            trigger: 'axis'
                        },
                        xAxis: [
                            {
                                show: set.style.showX,
                                data: chart.xAxis
                            }
                        ],
                        yAxis: [
                            {
                                show: set.style.showY,
                                type: 'value',
                                nameLocation: 'middle',
                                nameGap: 45,
                                name: set.style.yName
                            }
                        ],
                    }
                    switch (set.type) {
                        case "table":
                            let columns = []
                            let dataSource = []
                            chart.titles.map((val) => {
                                columns.push({
                                    title: val,
                                    dataIndex: val,
                                    width: 100 / chart.titles.length + '%',
                                })
                            })
                            chart.rows.map((val) => {
                                let obj = {}
                                chart.titles.map((v, i) => {
                                    obj[v] = val[i]
                                })
                                dataSource.push(obj)
                            })
                            option = {
                                ...option,
                                columns: columns,
                                dataSource: dataSource,
                                title: set.title,
                            }
                            break
                        case "unit-value":
                            option = {
                                ...option,
                                ...chart
                            }
                            break
                        case "line-stack":
                            option = {
                                ...option
                            }
                            break
                        case "area-stack":
                            option = {
                                ...option
                            }
                            break
                        case "bar-tick-align":
                            option = {
                                ...option
                            }
                            break
                        case "bar-y-category":
                            option = {
                                ...option,
                                xAxis: [
                                    {
                                        show: set.style.showY,
                                        type: 'value',
                                        nameLocation: 'middle',
                                        nameGap: 25,
                                        name: set.style.yName
                                    }
                                ],
                                yAxis: [
                                    {
                                        show: set.style.showX,
                                        data: chart.xAxis
                                    }
                                ]
                            }
                            break
                        case "pie-simple":
                            option = {
                                ...option,
                                tooltip: {
                                    trigger: 'item',
                                    formatter: "{a} <br/>{b}: {c} ({d}%)"
                                },
                                xAxis: null,
                                yAxis: null,
                            }
                            option.series.map((series) => {
                                series.label.normal.formatter =
                                    set.style.pieShowName ? '{b}' : '{d}%'
                            })
                            break
                        case "pie-doughnut":
                            option = {
                                ...option,
                                tooltip: {
                                    trigger: 'item',
                                    formatter: "{a} <br/>{b}: {c} ({d}%)"
                                },
                                xAxis: null,
                                yAxis: null,
                            }
                            option.series.map((series) => {
                                series.label.normal.formatter =
                                    set.style.pieShowName ? '{b}' : '{d}%'
                            })
                            break
                        case "map-china-dataRange":
                            option = {
                                ...option,
                                tooltip: {
                                    trigger: 'item'
                                },
                                visualMap: {
                                    min: chart.min,
                                    max: chart.max,
                                    left: '20px',
                                    bottom: '20px',
                                    text: ['高', '低'],           // 文本，默认为数值文本
                                    calculable: true
                                },
                                xAxis: null,
                                yAxis: null,
                            }
                            option.series[0].top = '90px'
                            option.series[0].bottom = '30px'
                            break
                        default:
                            break
                    }
                    dispatch({
                        type: 'SETCHART',
                        payload: option
                    })
                }
            })
    },

    saveChart: (callback) => (dispatch, getState) => {
        const dataSet = getState().dataSet
        const chartSet = getState().chartSet
        const data = {
            chartId: chartSet.chartId,
            title: chartSet.title,
            style: JSON.stringify(chartSet.style),
            number: 0,
            model: dataSet.model,
            codeFilter: JSON.stringify(dataSet.codeFilter),
            relevanceTable: '',
            type: dataSet.type,
            sql: dataSet.sql,
            dimensions: dataSet.dimensions,
            values: dataSet.values
        }
        fetch(`${config.mgmtApiHost}/chart/update/${config.request.token}`, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(response => {
                if (response.status >= 400) {
                    throw new Error("Bad response from server")
                }
                return response.json()
            })
            .then(data => {
                if (data.code === 200 && callback) {
                    callback()
                }
            })
    },

    setDataSetDimensions: (Dimensions) => ({
        type: 'SETDATASETDIMENSIONS',
        payload: Dimensions
    }),

    setDataSetValues: (values) => ({
        type: 'SETDATASETVALUES',
        payload: values
    }),

    setDataSetSql: (sql) => ({
        type: 'SETDATASETSQL',
        payload: sql
    }),

    setDataSetType: (type) => ({
        type: 'SETDATASETTYPE',
        payload: type
    }),

    setDataSetCodeFilter: (codeFilter) => ({
        type: 'SETDATASETCODEFILTER',
        payload: codeFilter
    }),

    setChartSetTitle: (name) => ({
        type: 'SETCHARTSETTITLE',
        payload: name
    }),

    setChartSetStyle: (style) => ({
        type: 'SETCHARTSETSTYLE',
        payload: style
    }),

};

export default actions;