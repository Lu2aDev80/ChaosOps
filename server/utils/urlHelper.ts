import { Request } from 'express';
import { logger } from '../logger';

interface URLConfig {
  frontendHost: string;
  basePath: string;
}

/**
 * Get the appropriate frontend URL configuration based on environment
 * @param req Express request object (optional, used for localhost detection)
 * @returns URLConfig object with frontendHost and basePath
 */
export function getURLConfig(req?: Request): URLConfig {
  let basePath = process.env.APP_BASE_PATH || '';
  const isProduction = process.env.NODE_ENV === 'production';
  
  let frontendHost: string;

  if (isProduction) {
    // Production: default to lu2adevelopment.de and the `/cahos-ops` base path
    frontendHost = process.env.FRONTEND_HOST || 'https://chaos-ops.de';
    // If no explicit APP_BASE_PATH provided, use `/cahos-ops` as the default
    if (!process.env.APP_BASE_PATH) {
      basePath = '/cahos-ops';
    }
    logger.debug('Using production frontend host', { frontendHost, basePath });
  } else {
    // Development: Try to detect from request or fallback to localhost
    if (req) {
      // Extract host from request headers to detect localhost scenarios
      const requestHost = req.get('host') || 'localhost:5173';
      const protocol = req.protocol || 'http';
      frontendHost = `${protocol}://${requestHost}`;
      
      // Override with explicit dev URL if set
      if (process.env.FRONTEND_URL) {
        frontendHost = process.env.FRONTEND_URL;
      }
    } else {
      // Fallback when no request context available
      frontendHost = process.env.FRONTEND_URL || 'http://localhost:5173';
    }
    
    logger.debug('Using development frontend host', { frontendHost, basePath, requestHost: req?.get('host') });
  }

  const basePathNormalized = basePath ? (basePath.startsWith('/') ? basePath : `/${basePath}`) : '';

  return {
    frontendHost: frontendHost.replace(/\/$/, ''), // Remove trailing slash
    basePath: basePathNormalized
  };
}

/**
 * Generate a verification email URL
 * @param token Verification token
 * @param req Express request object (optional)
 * @returns Complete verification URL
 */
export function generateVerificationURL(token: string, req?: Request): string {
  const { frontendHost, basePath } = getURLConfig(req);
  const url = `${frontendHost}${basePath}/verify-email?token=${token}`;
  
  logger.info('Generated verification URL', { 
    token: token.substring(0, 8) + '***',
    url: url.replace(token, '***'),
    environment: process.env.NODE_ENV
  });
  
  return url;
}

/**
 * Generate an invitation acceptance URL
 * @param token Invitation token
 * @param req Express request object (optional)
 * @returns Complete invitation URL
 */
export function generateInvitationURL(token: string, req?: Request): string {
  const { frontendHost, basePath } = getURLConfig(req);
  const url = `${frontendHost}${basePath}/accept-invitation?token=${token}`;
  
  logger.info('Generated invitation URL', { 
    token: token.substring(0, 8) + '***',
    url: url.replace(token, '***'),
    environment: process.env.NODE_ENV
  });
  
  return url;
}

/**
 * Generate a password reset URL (for future use)
 * @param token Reset token
 * @param req Express request object (optional)
 * @returns Complete password reset URL
 */
export function generatePasswordResetURL(token: string, req?: Request): string {
  const { frontendHost, basePath } = getURLConfig(req);
  const url = `${frontendHost}${basePath}/reset-password?token=${token}`;
  
  logger.info('Generated password reset URL', { 
    token: token.substring(0, 8) + '***',
    url: url.replace(token, '***'),
    environment: process.env.NODE_ENV
  });
  
  return url;
}

/**
 * Generate a generic app URL
 * @param path Path within the app (with or without leading slash)
 * @param queryParams Optional query parameters
 * @param req Express request object (optional)
 * @returns Complete app URL
 */
export function generateAppURL(path: string, queryParams?: Record<string, string>, req?: Request): string {
  const { frontendHost, basePath } = getURLConfig(req);
  
  // Ensure path has leading slash
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  // Build query string if provided
  let queryString = '';
  if (queryParams && Object.keys(queryParams).length > 0) {
    const params = new URLSearchParams(queryParams);
    queryString = `?${params.toString()}`;
  }
  
  const url = `${frontendHost}${basePath}${cleanPath}${queryString}`;
  
  logger.debug('Generated app URL', { 
    path: cleanPath,
    queryParams,
    url,
    environment: process.env.NODE_ENV
  });
  
  return url;
}

/**
 * Validate that URL generation is working correctly
 * @param req Express request object (optional)
 * @returns Object with sample URLs for validation
 */
export function validateURLGeneration(req?: Request) {
  const config = getURLConfig(req);
  
  return {
    config,
    sampleURLs: {
      verification: generateVerificationURL('sample-token-123', req),
      invitation: generateInvitationURL('sample-token-456', req),
      passwordReset: generatePasswordResetURL('sample-token-789', req),
      home: generateAppURL('/', undefined, req),
      dashboard: generateAppURL('/dashboard', { org: 'test-org' }, req)
    }
  };
}