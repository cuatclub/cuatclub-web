export type ErrorCode = "NOT_FOUND" | "UNAUTHORIZED" | "VALIDATION" | "CONFLICT" | "INTERNAL";

export class AppError extends Error {
	constructor(
		public code: ErrorCode,
		message: string,
		public details?: unknown,
	) {
		super(message);
		this.name = "AppError";
	}
}

export class NotFoundError extends AppError {
	constructor(message = "Resource not found") {
		super("NOT_FOUND", message);
	}
}

export class UnauthorizedError extends AppError {
	constructor(message = "Unauthorized") {
		super("UNAUTHORIZED", message);
	}
}

export class ValidationError extends AppError {
	constructor(message = "Validation failed") {
		super("VALIDATION", message);
	}
}

export class ConflictError extends AppError {
	constructor(message = "Conflict") {
		super("CONFLICT", message);
	}
}

// The only error a repository should ever produce — everything else
// (not found, ownership, business rules) is decided by the usecase.
export class InternalServerError extends AppError {
	constructor(details?: unknown) {
		super("INTERNAL", "ระบบขัดข้อง กรุณาลองใหม่อีกครั้งหรือติดต่อผู้ดูแลระบบ", details);
	}
}

export type ErrorOrNull = AppError | null;
