import config from '../config'

const actions = {

    getPanel: (panelId, callback) => (dispatch) => {
        fetch(`${config.mgmtApiHost}/panel/chart/${config.request.token}/${panelId}`, {
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
                        callback(data.data.projectId)
                    }
                    data.data.filter = data.data.filter ? JSON.parse(data.data.filter) : []
                    data.data.content = data.data.content ? JSON.parse(data.data.content) : {
                            layout: [],
                            items: []
                        }
                    data.data.background = data.data.background ? JSON.parse(data.data.background) : {}
                    dispatch({
                        type: 'SETPANEL',
                        payload: data.data
                    })
                }
            })
    },

    getCharts: (projectId, parameter, callback) => (dispatch) => {
        fetch(`${config.mgmtApiHost}/chart/list/${config.request.token}/${projectId}/0/-1?parameter=${parameter}`, {
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
                        callback(data.data.dataList)
                    }
                }
            })
    },

    setContent: (content) => ({
        type: 'SETCONTENT',
        payload: content
    }),

    savePanel: (callback) => (dispatch, getState) => {
        const state = getState()
        let charts = []
        state.content.items.map((item) => {
            if (item.type === 'chart') {
                charts.push(item.data)
            }
        })
        const data = {
            panelId: state.panelId,
            theme: state.theme,
            background: JSON.stringify(state.background),
            filter: JSON.stringify(state.filter),
            content: JSON.stringify(state.content),
            charts
        }
        fetch(`${config.mgmtApiHost}/panel/set/${config.request.token}`, {
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
                if (data.code === 200) {
                    if (callback) {
                        callback(data.data.dataList)
                    }
                }
            })
    },

    setTheme: (theme) => ({
        type: 'SETTHEME',
        payload: theme
    }),

    setBackground: (background) => ({
        type: 'SETBACKGROUND',
        payload: background
    }),

    setFilter: (filter) => ({
        type: 'SETFILTER',
        payload: filter
    }),

};

export default actions;