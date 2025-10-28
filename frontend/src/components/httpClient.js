import axios from "axios";
import Cookies from "js-cookie";

const httpClient = axios.create({
    baseURL: "http://localhost:5000",
    withCredentials: true
});

httpClient.interceptors.request.use(function (config) {
    const csrfToken = Cookies.get('csrf_token');
    if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
    }
    return config;
});

export default httpClient;