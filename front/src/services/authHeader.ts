export default function authHeader() {
  const storageData = localStorage.getItem('user') || '{}';
  const user = JSON.parse(storageData);

  if (user && user.accessToken) {
    // for Node.js Express back-end
    return { 'x-access-token': user.accessToken };
    // another types
    // return { Authorization: 'Bearer ' + user.accessToken };
  } else {
    return {};
  }
}
