import app from './app';
import { config } from './config/env';
import prisma from './config/database';
import corsService from './services/cors.service';

const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('Database connected successfully');

    // Initialize CORS cache from database
    await corsService.refreshCache();

    // Start server
    app.listen(config.port, () => {
      console.log(`${config.app_name} is running on port ${config.port}`);
      console.log(`Environment: ${config.node_env}`);
      console.log(`API Base URL: ${config.urls.backend}/api`);
      console.log(`Health check: ${config.urls.backend}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await prisma.$disconnect();
  console.log('Database disconnected');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down gracefully...');
  await prisma.$disconnect();
  console.log('Database disconnected');
  process.exit(0);
});

startServer();
