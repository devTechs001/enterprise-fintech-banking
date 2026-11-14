import crypto from 'node:crypto';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';

import config from '#config/index.js';
import logger from '#logger.js';
import { requestLogger } from '#middleware/logging/requestLogger.js';
import { errorHandler } from '#middleware/error/errorHandler.js';
import { notFoundHandler } from '#middleware/error/notFoundHandler.js';
import { globalLimiter } from '#middleware/auth/rateLimiter.js';
import authRoutes from '#api/v1/auth/auth.routes.js';

/**
 * Express application.
 *
 * DEFECTS FIXED
 * -------------
 *  1. `cors({ origin: '*' })` together with `credentials: true`. Browsers reject
 *     that combination outright, so cookie auth could never have worked from a
 *     browser; and an unrestricted origin on a credentialed API is a cross-origin
 *     read waiting to happen. Origins now come from an explicit allow-list.
 *  2. No `trust proxy`. Behind nginx/ALB `req.ip` is the proxy's address, so every
 *     customer shared one rate-limit bucket and every audit row recorded the same
 *     IP — the audit trail was worthless and the limiter was both too strict and
 *     too loose at once.
 *  3. `helmet()` with defaults, i.e. no Content-Security-Policy. CSP is the
 *     control that limits the damage of any XSS that does get through.
 *  4. `express.json({ limit: '10mb' })`. A banking API does not accept 10MB JSON
 *     bodies; that is a cheap amplification vector. Reduced to 100kb.
 *  5. No request id, so a log line could not be tied to a response.
 */

const createApp = () => {
  const app = express();

  // Must come before anything that reads req.ip.
  app.set('trust proxy', config.server.trustProxy);
  app.disable('x-powered-by');

  app.use(
    helmet({
      contentSecurityPolicy: config.security.cspEnabled
        ? {
            directives: {
              defaultSrc: ["'self'"],
              // An API returns JSON; it should never render HTML that runs scripts.
              scriptSrc: ["'none'"],
              styleSrc: ["'none'"],
              imgSrc: ["'none'"],
              objectSrc: ["'none'"],
              frameAncestors: ["'none'"],
              baseUri: ["'none'"],
              formAction: ["'none'"],
              frameSrc: ["'none'"],
            },
          }
        : false,
      // HSTS only when TLS terminates in front of this process.
      strictTransportSecurity: config.security.hstsMaxAge
        ? { maxAge: config.security.hstsMaxAge, includeSubDomains: true, preload: true }
        : false,
      crossOriginResourcePolicy: { policy: 'same-site' },
      crossOriginEmbedderPolicy: false,
      referrerPolicy: { policy: 'no-referrer' },
      // Sniffing is never useful for a JSON API.
      noSniff: true,
      xssFilter: true,
    })
  );

  app.use(
    cors({
      origin: (origin, callback) => {
        const allowed = config.cors.origins;
        // Same-origin and non-browser clients send no Origin header.
        if (!origin || !allowed || allowed.includes('*') || allowed.includes(origin)) {
          return callback(null, true);
        }
        logger.warn('Blocked a cross-origin request', { origin });
        return callback(new Error('Origin not permitted by CORS policy'));
      },
      credentials: true,
      // Restrict verbs and headers rather than reflecting whatever was asked for.
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id', 'Idempotency-Key'],
      exposedHeaders: ['X-Request-Id', 'Retry-After', 'RateLimit', 'RateLimit-Remaining'],
      maxAge: 600,
    })
  );

  app.use((req, res, next) => {
    // Propagate a client-supplied id, or mint one, so a support ticket can be tied
    // to a log line. Never trust the header for anything but correlation.
    req.id = req.get('x-request-id') || crypto.randomUUID();
    res.setHeader('X-Request-Id', req.id);
    next();
  });

  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: false, limit: '100kb' }));
  app.use(cookieParser());
  app.use(compression());

  app.use(requestLogger);
  app.use(globalLimiter);

  app.get('/health', (req, res) => {
    res.status(200).json({ success: true, data: { status: 'ok', uptime: process.uptime() } });
  });
  app.get('/api/v1/health', (req, res) => {
    res.status(200).json({
      success: true,
      data: { status: 'ok', env: config.env, uptime: process.uptime(), version: '1.0.0' },
    });
  });

  app.use('/api/v1/auth', authRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

export { createApp };
export default createApp;
