export function Base64ToUTF8(base64) {
  return decodeURIComponent(global.atob(base64).split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
}
