export default class AxiosHttpClient { 
    constructor(axios) {
        this.axios = axios;
    }

    post(url, data, options) {
        return this.axios.post(url, data, options);
    }

    get(url, options) {
        return this.axios.get(url, options);
    }
}