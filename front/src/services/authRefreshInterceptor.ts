import axios from 'axios';
import { refresh } from 'src/store/authActions';
import { store } from 'src/store/store'
import authService from './auth.service';

export const authRefreshInterceptor = () => {
  const { dispatch } = store;
  axios.interceptors.response.use(
    (res) => {
      return res;
    },
    async (err) => {
      const originalConfig = err.config;

      if (originalConfig.url !== "/auth/signin" && err.response) {
        // Access Token was expired
        if (err.response.status === 401 && !originalConfig._retry) {
          localStorage.removeItem("access_token");
          originalConfig._retry = true;
          // try {
            const rs = await authService.refresh();
            localStorage.setItem("access_token", JSON.stringify(rs.data.access_token));
            localStorage.setItem("refreshToken", JSON.stringify(rs.data.refreshToken));
            // console.log('refresh response', rs.data);
            // const { accessToken } = rs.data;
            // dispatch(refresh()).unwrap();
            return axios(originalConfig);
          // } catch (_error) {
          //   return Promise.reject(_error);
          // }
        }
      }

      return Promise.reject(err);
    }
  );
};