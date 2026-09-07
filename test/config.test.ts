import { expect } from 'chai';
import 'mocha';
import { getDatabaseUrl, getPort } from '../src/config';

describe('config.ts', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = process.env;
    process.env = { ...originalEnv }; // Clone the environment to prevent side effects
  });

  afterEach(() => {
    process.env = originalEnv; // Restore original environment
  });

  describe('getDatabaseUrl', () => {
    it('should return the database URL if set', () => {
      process.env.DATABASE_URL = 'postgres://user:password@host:port/db';
      expect(getDatabaseUrl()).to.equal('postgres://user:password@host:port/db');
    });

    it('should throw an error if DATABASE_URL is not set', () => {
      delete process.env.DATABASE_URL;
      expect(() => getDatabaseUrl()).to.throw('DATABASE_URL is required');
    });
  });

  describe('getPort', () => {
    it('should return the port if set and valid', () => {
      process.env.PORT = '8080';
      expect(getPort()).to.equal(8080);
    });

    it('should return default port 3000 if PORT is not set', () => {
      delete process.env.PORT;
      expect(getPort()).to.equal(3000);
    });

    it('should throw an error if PORT is not a positive integer', () => {
      process.env.PORT = 'abc';
      expect(() => getPort()).to.throw('PORT must be a positive integer');

      process.env.PORT = '-100';
      expect(() => getPort()).to.throw('PORT must be a positive integer');

      process.env.PORT = '0';
      expect(() => getPort()).to.throw('PORT must be a positive integer');

      process.env.PORT = '3000.5';
      expect(() => getPort()).to.throw('PORT must be a positive integer');
    });
  });
});
