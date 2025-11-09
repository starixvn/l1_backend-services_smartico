# GET /api/jackpots

Retrieve a list of available jackpots. Optionally filter by user ID to get jackpot participation status.

## HTTP Method and Path

```
GET /api/jackpots
```

## Request Format

### Query Parameters

| Parameter | Type | Required | Description | Default |
|-----------|------|----------|-------------|---------|
| userId | string | No | Filter jackpots by user participation status | - |
| limit | integer | No | Maximum number of jackpots to return | 100 |
| offset | integer | No | Number of jackpots to skip for pagination | 0 |

### Headers

```json
{
  "Authorization": "Bearer {token}",
  "Content-Type": "application/json"
}
```

## Request Examples

### Example 1: Get all available jackpots

```bash
curl -X GET "https://api.example.com/api/jackpots" \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json"
```

### Example 2: Get jackpots for a specific user

```bash
curl -X GET "https://api.example.com/api/jackpots?userId=user-123" \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json"
```

### Example 3: Get jackpots with pagination

```bash
curl -X GET "https://api.example.com/api/jackpots?limit=20&offset=40" \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json"
```

## Response Format

### Success Response (200 OK)

```json
{
  "status": "success",
  "data": {
    "jackpots": [
      {
        "templateId": "jp-001",
        "name": "Progressive Jackpot",
        "description": "Daily progressive jackpot with increasing prize pool",
        "type": "progressive",
        "currentAmount": 50000.00,
        "basePrizePool": 10000.00,
        "maxPrizePool": 100000.00,
        "currency": "USD",
        "isActive": true,
        "optInRequired": true,
        "userOptedIn": true,
        "winningChance": 0.001,
        "createdAt": "2025-01-15T10:00:00Z",
        "updatedAt": "2025-11-09T14:30:00Z",
        "statistics": {
          "totalWinners": 45,
          "lastWinnerTime": "2025-11-09T12:15:00Z",
          "averagePrize": 1111.11,
          "drawFrequency": "daily"
        }
      },
      {
        "templateId": "jp-002",
        "name": "Milestone Jackpot",
        "description": "Jackpot awarded at player milestone achievements",
        "type": "milestone",
        "currentAmount": 25000.00,
        "basePrizePool": 5000.00,
        "maxPrizePool": 50000.00,
        "currency": "USD",
        "isActive": true,
        "optInRequired": false,
        "userOptedIn": null,
        "winningChance": 0.005,
        "createdAt": "2025-02-01T10:00:00Z",
        "updatedAt": "2025-11-09T14:30:00Z",
        "statistics": {
          "totalWinners": 12,
          "lastWinnerTime": "2025-11-08T18:45:00Z",
          "averagePrize": 2083.33,
          "drawFrequency": "on-milestone"
        }
      }
    ],
    "pagination": {
      "total": 5,
      "limit": 100,
      "offset": 0,
      "hasMore": false
    }
  },
  "timestamp": "2025-11-09T14:35:00Z"
}
```

### JackpotDetails Schema

```json
{
  "type": "object",
  "properties": {
    "templateId": {
      "type": "string",
      "description": "Unique identifier for the jackpot template",
      "pattern": "^jp-[0-9]{3,}$"
    },
    "name": {
      "type": "string",
      "description": "Display name of the jackpot",
      "minLength": 3,
      "maxLength": 100
    },
    "description": {
      "type": "string",
      "description": "Detailed description of the jackpot",
      "maxLength": 500
    },
    "type": {
      "type": "string",
      "enum": ["progressive", "milestone", "random", "seasonal"],
      "description": "Type of jackpot"
    },
    "currentAmount": {
      "type": "number",
      "description": "Current prize pool amount in currency",
      "minimum": 0,
      "multipleOf": 0.01
    },
    "basePrizePool": {
      "type": "number",
      "description": "Base amount for the prize pool",
      "minimum": 0,
      "multipleOf": 0.01
    },
    "maxPrizePool": {
      "type": "number",
      "description": "Maximum possible prize pool amount",
      "minimum": 0,
      "multipleOf": 0.01
    },
    "currency": {
      "type": "string",
      "enum": ["USD", "EUR", "GBP", "JPY", "AUD", "CAD"],
      "description": "Currency code for prize amounts"
    },
    "isActive": {
      "type": "boolean",
      "description": "Whether the jackpot is currently active"
    },
    "optInRequired": {
      "type": "boolean",
      "description": "Whether user must opt-in to participate"
    },
    "userOptedIn": {
      "type": ["boolean", "null"],
      "description": "User's opt-in status (null if userId not provided)"
    },
    "winningChance": {
      "type": "number",
      "description": "Probability of winning expressed as decimal",
      "minimum": 0,
      "maximum": 1
    },
    "createdAt": {
      "type": "string",
      "format": "date-time",
      "description": "Creation timestamp in ISO 8601 format"
    },
    "updatedAt": {
      "type": "string",
      "format": "date-time",
      "description": "Last update timestamp in ISO 8601 format"
    },
    "statistics": {
      "type": "object",
      "properties": {
        "totalWinners": {
          "type": "integer",
          "minimum": 0
        },
        "lastWinnerTime": {
          "type": ["string", "null"],
          "format": "date-time"
        },
        "averagePrize": {
          "type": "number",
          "minimum": 0,
          "multipleOf": 0.01
        },
        "drawFrequency": {
          "type": "string",
          "enum": ["hourly", "daily", "weekly", "monthly", "on-milestone", "custom"]
        }
      }
    }
  },
  "required": [
    "templateId",
    "name",
    "type",
    "currentAmount",
    "basePrizePool",
    "maxPrizePool",
    "currency",
    "isActive",
    "optInRequired"
  ]
}
```

## Error Responses

### 400 Bad Request

Invalid query parameters or malformed request.

```json
{
  "status": "error",
  "code": "INVALID_REQUEST",
  "message": "Invalid query parameters provided",
  "errors": [
    {
      "field": "limit",
      "message": "limit must be a positive integer not exceeding 1000"
    }
  ],
  "timestamp": "2025-11-09T14:35:00Z"
}
```

### 500 Internal Server Error

Server-side error occurred while retrieving jackpots.

```json
{
  "status": "error",
  "code": "INTERNAL_SERVER_ERROR",
  "message": "Failed to retrieve jackpots. Please try again later.",
  "requestId": "req-xyz-abc-123",
  "timestamp": "2025-11-09T14:35:00Z"
}
```

## Status Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Successfully retrieved jackpots |
| 400 | Bad Request | Invalid query parameters |
| 401 | Unauthorized | Missing or invalid authentication token |
| 500 | Internal Server Error | Server-side error |

## Validation Rules

1. **userId Parameter**
   - Must be a valid user identifier if provided
   - Format: alphanumeric string, 5-36 characters

2. **limit Parameter**
   - Must be a positive integer
   - Must not exceed 1000
   - Default: 100

3. **offset Parameter**
   - Must be a non-negative integer
   - Used for pagination
   - Default: 0

4. **Prize Amounts**
   - Must be non-negative numbers
   - currentAmount <= maxPrizePool
   - basePrizePool <= maxPrizePool

5. **Dates**
   - All timestamps must be in ISO 8601 format
   - Must include timezone information

6. **Winning Chance**
   - Must be between 0 and 1
   - Represents decimal probability (e.g., 0.001 = 0.1%)

## Rate Limiting

- Rate limit: 100 requests per minute per user
- Rate limit headers included in response:
  - `X-RateLimit-Limit`: 100
  - `X-RateLimit-Remaining`: Requests remaining
  - `X-RateLimit-Reset`: Unix timestamp when limit resets
