import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface EnvConfig {
  node_env: string;
  port: number;
  app_name: string;
  database_url: string;
  jwt: {
    access_secret: string;
    refresh_secret: string;
    access_expiry: string;
    refresh_expiry: string;
  };
  email: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    password: string;
    from: string;
  };
  urls: {
    frontend: string;
    backend: string;
  };
  security: {
    bcrypt_rounds: number;
    rate_limit_window_ms: number;
    rate_limit_max_requests: number;
  };
  cookie: {
    domain: string;
    secure: boolean;
    same_site: 'strict' | 'lax' | 'none';
  };
}

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const config: EnvConfig = {
  node_env: getEnvVar('NODE_ENV', 'development'),
  port: parseInt(getEnvVar('PORT', '3000'), 10),
  app_name: getEnvVar('APP_NAME', 'Identity Provider'),
  database_url: getEnvVar('DATABASE_URL'),
  jwt: {
    access_secret: getEnvVar('JWT_ACCESS_SECRET'),
    refresh_secret: getEnvVar('JWT_REFRESH_SECRET'),
    access_expiry: getEnvVar('JWT_ACCESS_EXPIRY', '15m'),
    refresh_expiry: getEnvVar('JWT_REFRESH_EXPIRY', '7d'),
  },
  email: {
    host: getEnvVar('EMAIL_HOST'),
    port: parseInt(getEnvVar('EMAIL_PORT', '587'), 10),
    secure: getEnvVar('EMAIL_SECURE', 'false') === 'true',
    user: getEnvVar('EMAIL_USER'),
    password: getEnvVar('EMAIL_PASSWORD'),
    from: getEnvVar('EMAIL_FROM'),
  },
  urls: {
    frontend: getEnvVar('FRONTEND_URL', 'http://localhost:3000'),
    backend: getEnvVar('BACKEND_URL', 'http://localhost:3000'),
  },
  security: {
    bcrypt_rounds: parseInt(getEnvVar('BCRYPT_ROUNDS', '12'), 10),
    rate_limit_window_ms: parseInt(getEnvVar('RATE_LIMIT_WINDOW_MS', '900000'), 10),
    rate_limit_max_requests: parseInt(getEnvVar('RATE_LIMIT_MAX_REQUESTS', '5'), 10),
  },
  cookie: {
    domain: getEnvVar('COOKIE_DOMAIN', 'localhost'),
    secure: getEnvVar('COOKIE_SECURE', 'false') === 'true',
    same_site: getEnvVar('COOKIE_SAME_SITE', 'strict') as 'strict' | 'lax' | 'none',
  },
};

export const isDevelopment = config.node_env === 'development';
export const isProduction = config.node_env === 'production';
