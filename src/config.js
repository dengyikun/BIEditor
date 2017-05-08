const getEnv = () => {
    let env = 'dev'
    if (window.location.hostname.indexOf('www') != -1) {
        env = 'prd'
    }
    return env
}

const getDataApiHost = () => {
    let env = getEnv()
    let apiHost = ''
    if (env === 'dev') {
        apiHost = 'http://222.85.149.5:3342'
    }
    return apiHost
}

const getMgmtApiHost = () => {
    let env = getEnv()
    let apiHost = ''
    if (env === 'dev') {
        apiHost = 'http://222.85.149.5:3343'
    }
    return apiHost
}

const getRequest = () => {
    const url = location.search //获取url中"?"符后的字串
    let request = {}
    if (url.indexOf("?") != -1) {
        let str = url.substr(1)
        let strs = str.split("&")
        for (let i = 0; i < strs.length; i++) {
            request[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1])
        }
    }
    return request
}

export default {
    env: getEnv(),
    dataApiHost: getDataApiHost(),
    mgmtApiHost: getMgmtApiHost(),
    request: getRequest(),
    getValue: (object, path) => {
        let o = object
        path = path.replace(/\[(\w+)\]/g, '.$1')
        path = path.replace(/^\./, '')
        let a = path.split('.')
        while (a.length) {
            const n = a.shift()
            if (n in o) {
                o = o[n]
            } else {
                return
            }
        }
        return o
    },
    setValue: (object, path, value) => {
        let o = object
        path = path.replace(/\[(\w+)\]/g, '.$1')
        path = path.replace(/^\./, '')
        let a = path.split('.')
        while (a.length - 1) {
            const n = a.shift()
            if (n in o) {
                o = o[n]
            } else {
                o[n] = {}
                o = o[n]
            }
        }
        o[a[0]] = value
    },
}
