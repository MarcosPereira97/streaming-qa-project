const authMiddleware = require("../auth");
const jwt = require("jsonwebtoken");
const redisClient = require("../../utils/redis");

// Mock dependencies
jest.mock("jsonwebtoken");
jest.mock("../../utils/redis");

describe("Auth Middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
      user: null,
      token: null,
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("authMiddleware", () => {
    it("should return 401 if no token is provided", async () => {
      await authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "Unauthorized",
        message: "No token provided",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 401 if token is blacklisted", async () => {
      req.headers.authorization = "Bearer test-token";
      redisClient.get.mockResolvedValue("1");

      await authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "Unauthorized",
        message: "Token has been invalidated",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 401 if token is invalid", async () => {
      req.headers.authorization = "Bearer invalid-token";
      redisClient.get.mockResolvedValue(null);
      jwt.verify.mockImplementation(() => {
        throw new Error("JsonWebTokenError");
      });

      await authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "Unauthorized",
        message: "Invalid token",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should attach user to request if token is valid", async () => {
      const mockDecoded = {
        id: "user-123",
        email: "test@example.com",
        username: "testuser",
        sessionId: "session-123",
      };

      req.headers.authorization = "Bearer valid-token";
      redisClient.get.mockResolvedValueOnce(null); // Not blacklisted
      redisClient.get.mockResolvedValueOnce("session-data"); // Session exists
      jwt.verify.mockReturnValue(mockDecoded);

      await authMiddleware(req, res, next);

      expect(req.user).toEqual({
        id: mockDecoded.id,
        email: mockDecoded.email,
        username: mockDecoded.username,
        sessionId: mockDecoded.sessionId,
      });
      expect(req.token).toBe("valid-token");
      expect(next).toHaveBeenCalled();
    });
  });

  describe("optionalAuth", () => {
    it("should continue without error if no token is provided", async () => {
      await authMiddleware.optionalAuth(req, res, next);

      expect(req.user).toBeNull();
      expect(next).toHaveBeenCalled();
    });

    it("should attach user if valid token is provided", async () => {
      const mockDecoded = {
        id: "user-123",
        email: "test@example.com",
        username: "testuser",
        sessionId: "session-123",
      };

      req.headers.authorization = "Bearer valid-token";
      redisClient.get.mockResolvedValueOnce(null); // Not blacklisted
      redisClient.get.mockResolvedValueOnce("session-data"); // Session exists
      jwt.verify.mockReturnValue(mockDecoded);

      await authMiddleware.optionalAuth(req, res, next);

      expect(req.user).toEqual({
        id: mockDecoded.id,
        email: mockDecoded.email,
        username: mockDecoded.username,
        sessionId: mockDecoded.sessionId,
      });
      expect(next).toHaveBeenCalled();
    });

    it("should continue without error if token is invalid", async () => {
      req.headers.authorization = "Bearer invalid-token";
      redisClient.get.mockResolvedValue(null);
      jwt.verify.mockImplementation(() => {
        throw new Error("Invalid token");
      });

      await authMiddleware.optionalAuth(req, res, next);

      expect(req.user).toBeNull();
      expect(next).toHaveBeenCalled();
    });
  });
});
