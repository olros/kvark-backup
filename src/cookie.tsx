import Cookies from 'universal-cookie';

const cookies = new Cookies();
export const setCookie = (key: string, value: string, duration = 3600 * 24000 * 30) => {
  cookies.set(key, value, { path: '/', expires: new Date(Date.now() + duration) });
};

export const getCookie = (key: string): string | undefined => {
  return cookies.get(key);
};

export const removeCookie = (key: string) => {
  cookies.remove(key, { path: '/' });
};

export default { setCookie, getCookie, removeCookie };
