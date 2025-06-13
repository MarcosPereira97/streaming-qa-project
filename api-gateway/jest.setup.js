// Set test environment variables
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret";
process.env.REDIS_URL = "redis://localhost:6379";

// Mock Redis client
jest.mock("./src/utils/redis", () => ({
  get: jest.fn(),
  set: jest.fn(),
  setEx: jest.fn(),
  del: jest.fn(),
  keys: jest.fn(),
  exists: jest.fn(),
  expire: jest.fn(),
  quit: jest.fn(),
  ping: jest.fn().mockResolvedValue("PONG"),
  on: jest.fn(),
  connect: jest.fn().mockResolvedValue(true),
  cache: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    clearPattern: jest.fn(),
  },
}));

// Mock logger
jest.mock("./src/utils/logger", () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  stream: { write: jest.fn() },
}));

// Global test timeout
jest.setTimeout(10000);
