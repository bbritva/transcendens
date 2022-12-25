import axios from 'axios';
import authHeader from './authHeader';

const API_URL = process.env.REACT_APP_USERS_URL;

class UserService {
  getUsers() {
    return axios.get(API_URL + '/starships');
  }

  getMe() {
    const storageData = localStorage.getItem('access_token') || '{}';
    const token = JSON.parse(storageData);
    return axios.get(API_URL + '/getMe')
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