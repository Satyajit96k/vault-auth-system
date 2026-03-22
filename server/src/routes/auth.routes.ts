import { Router } from 'express';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/authenticate';
import { registerLimiter, loginLimiter, refreshLimiter, meLimiter } from '../middleware/rateLimiter';
import { registerSchema, loginSchema } from '../schemas/auth.schema';
import * as authController from '../controllers/auth.controller';

const router = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: StrongP@ss1
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation failed
 *       409:
 *         description: Email already registered
 */
router.post('/register', validate(registerSchema), registerLimiter, authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login and receive access + refresh tokens
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: StrongP@ss1
 *     responses:
 *       200:
 *         description: Login successful. Refresh token set as HttpOnly cookie.
 *       401:
 *         description: Invalid email or password
 *       403:
 *         description: Account deactivated
 *       429:
 *         description: Too many login attempts
 */
router.post('/login', validate(loginSchema), loginLimiter, authController.login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token (rotates refresh token)
 *     tags: [Auth]
 *     description: Reads refreshToken from HttpOnly cookie. Revokes old token, issues new token pair. Detects token reuse.
 *     responses:
 *       200:
 *         description: New access token issued, refresh token rotated via cookie
 *       401:
 *         description: Invalid, expired, or revoked refresh token
 */
router.post('/refresh', refreshLimiter, authController.refresh);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user details
 *       401:
 *         description: Missing or invalid access token
 */
router.get('/me', authenticate, meLimiter, authController.me);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout current session
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     description: Blacklists access token and revokes refresh token
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       401:
 *         description: Invalid access token
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @swagger
 * /auth/logout-all:
 *   post:
 *     summary: Logout from all devices
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     description: Blacklists current access token, revokes ALL refresh tokens, and invalidates all existing sessions
 *     responses:
 *       200:
 *         description: Logged out from all devices
 *       401:
 *         description: Invalid access token
 */
router.post('/logout-all', authenticate, authController.logoutAll);

export default router;
