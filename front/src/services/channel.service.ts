import axios from 'axios';

const API_URL = process.env.REACT_APP_AUTH_URL + '/channel';

class ChannelService {
  get(id: string) {
    return axios.get(API_URL + '/' + id)
  }

  create(name: string, ownerId: string) {
    return axios.post(
      API_URL + 'connect',
      {
        name,
        ownerId
      }
      );
  }

  setName(oldName: string, newName: string) {
    return axios.post(
      API_URL + 'connect',
      {
        oldName,
        newName
      }
      );
  }
}

export default new ChannelService();