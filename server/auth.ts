/**
 * Authentication Service
 * Handles user login, registration, and session management
 */

export interface User {
  id: string;
  username: string;
  email: string;
  password: string; // hashed
  createdAt: number;
  lastLogin?: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

// In-memory user store (replace with database in production)
const users: Map<string, User> = new Map();

// Simple session tokens (replace with JWT in production)
const sessions: Map<string, { userId: string; expiresAt: number }> = new Map();

// Seed with test user
function seedTestUser() {
  const testUser: User = {
    id: "user_001",
    username: "demo",
    email: "demo@example.com",
    password: "demo123", // In production, this would be hashed
    createdAt: Date.now(),
  };
  users.set("demo", testUser);
}

seedTestUser();

/**
 * Simple password hash (in production, use bcrypt)
 */
function hashPassword(password: string): string {
  // This is just for demo - never use in production!
  return Buffer.from(password).toString("base64");
}

/**
 * Verify password
 */
function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

/**
 * Generate session token
 */
function generateToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Login user
 */
export function loginUser(request: LoginRequest): LoginResponse {
  try {
    const user = users.get(request.username);

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    if (user.password !== request.password) {
      return {
        success: false,
        error: "Invalid password",
      };
    }

    // Generate token
    const token = generateToken();
    sessions.set(token, {
      userId: user.id,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    // Update last login
    user.lastLogin = Date.now();

    return {
      success: true,
      user: {
        ...user,
        password: "", // Don't send password to client
      },
      token,
    };
  } catch (err) {
    return {
      success: false,
      error: (err as Error).message,
    };
  }
}

/**
 * Register new user
 */
export function registerUser(request: RegisterRequest): RegisterResponse {
  try {
    // Check if user already exists
    if (users.has(request.username)) {
      return {
        success: false,
        error: "Username already exists",
      };
    }

    // Check email uniqueness
    const userArray = Array.from(users.values());
    for (const user of userArray) {
      if (user.email === request.email) {
        return {
          success: false,
          error: "Email already registered",
        };
      }
    }

    // Validate input
    if (request.password.length < 6) {
      return {
        success: false,
        error: "Password must be at least 6 characters",
      };
    }

    if (!request.email.includes("@")) {
      return {
        success: false,
        error: "Invalid email address",
      };
    }

    // Create new user
    const newUser: User = {
      id: `user_${Date.now()}`,
      username: request.username,
      email: request.email,
      password: request.password, // In production, hash this!
      createdAt: Date.now(),
    };

    users.set(request.username, newUser);

    // Generate token
    const token = generateToken();
    sessions.set(token, {
      userId: newUser.id,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });

    return {
      success: true,
      user: {
        ...newUser,
        password: "",
      },
      token,
    };
  } catch (err) {
    return {
      success: false,
      error: (err as Error).message,
    };
  }
}

/**
 * Verify token
 */
export function verifyToken(token: string): { userId: string } | null {
  const session = sessions.get(token);

  if (!session) {
    return null;
  }

  // Check expiration
  if (session.expiresAt < Date.now()) {
    sessions.delete(token);
    return null;
  }

  return { userId: session.userId };
}

/**
 * Get user by ID
 */
export function getUserById(userId: string): User | null {
  const userArray = Array.from(users.values());
  for (const user of userArray) {
    if (user.id === userId) {
      const userCopy = { ...user };
      userCopy.password = ""; // Never expose password
      return userCopy;
    }
  }
  return null;
}

/**
 * Logout user
 */
export function logoutUser(token: string): void {
  sessions.delete(token);
}

/**
 * Get all users (for admin - remove in production)
 */
export function getAllUsers(): User[] {
  return Array.from(users.values()).map((user) => ({
    ...user,
    password: "",
  }));
}
