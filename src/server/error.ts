import type { TRPCError } from "@trpc/server";

export type ErrorOrNull = Error | null;

export enum ErrorCategory {
  BusinessLogic = "BusinessLogic",
  DatabaseFailure = "DatabaseFailure",
  Authorization = "Unauthorized",
  DirtyInput = "DirtyInput",
  ResourceNotFound = "ResourceNotFound",
}

export class ErrorWithCategory extends Error {
  category: ErrorCategory;

  constructor(message: string, category: ErrorCategory) {
    super(message);
    this.category = category;
  }
}

export class PostgreSQLError extends ErrorWithCategory {
  constructor() {
    super(
      "failed to execute command to database",
      ErrorCategory.DatabaseFailure,
    );
  }
}

export const TRPCErrorMap: Record<ErrorCategory, TRPCError["code"]> = {
  [ErrorCategory.BusinessLogic]: "CONFLICT",
  [ErrorCategory.DatabaseFailure]: "INTERNAL_SERVER_ERROR",
  [ErrorCategory.Authorization]: "UNAUTHORIZED",
  [ErrorCategory.DirtyInput]: "BAD_REQUEST",
  [ErrorCategory.ResourceNotFound]: "NOT_FOUND",
};

export const getTRPCError = (error: Error): TRPCError => {
  if (error instanceof ErrorWithCategory) {
    let message = error.message;
    if (
      error.category === ErrorCategory.DatabaseFailure &&
      error.message === new PostgreSQLError().message
    ) {
      message = "ระบบขัดข้อง กรุณาลองใหม่อีกครั้งหรือติดต่อผู้ดูแลระบบ";
    }
    return {
      name: error.category,
      code: TRPCErrorMap[error.category],
      message,
    };
  }
  return {
    name: "UnhandledError",
    code: "INTERNAL_SERVER_ERROR",
    message:
      "เกิดข้อผิดพลาดไม่ทราบสาเหตุ กรุณาลองใหม่อีกครั้งหรือแจ้งผู้ดูแลระบบ",
  };
};

export const DefaultNoPermissionError: TRPCError = {
  name: "UnAuthorized",
  code: "UNAUTHORIZED",
  message: "ไม่มีสิทธิ์ในการเข้าถึง",
};
