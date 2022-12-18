import axios from 'axios';
import authHeader from './authHeader';

const API_URL = process.env.REACT_APP_AUTH_URL + '/user';

class UserService {
  getMe() {
    const storageData = localStorage.getItem('access_token') || '{}';
    const token = JSON.parse(storageData);
    console.log('INTERCEPTOR HEADER', token)
      //config.headers = {... config.headers, 'x-access-token': `${token?.access_token}`} ;
      // another types
    const headers = {'Authorization': `Bearer ${token}`};
    return axios.get(API_URL + '/getMe', {headers: headers})
  }
  getPublicContent() {
    return axios.get(API_URL + 'all');
  }

  getUserBoard() {
    return axios.get(API_URL + 'user');
  }

  getModeratorBoard() {
    return axios.get(API_URL + 'mod');
  }

  getAdminBoard() {
    return axios.get(API_URL + 'admin');
  }
}

export default new UserService();