import { Router, Request, Response } from 'express';
import Database from '../database';

const router = Router();

// Initialize database instance (will be injected)
let database: Database;

export const setDatabase = (db: Database) => {
  database = db;
};

// --- OTP Management ---
async function generateOTP(): string

async function storeOTP(phone: string, code: string): Promise<void>

async function verifyOTP(phone: string, code: string): Promise<boolean>

async function cleanupExpiredOTPs(): Promise<void>

// --- Rate Limiting (in-memory) ---
function checkRateLimit(phone: string): boolean

function recordAttempt(phone: string): void

// --- JWT Management ---
function generateJWT(phone: string): string

function verifyJWT(token: string): { phone: string } | null

// --- Express Endpoints ---
async function sendCode(req: Request, res: Response): Promise<void>
// POST /auth/send-code
// Body: { phone: string }

async function verifyCode(req: Request, res: Response): Promise<void>
// POST /auth/verify-code  
// Body: { phone: string, code: string }

// --- Middleware ---
async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void>
// Adds req.userPhone if valid JWT

export default router;

