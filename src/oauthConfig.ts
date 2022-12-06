const authEndpoint = 'https://api.intra.42.fr/oauth/authorize';

const scopes = [
  'public',
];

export const getAuthorizeHref = (stateArray: Uint32Array): string => {
  const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
  const redirectUri = process.env.REACT_APP_REDIRECT_URI;
  return `${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join("%20")}&state=${stateArray.join('_')}&response_type=code`;
}

