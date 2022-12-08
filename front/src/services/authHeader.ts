export default function authHeader() {
  const data = localStorage.getItem('user') || 'nope';
  const user = JSON.parse(data);

  if (user && user.accessToken) {
    // for Node.js Express back-end
    return { 'x-access-token': user.accessToken };
    // another types
    // return { Authorization: 'Bearer ' + user.accessToken };
  } else {
    return {};
  }
}
