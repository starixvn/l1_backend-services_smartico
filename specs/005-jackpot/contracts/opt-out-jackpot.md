# POST /api/jackpots/{templateId}/opt-out

Opt-out a user from a specific jackpot. Users who opt-out become ineligible to win prizes from that jackpot and will not participate in future draws.

## HTTP Method and Path

```
POST /api/jackpots/{templateId}/opt-out
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
      "description": "ID of the user opting out from the jackpot",
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

### Example 1: Basic opt-out request

```bash
curl -X POST "https://api.example.com/api/jackpots/jp-001/opt-out" \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123"
  }'
```

### Example 2: Opt-out from different jackpot

```bash
curl -X POST "https://api.example.com/api/jackpots/jp-002/opt-out" \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "john-doe-5678"
  }'
```

## Response Format

### Success Response (200 OK)

User successfully opted out from the jackpot.

```json
{
  "status": "success",
  "code": "OPT_OUT_SUCCESS",
  "message": "Successfully opted out from jackpot",
  "data": {
    "templateId": "jp-001",
    "userId": "user-123",
    "optOutStatus": "inactive",
    "optOutTime": "2025-11-09T14:35:00Z",
    "previousOptInTime": "2025-11-08T10:15:00Z",
    "jackpotDetails": {
      "name": "Progressive Jackpot",
      "type": "progressive",
      "currentAmount": 50000.00,
      "currency": "USD"
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
      "enum": ["OPT_OUT_SUCCESS"],
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
          "description": "User ID who opted out"
        },
        "optOutStatus": {
          "type": "string",
          "enum": ["inactive", "suspended", "pending_removal"],
          "description": "Current opt-out status"
        },
        "optOutTime": {
          "type": "string",
          "format": "date-time",
          "description": "Timestamp of opt-out action"
        },
        "previousOptInTime": {
          "type": ["string", "null"],
          "format": "date-time",
          "description": "When user originally opted in (null if never opted in)"
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

User has not opted in to this jackpot or is already in the process of opting out.

```json
{
  "status": "error",
  "code": "NOT_OPTED_IN",
  "message": "User has not opted in to this jackpot",
  "data": {
    "templateId": "jp-001",
    "userId": "user-123",
    "reason": "User is not currently participating in this jackpot",
    "suggestion": "User must opt-in before opting out"
  },
  "timestamp": "2025-11-09T14:35:00Z"
}
```

### 500 Internal Server Error

Server-side error occurred during opt-out process.

```json
{
  "status": "error",
  "code": "INTERNAL_SERVER_ERROR",
  "message": "Failed to opt out from jackpot. Please try again later.",
  "requestId": "req-xyz-abc-123",
  "timestamp": "2025-11-09T14:35:00Z"
}
```

## Status Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | User successfully opted out from jackpot |
| 400 | Bad Request | Invalid request body or parameters |
| 401 | Unauthorized | Missing or invalid authentication token |
| 404 | Not Found | Jackpot template or user not found |
| 409 | Conflict | User has not opted in to this jackpot |
| 500 | Internal Server Error | Server-side error |

## Validation Rules

1. **templateId Parameter**
   - Must match pattern: `^jp-[0-9]{3,}$`
   - Must reference an existing jackpot template
   - Case-sensitive

2. **userId Field**
   - Required in request body
   - Must be 5-36 characters long
   - Alphanumeric with hyphens and underscores allowed
   - Must reference an existing user
   - Pattern: `^[a-zA-Z0-9_-]{5,36}$`

3. **Opt-out Status**
   - User must be currently opted in to this jackpot
   - User must not already be in opt-out process
   - Jackpot must exist and be manageable

4. **Business Rules**
   - User can only opt-out if currently opted in
   - Opt-out is immediate and permanent (until re-opt-in)
   - User becomes ineligible for future draws after opt-out
   - Existing prizes earned before opt-out are not forfeited
   - Can opt-in again at any time after opt-out

## Idempotency

This endpoint is NOT idempotent. Repeated requests with the same parameters will result in a 409 Conflict error after the first successful opt-out. If idempotency is needed, use an idempotency key header:

```
Idempotency-Key: {uuid}
```

## Side Effects

When a user successfully opts out:
- User becomes immediately ineligible for new draws
- Opt-out event is logged to audit trail
- User may receive confirmation notification (optional, configurable)
- Jackpot participant count is decremented
- User can opt back in at any time
- Any pending draws are not affected (user still eligible for current draw cycle if not yet drawn)

## Timeout

- Expected response time: 500-2000ms
- Request timeout: 30 seconds

## Important Notes

- **Data Retention**: Historical data about user participation is retained for compliance and analytics
- **Winning Status**: If user wins after opt-out request but before draw processing, they are still eligible to claim prize
- **Multiple Opt-outs**: Repeated opt-out requests are safe and will return 409 Conflict error
- **Partial Opt-out**: Opting out from one jackpot does not affect participation in other jackpots
