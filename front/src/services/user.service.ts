import axios from 'axios';
import authHeader from './authHeader';

const API_URL = process.env.REACT_APP_USERS_URL;

class UserService {
  getUsers() {
    return axios.get(API_URL + '/starships');
  }

  getPublicContent() {
    return axios.get(API_URL + 'all');
  }

  getUserBoard() {
    return axios.get(API_URL + 'user', { headers: authHeader() });
  }

  getModeratorBoard() {
    return axios.get(API_URL + 'mod', { headers: authHeader() });
  }

  getAdminBoard() {
    return axios.get(API_URL + 'admin', { headers: authHeader() });
  }
}

export default new UserService();