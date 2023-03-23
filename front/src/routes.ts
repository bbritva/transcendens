import ChatPage, { ChatPageProps } from "src/pages/Chat/ChatPage";
import GamePage, { GamePageProps } from "src/pages/Game/GamePage";
import HomePage from "src/pages/Home/HomePage";
import {FC} from "react";
import AccountPageWrapper from "./pages/Account/AccountPageWrapper";


// interface
export interface Route {
    key: string,
    title: string,
    path: string,
    enabled: boolean,
    component: FC<{}> | FC<ChatPageProps>| FC<GamePageProps> | FC<{twoFaOpen: boolean}>,
}

export const routes: Array<Route> = [
    {
        key: 'home-route',
        title: 'Home',
        path: '/',
        enabled: true,
        component: HomePage
    },
    {
        key: 'game-route',
        title: 'Game',
        path: '/game',
        enabled: true,
        component: GamePage
    },
    {
        key: 'chat-route',
        title: 'Chat',
        path: '/chat',
        enabled: true,
        component: ChatPage
    },
    {
        key: 'account-route',
        title: 'Account',
        path: '/account',
        enabled: true,
        component: AccountPageWrapper
    },
]