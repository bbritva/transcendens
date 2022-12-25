import axios from 'axios';
import { logout, refresh } from 'src/store/authActions';
import { store } from 'src/store/store'

const API_URL = process.env.REACT_APP_AUTH_URL;

export const authRefreshInterceptor = () => {
  const { dispatch } = store;
  axios.interceptors.response.use(
    (res) => {
      return res;
    },
    async (err) => {
      const originalConfig = err.config;
      if (
        originalConfig.url !== API_URL + "/auth/refresh"
        && originalConfig.url !== API_URL + "/auth"
        && err.response
        ) {
        // Access Token was expired
        if (err.response.status === 401 && !originalConfig._retry) {
          localStorage.removeItem("access_token");
          originalConfig._retry = true;
          try {
            await dispatch(refresh()).unwrap();
            return axios(originalConfig);
          } catch (_error) {
            return Promise.reject(_error);
          }
        }
      }
      else  dispatch(logout);
      return Promise.reject(err);
    }
  );
};