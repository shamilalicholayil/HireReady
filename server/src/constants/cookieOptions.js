const REFRESH_TOKEN_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const getRefreshTokenCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: REFRESH_TOKEN_COOKIE_MAX_AGE_MS,
});

const getRefreshTokenClearCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
});

module.exports = {
  REFRESH_TOKEN_COOKIE_MAX_AGE_MS,
  getRefreshTokenCookieOptions,
  getRefreshTokenClearCookieOptions,
};
