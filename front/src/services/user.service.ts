import axios from 'axios';
import authHeader from './authHeader';

const API_URL = process.env.REACT_APP_USERS_URL;

class UserService {
<<<<<<< HEAD
=======
  getUsers() {
    return axios.get("https://swapi.dev/api" + '/starships');
  }

>>>>>>> 0ef4b54 (littl bugs)
  getMe() {
    const storageData = localStorage.getItem('access_token') || '{}';
    const token = JSON.parse(storageData);
    return axios.get(API_URL + '/getMe')
  }
  getUsers() {
    return axios.get(API_URL + '/starships');
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