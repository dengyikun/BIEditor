import config from '../config'

const actions = {

    getCodeData: (chartId, model, callback) => (dispatch) => {
        model = model == 'drag' ? 1 : 2
        fetch(`${config.mgmtApiHost}/chart/get/${config.request.token}/${chartId}/${model}`, {
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
                    if (callback) {
                        callback()
                    }
                    const dataSet = {
                        sourceId: data.data.sourceId,    //数据源Id
                        type: data.data.type,   //图表类型
                        sql: data.data.sql || '',  //sql语句
                        dimensions: data.data.dimensions || [{
                            comment: "空",
                            name: "null",
                            sort: "降序"
                        }],
                        values: data.data.values || []
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
                }
            })
    },

    saveChart: (callback) => (dispatch, getState) => {
        const dataSet = getState().dataSet
        const chartSet = getState().chartSet
        const editorType = getState().editorType
        const data = {
            chartId: chartSet.chartId,
            title: chartSet.title,
            style: JSON.stringify(chartSet.style),
            number: 0,
            model: editorType == 'drag' ? 1 : 2,
            filter: '',
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

    getChart: (callback) => (dispatch, getState) => {
        const data = getState().dataSet
        let url
        if (data.type == 'table') {
            url = `${config.dataApiHost}/data/table/data/${config.request.token}`
        } else if (data.type == 'map-china-dataRange') {
            url = `${config.dataApiHost}/data/map/data/${config.request.token}`
        } else {
            url = `${config.dataApiHost}/data/other/data/${config.request.token}`
        }

        fetch(url, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
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