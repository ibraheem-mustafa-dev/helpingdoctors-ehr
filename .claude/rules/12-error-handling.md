# Error Handling

**Project:** Medinova
**Principle:** Fail gracefully, log thoroughly, never expose internals

---

## Custom Exception Classes

```typescript
// packages/contracts/src/exceptions.ts
import { HttpException, HttpStatus } from '@nestjs/common';

export class ValidationException extends HttpException {
  constructor(message: string, details?: Record<string, string[]>) {
    super({ statusCode: 422, message, error: 'Validation Error', details }, 422);
  }
}

export class PermissionException extends HttpException {
  constructor(message = 'You do not have permission to perform this action.') {
    super({ statusCode: 403, message, error: 'Forbidden' }, HttpStatus.FORBIDDEN);
  }
}

export class PatientNotFoundException extends HttpException {
  constructor() {
    super({ statusCode: 404, message: 'Patient not found.', error: 'Not Found' }, 404);
  }
}
```

---

## Global Exception Filter

```typescript
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly auditService: AuditService,
    private readonly logger: Logger,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const body = exception instanceof HttpException
      ? exception.getResponse()
      : { statusCode: 500, message: 'An unexpected error occurred.', error: 'Internal Server Error' };

    // Log all 5xx errors to audit trail
    if (status >= 500) {
      this.logger.error(exception);
      this.auditService.logError({
        userId: request.user?.id,
        path: request.url,
        method: request.method,
        statusCode: status,
        message: exception instanceof Error ? exception.message : 'Unknown error',
        stack: exception instanceof Error ? exception.stack : undefined,
      });
    }

    response.status(status).json(body);
  }
}
```

Register globally in `main.ts`: `app.useGlobalFilters(new GlobalExceptionFilter(auditService, logger));`

---

## Standard Error Response Shape

All API errors return this shape (enforced by ts-rest contracts):

```typescript
{
  statusCode: number;   // HTTP status code
  message: string;      // Human-readable, safe for display
  error?: string;       // Error category (e.g. "Validation Error")
  details?: Record<string, string[]>; // Field-level errors (validation only)
}
```

---

## Controller Usage

```typescript
@Post()
async createPatient(@Body() dto: CreatePatientDto): Promise<PatientResponse> {
  // Validation handled by Zod pipe — throws ValidationException automatically
  // Permission handled by @Roles() guard — throws PermissionException automatically
  // Service throws domain exceptions — filter catches them
  return this.patientService.create(dto);
}
```

Controllers stay thin. Never try-catch in controllers unless you need to transform an error.

---

## User-Facing Messages

**Good:** "Patient record saved successfully." / "Unable to save. Please check the highlighted fields." / "Session expired. Please log in again."

**Bad:** Stack traces, SQL errors, file paths, internal class names. Never expose these.

---

## Patient Data in Errors

Never include patient names, MRN, DOB, or any PHI in error messages or logs. Use IDs only.

```typescript
// WRONG
throw new Error(`Patient ${patient.firstName} ${patient.lastName} not found`);

// CORRECT
throw new PatientNotFoundException(); // Generic message, no PHI
```

---

## Checklist

- [ ] Custom exceptions extend HttpException with standard shape?
- [ ] Global filter catches all unhandled exceptions?
- [ ] 5xx errors logged to audit trail?
- [ ] No PHI in error messages or logs?
- [ ] User-facing messages are helpful, not technical?
