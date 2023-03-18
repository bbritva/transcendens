import { myAxios } from "src";

const API_URL = process.env.REACT_APP_AUTH_URL + '/channel';
class ChannelService {
  get(id: string) {
    return myAxios.get(API_URL + '/' + id)
  }

  create(name: string, ownerId: string) {
    return myAxios.post(
      API_URL + 'connect',
      {
        name,
        ownerId
      }
      );
  }

  setName(oldName: string, newName: string) {
    return myAxios.post(
      API_URL + 'connect',
      {
        oldName,
        newName
      }
      );
  }
}

export default new ChannelService();