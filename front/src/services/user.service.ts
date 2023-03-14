import axios, { AxiosResponse } from 'axios';
import authHeader from './authHeader';
import { userI } from 'src/store/userSlice';
import { UserInfoPublic } from 'src/store/chatSlice';

const API_URL = process.env.REACT_APP_AUTH_URL +'/user'

class UserService {

  getMe() {
    const storageData = localStorage.getItem('access_token') || '{}';
    const token = JSON.parse(storageData);
    return axios.get(API_URL + '/getMe')
  }

  uploadAvatar(fileData: FormData): Promise<{data:userI}> {
    return axios.post(API_URL + '/upload', fileData);
  }

  findAvatar(avatarname: string){
    return axios.get(API_URL + `/avatar/${avatarname}`);
  }

  getById(id: number, controller: AbortController): Promise<AxiosResponse<UserInfoPublic>> {
    return axios.get(API_URL + '/' + id, {signal: controller.signal});
  }

  getUsers() {
    return axios.get("https://swapi.dev/api" + '/starships');
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

  getStats(id: number) {
    return axios.get(API_URL + '/stats/' + id);
  }
}

export default new UserService();