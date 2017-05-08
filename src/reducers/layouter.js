/**
 * Created by dyk on 2017/1/14.
 */

const initialState = {
    panelId: '',
    theme: '',
    background: {},
    charts: [],
    filter: [],
    content: {
        layout: [],
        items: []
    },
    projectId: '',
    panelName: '',
    publicUrl: '',
    privateUrl: ''

}
export default (state = initialState, action) => {
    switch (action.type) {
        case 'SETPANEL':
            return {...state, ...action.payload}
        case 'SETCONTENT':
            return {...state, content: {...action.payload}}
        case 'SETTHEME':
            return {...state, theme: action.payload}
        case 'SETBACKGROUND':
            return {...state, background: {...action.payload}}
        case 'SETFILTER':
            return {...state, filter: action.payload}
        default:
            return state
    }
}