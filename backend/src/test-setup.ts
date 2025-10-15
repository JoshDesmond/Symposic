// Test setup file for Jest
import dotenv from 'dotenv';

// Load environment variables for tests
dotenv.config();

// Set test environment variables if not already set
process.env.NODE_ENV = 'test';

// Global test timeout
jest.setTimeout(5000);
