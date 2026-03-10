import httpStatus from 'http-status';
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import config from '@/config';
import { ApiResponse } from '@/utils/apiResponse';
import { User, Session } from '@/database/models';
import { redis } from '@/config/redis.config';

const verifyJwt = promisify(jwt.verify);

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ApiResponse.error(
        res,
        'Access token required',
        httpStatus.UNAUTHORIZED
      );
    }

    const token = authHeader.split(' ')[1];

    // Check if token is blacklisted (logged out)
    const isBlacklisted = await redis.get(`blacklist:${token}`);
    if (isBlacklisted) {
      return ApiResponse.error(
        res,
        'Token has been revoked',
        httpStatus.UNAUTHORIZED
      );
    }

    // Verify token
    let decoded;
    try {
      decoded = await verifyJwt(token, config.jwt.accessSecret);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return ApiResponse.error(
          res,
          'Token has expired',
          httpStatus.UNAUTHORIZED
        );
      }
      if (error.name === 'JsonWebTokenError') {
        return ApiResponse.error(
          res,
          'Invalid token',
          httpStatus.UNAUTHORIZED
        );
      }
      throw error;
    }

    // Check token type
    if (decoded.type !== 'access') {
      return ApiResponse.error(
        res,
        'Invalid token type',
        httpStatus.UNAUTHORIZED
      );
    }

    // Get user from cache or database
    let user = await redis.get(`user:${decoded.sub}`);

    if (user) {
      user = JSON.parse(user);
    } else {
      user = await User.findByPk(decoded.sub, {
        attributes: { exclude: ['password'] },
      });

      if (!user) {
        return ApiResponse.error(
          res,
          'User not found',
          httpStatus.UNAUTHORIZED
        );
      }

      // Cache user for 5 minutes
      await redis.setex(
        `user:${decoded.sub}`,
        300,
        JSON.stringify(user.toJSON())
      );
    }

    // Check if user is active
    if (user.status !== 'active') {
      return ApiResponse.error(
        res,
        'Account is not active',
        httpStatus.FORBIDDEN
      );
    }

    // Check if email is verified (if required)
    if (config.auth.requireEmailVerification && !user.emailVerified) {
      return ApiResponse.error(
        res,
        'Please verify your email',
        httpStatus.FORBIDDEN
      );
    }

    // Attach user and token info to request
    req.user = user;
    req.tokenInfo = {
      token,
      ...decoded,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return ApiResponse.error(
      res,
      'Authentication failed',
      httpStatus.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * Optional authentication middleware
 * Attaches user to request if token is valid, but doesn't require it
 */
const optionalAuthenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = await verifyJwt(token, config.jwt.accessSecret);

    if (decoded.type === 'access') {
      const user = await User.findByPk(decoded.sub, {
        attributes: { exclude: ['password'] },
      });

      if (user && user.status === 'active') {
        req.user = user;
        req.tokenInfo = { token, ...decoded };
      }
    }
  } catch (error) {
    // Silently fail for optional auth
  }

  next();
};

/**
 * Refresh token authentication
 */
const authenticateRefreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return ApiResponse.error(
        res,
        'Refresh token required',
        httpStatus.UNAUTHORIZED
      );
    }

    // Verify token
    const decoded = await verifyJwt(refreshToken, config.jwt.refreshSecret);

    if (decoded.type !== 'refresh') {
      return ApiResponse.error(
        res,
        'Invalid token type',
        httpStatus.UNAUTHORIZED
      );
    }

    // Check if session exists and is valid
    const session = await Session.findOne({
      where: {
        token: refreshToken,
        userId: decoded.sub,
        isRevoked: false,
      },
    });

    if (!session) {
      return ApiResponse.error(
        res,
        'Session not found or revoked',
        httpStatus.UNAUTHORIZED
      );
    }

    // Check if session has expired
    if (session.expiresAt < new Date()) {
      await session.update({ isRevoked: true });
      return ApiResponse.error(
        res,
        'Session has expired',
        httpStatus.UNAUTHORIZED
      );
    }

    req.session = session;
    req.userId = decoded.sub;
    req.tokenInfo = decoded;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return ApiResponse.error(
        res,
        'Refresh token has expired',
        httpStatus.UNAUTHORIZED
      );
    }
    return ApiResponse.error(
      res,
      'Invalid refresh token',
      httpStatus.UNAUTHORIZED
    );
  }
};

export {
  authenticate,
  optionalAuthenticate,
  authenticateRefreshToken,
};
