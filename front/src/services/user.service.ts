import { AxiosResponse } from 'axios';
import authHeader from './authHeader';
import { userI } from 'src/store/userSlice';
import { UserInfoPublic } from 'src/store/chatSlice';
import { myAxios } from 'src';

const API_URL = process.env.REACT_APP_AUTH_URL +'/user'

class UserService {

  getMe() {
    const storageData = localStorage.getItem('access_token') || '{}';
    const token = JSON.parse(storageData);
    return myAxios.get(API_URL + '/getMe')
  }

  setUserName(data: {id: string, name: string}) {
    return myAxios.patch(API_URL + '/setName', data);
  }

  uploadAvatar(fileData: FormData): Promise<{data:userI}> {
    return myAxios.post(API_URL + '/upload', fileData);
  }

  findAvatar(avatarname: string){
    return myAxios.get(API_URL + `/avatar/${avatarname}`);
  }

  getById(id: number): Promise<AxiosResponse<UserInfoPublic>> {
    return myAxios.get(API_URL + '/' + id);
  }

  getUsers() {
    return myAxios.get("https://swapi.dev/api" + '/starships');
  }

  getPublicContent() {
    return myAxios.get(API_URL + 'all');
  }

  getUserBoard() {
    return myAxios.get(API_URL + 'user');
  }

  getModeratorBoard() {
    return myAxios.get(API_URL + 'mod');
  }

  getAdminBoard() {
    return myAxios.get(API_URL + 'admin');
  }

  getStats(id: number) {
    const res = myAxios.get(API_URL + '/stats/' + id);
    return res;
  }
}

export default new UserService();