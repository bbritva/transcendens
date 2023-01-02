import axios from "axios";

export default function authHeader() {
  const headers = {'authorization': ''};
  const interceptor = axios.interceptors.request.use(
    config => {
      const storageData = localStorage.getItem('access_token') || undefined;
      if (storageData){
        const token = JSON.parse(storageData);
        // for Node.js Express back-end
        // config.headers = {... config.headers, 'x-access-token': `${token}`} ;
        // another types
        config.headers = {... config.headers, 'Authorization': `Bearer ${token}`};
      }
      return config;
    },
    error => {
      return Promise.reject(error);
    }
  );
  localStorage.setItem("interceptor", interceptor.toString());
  return headers;
}
