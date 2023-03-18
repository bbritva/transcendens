import { myAxios } from "src";

const API_URL = process.env.REACT_APP_AUTH_URL + '/game'

class GameService {
  getGames(userId: number) {
    return myAxios.get(API_URL + '/byUser', {
      params: { userId: userId }
    });
  }
}

export default new GameService();