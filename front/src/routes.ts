import AccountPage from "src/pages/Account/AccountPage";
import ChatPage from "src/pages/Chat/ChatPage";
import GamePage from "src/pages/Game/GamePage";
import HomePage from "src/pages/Home/HomePage";

// other
import {FC} from "react";

// interface
interface Route {
    key: string,
    title: string,
    path: string,
    enabled: boolean,
    component: FC<{}>
}

export const routes: Array<Route> = [
    {
        key: 'home-route',
        title: 'HomePage',
        path: '/',
        enabled: true,
        component: HomePage
    },
    {
        key: 'game-route',
        title: 'GamePage',
        path: '/game',
        enabled: true,
        component: GamePage
    },
    {
        key: 'account-route',
        title: 'AccountPage',
        path: '/account',
        enabled: true,
        component: AccountPage
    },
    {
        key: 'chat-route',
        title: 'ChatPage',
        path: '/chat',
        enabled: true,
        component: ChatPage
    },
]