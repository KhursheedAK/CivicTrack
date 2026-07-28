import { Response } from 'express';

const ACCESS_TOKEN_MAX_AGE_MS = 15 * 60 * 1000;

export function setAuthCookies(
  response: Response,
  accessToken: string,
  refreshToken: string,
  isProduction: boolean,
  refreshTokenMaxAgeMs: number,
): void {
  response.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: ACCESS_TOKEN_MAX_AGE_MS,
    path: '/',
  });

  response.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: refreshTokenMaxAgeMs,
    path: '/',
  });
}

export function clearAuthCookies(response: Response, isProduction: boolean): void {
  response.clearCookie('access_token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    path: '/',
  });
  response.clearCookie('refresh_token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    path: '/',
  });
}
