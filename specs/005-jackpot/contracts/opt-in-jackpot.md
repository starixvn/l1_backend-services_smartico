# POST /api/jackpots/{templateId}/opt-in

Opt-in a user to a specific jackpot. Users who opt-in become eligible to win prizes from that jackpot.

## HTTP Method and Path

```
POST /api/jackpots/{templateId}/opt-in
```

## Request Format

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| templateId | string | Yes | Unique identifier of the jackpot template |

### Headers

```json
{
  "Authorization": "Bearer {token}",
  "Content-Type": "application/json"
}
```

### Request Body

```json
{
  "userId": "user-123"
}
```

### Body Schema

```json
{
  "type": "object",
  "properties": {
    "userId": {
      "type": "string",
      "description": "ID of the user opting in to the jackpot",
      "pattern": "^[a-zA-Z0-9_-]{5,36}$",
      "minLength": 5,
      "maxLength": 36
    }
  },
  "required": ["userId"],
  "additionalProperties": false
}
```

## Request Examples

### Example 1: Basic opt-in request

```bash
curl -X POST "https://api.example.com/api/jackpots/jp-001/opt-in" \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123"
  }'
```

### Example 2: Opt-in with different user ID

```bash
curl -X POST "https://api.example.com/api/jackpots/jp-002/opt-in" \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "john-doe-5678"
  }'
```

## Response Format

### Success Response (200 OK)

User successfully opted in to the jackpot.

```json
{
  "status": "success",
  "code": "OPT_IN_SUCCESS",
  "message": "Successfully opted in to jackpot",
  "data": {
    "templateId": "jp-001",
    "userId": "user-123",
    "optInStatus": "active",
    "optInTime": "2025-11-09T14:35:00Z",
    "jackpotDetails": {
      "name": "Progressive Jackpot",
      "type": "progressive",
      "currentAmount": 50000.00,
      "currency": "USD",
      "winningChance": 0.001
    }
  },
  "timestamp": "2025-11-09T14:35:00Z"
}
```

### Success Response Schema

```json
{
  "type": "object",
  "properties": {
    "status": {
      "type": "string",
      "enum": ["success"],
      "description": "Response status"
    },
    "code": {
      "type": "string",
      "enum": ["OPT_IN_SUCCESS"],
      "description": "Response code"
    },
    "message": {
      "type": "string",
      "description": "Human-readable success message"
    },
    "data": {
      "type": "object",
      "properties": {
        "templateId": {
          "type": "string",
          "description": "Jackpot template ID"
        },
        "userId": {
          "type": "string",
          "description": "User ID who opted in"
        },
        "optInStatus": {
          "type": "string",
          "enum": ["active", "pending", "suspended"],
          "description": "Current opt-in status"
        },
        "optInTime": {
          "type": "string",
          "format": "date-time",
          "description": "Timestamp of opt-in action"
        },
        "jackpotDetails": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string"
            },
            "type": {
              "type": "string"
            },
            "currentAmount": {
              "type": "number"
            },
            "currency": {
              "type": "string"
            },
            "winningChance": {
              "type": "number"
            }
          }
        }
      }
    },
    "timestamp": {
      "type": "string",
      "format": "date-time"
    }
  },
  "required": ["status", "code", "message", "data", "timestamp"]
}
```

## Error Responses

### 400 Bad Request

Invalid request body or parameters.

```json
{
  "status": "error",
  "code": "INVALID_REQUEST",
  "message": "Invalid request parameters",
  "errors": [
    {
      "field": "userId",
      "message": "userId is required and must be a string"
    }
  ],
  "timestamp": "2025-11-09T14:35:00Z"
}
```

### 404 Not Found

Jackpot template or user not found.

```json
{
  "status": "error",
  "code": "NOT_FOUND",
  "message": "Jackpot template or user not found",
  "details": {
    "templateId": "jp-999",
    "reason": "Jackpot template does not exist"
  },
  "timestamp": "2025-11-09T14:35:00Z"
}
```

### 409 Conflict

User has already opted in to this jackpot.

```json
{
  "status": "error",
  "code": "ALREADY_OPTED_IN",
  "message": "User has already opted in to this jackpot",
  "data": {
    "templateId": "jp-001",
    "userId": "user-123",
    "optInTime": "2025-11-08T10:15:00Z",
    "suggestion": "User is already eligible for this jackpot"
  },
  "timestamp": "2025-11-09T14:35:00Z"
}
```

### 500 Internal Server Error

Server-side error occurred during opt-in process.

```json
{
  "status": "error",
  "code": "INTERNAL_SERVER_ERROR",
  "message": "Failed to opt in to jackpot. Please try again later.",
  "requestId": "req-xyz-abc-123",
  "timestamp": "2025-11-09T14:35:00Z"
}
```

## Status Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | User successfully opted in to jackpot |
| 400 | Bad Request | Invalid request body or parameters |
| 401 | Unauthorized | Missing or invalid authentication token |
| 404 | Not Found | Jackpot template or user not found |
| 409 | Conflict | User already opted in to this jackpot |
| 422 | Unprocessable Entity | User does not meet opt-in requirements |
| 500 | Internal Server Error | Server-side error |

## Validation Rules

1. **templateId Parameter**
   - Must match pattern: `^jp-[0-9]{3,}$`
   - Must reference an existing, active jackpot template
   - Case-sensitive

2. **userId Field**
   - Required in request body
   - Must be 5-36 characters long
   - Alphanumeric with hyphens and underscores allowed
   - Must reference an existing user
   - Pattern: `^[a-zA-Z0-9_-]{5,36}$`

3. **Opt-in Status**
   - User must not already be opted in to this jackpot
   - User must meet any eligibility requirements (e.g., minimum account age, level)
   - Jackpot must be active and accepting opt-ins

4. **Business Rules**
   - A user can only opt-in to a jackpot once
   - Opt-in persists until user opts out
   - Opt-in immediately makes user eligible for draws
   - Multiple jackpots can be opted into by a single user

## Idempotency

This endpoint is NOT idempotent. Repeated requests with the same parameters will result in a 409 Conflict error after the first successful opt-in. If idempotency is needed, use an idempotency key header:

```
Idempotency-Key: {uuid}
```

## Side Effects

When a user successfully opts in:
- User eligibility for jackpot draws begins immediately
- Opt-in event is logged to audit trail
- User may receive confirmation notification (optional, configurable)
- Jackpot participant count is incremented
- User statistics are updated

## Timeout

- Expected response time: 500-2000ms
- Request timeout: 30 seconds
