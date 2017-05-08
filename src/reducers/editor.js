/**
 * Created by dyk on 2017/1/14.
 */

const initialState = {
    editorType: 'code',
    dataSet: {
        sourceId: '',    //数据源Id
        type: '',   //图表类型
        sql: '',  //sql语句
        dimensions: [],
        values: []
    },
    chartSet: {
        chartId: "",
        title: "",
        style: ""
    },
    chart: {}
}
export default (state = initialState, action) => {
    switch (action.type) {
        case 'SETCHART':
            return {...state, chart: action.payload}
        case 'SETDATASET':
            return {...state, dataSet: action.payload}
        case 'SETDATASETDIMENSIONS':
            return {...state, dataSet: {...state.dataSet, dimensions: action.payload}}
        case 'SETDATASETVALUES':
            return {...state, dataSet: {...state.dataSet, values: action.payload}}
        case 'SETDATASETSQL':
            return {...state, dataSet: {...state.dataSet, sql: action.payload}}
        case 'SETDATASETTYPE':
            return {...state, dataSet: {...state.dataSet, type: action.payload}}
        case 'SETCHARTSET':
            return {...state, chartSet: action.payload}
        case 'SETCHARTSETTITLE':
            return {...state, chartSet: {...state.chartSet, title: action.payload}}
        case 'SETCHARTSETSTYLE':
            return {...state, chartSet: {...state.chartSet, style: action.payload}}
        default:
            return state
    }
}