const COOKIE_NAME = "auth-token";
const COOKIE_PATH = "/";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60;

export function setAuthCookie() {
  document.cookie = `${COOKIE_NAME}=true; path=${COOKIE_PATH}; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function clearAuthCookie() {
  document.cookie = `${COOKIE_NAME}=; path=${COOKIE_PATH}; max-age=0`;
}
