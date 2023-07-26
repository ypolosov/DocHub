export function Base64ToUTF8(base64) {
  return decodeURIComponent(global.atob(base64).split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
}

export function Base64URLToUTF8(base64url) {

  let base64 = base64url
                        .replaceAll('-', '+')
                        .replaceAll('_', '/');

  switch (base64.length % 4) {
    case 0: break;
    case 2: base64 += '=='; break;
    case 3: base64 += '='; break;
    default: throw new Error(`Illegal base64 safe url string: ${base64url}`);
  }

  return decodeURIComponent(global.atob(base64).split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
}
