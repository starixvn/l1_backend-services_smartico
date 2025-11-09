# GET /api/jackpots/winners

Retrieve a list of recent jackpot winners. Optionally filter by jackpot type and limit the number of results.

## HTTP Method and Path

```
GET /api/jackpots/winners
```

## Request Format

### Query Parameters

| Parameter | Type | Required | Description | Default |
|-----------|------|----------|-------------|---------|
| jackpotType | string | No | Filter winners by jackpot type (progressive, milestone, random, seasonal) | All types |
| limit | integer | No | Maximum number of winners to return | 50 |
| offset | integer | No | Number of winners to skip for pagination | 0 |
| sortBy | string | No | Sort field (winTime, prizeAmount, templateId) | winTime |
| sortOrder | string | No | Sort direction (asc, desc) | desc |

### Headers

```json
{
  "Authorization": "Bearer {token}",
  "Content-Type": "application/json"
}
```

## Request Examples

### Example 1: Get recent 50 jackpot winners

```bash
curl -X GET "https://api.example.com/api/jackpots/winners" \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json"
```

### Example 2: Get winners from specific jackpot type

```bash
curl -X GET "https://api.example.com/api/jackpots/winners?jackpotType=progressive&limit=20" \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json"
```

### Example 3: Get winners with pagination and custom sorting

```bash
curl -X GET "https://api.example.com/api/jackpots/winners?limit=25&offset=50&sortBy=prizeAmount&sortOrder=desc" \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json"
```

### Example 4: Get milestone jackpot winners

```bash
curl -X GET "https://api.example.com/api/jackpots/winners?jackpotType=milestone&limit=100" \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json"
```

## Response Format

### Success Response (200 OK)

```json
{
  "status": "success",
  "data": {
    "winners": [
      {
        "winnerId": "winner-001",
        "userId": "user-456",
        "templateId": "jp-001",
        "jackpotName": "Progressive Jackpot",
        "jackpotType": "progressive",
        "prizeAmount": 5000.00,
        "currency": "USD",
        "winTime": "2025-11-09T12:15:00Z",
        "status": "claimed",
        "claimedAt": "2025-11-09T13:30:00Z",
        "userCountry": "US",
        "winMultiplier": 1.0,
        "baseAmount": 5000.00,
        "taxWithheld": 0.00
      },
      {
        "winnerId": "winner-002",
        "userId": "user-789",
        "templateId": "jp-002",
        "jackpotName": "Milestone Jackpot",
        "jackpotType": "milestone",
        "prizeAmount": 2500.00,
        "currency": "USD",
        "winTime": "2025-11-08T18:45:00Z",
        "status": "claimed",
        "claimedAt": "2025-11-08T19:20:00Z",
        "userCountry": "CA",
        "winMultiplier": 1.0,
        "baseAmount": 2500.00,
        "taxWithheld": 0.00
      },
      {
        "winnerId": "winner-003",
        "userId": "user-321",
        "templateId": "jp-001",
        "jackpotName": "Progressive Jackpot",
        "jackpotType": "progressive",
        "prizeAmount": 3750.00,
        "currency": "USD",
        "winTime": "2025-11-08T14:22:00Z",
        "status": "unclaimed",
        "claimedAt": null,
        "userCountry": "GB",
        "winMultiplier": 1.0,
        "baseAmount": 3750.00,
        "taxWithheld": 0.00
      },
      {
        "winnerId": "winner-004",
        "userId": "user-654",
        "templateId": "jp-003",
        "jackpotName": "Random Jackpot",
        "jackpotType": "random",
        "prizeAmount": 1500.00,
        "currency": "USD",
        "winTime": "2025-11-07T09:10:00Z",
        "status": "claimed",
        "claimedAt": "2025-11-07T10:05:00Z",
        "userCountry": "AU",
        "winMultiplier": 1.0,
        "baseAmount": 1500.00,
        "taxWithheld": 0.00
      }
    ],
    "pagination": {
      "total": 45,
      "limit": 50,
      "offset": 0,
      "hasMore": false
    },
    "statistics": {
      "totalPrizesDistributed": 250000.00,
      "averagePrize": 5555.56,
      "highestPrize": 25000.00,
      "lowestPrize": 500.00,
      "totalWinners": 45,
      "claimedPercentage": 97.78,
      "unclaimedPercentage": 2.22
    }
  },
  "timestamp": "2025-11-09T14:35:00Z"
}
```

### JackpotWinner Schema

```json
{
  "type": "object",
  "properties": {
    "winnerId": {
      "type": "string",
      "description": "Unique identifier for the win record",
      "pattern": "^winner-[0-9]{3,}$"
    },
    "userId": {
      "type": "string",
      "description": "ID of the winning user",
      "minLength": 5,
      "maxLength": 36
    },
    "templateId": {
      "type": "string",
      "description": "ID of the jackpot template",
      "pattern": "^jp-[0-9]{3,}$"
    },
    "jackpotName": {
      "type": "string",
      "description": "Display name of the jackpot",
      "minLength": 3,
      "maxLength": 100
    },
    "jackpotType": {
      "type": "string",
      "enum": ["progressive", "milestone", "random", "seasonal"],
      "description": "Type of the winning jackpot"
    },
    "prizeAmount": {
      "type": "number",
      "description": "Final prize amount after any adjustments",
      "minimum": 0,
      "multipleOf": 0.01
    },
    "currency": {
      "type": "string",
      "enum": ["USD", "EUR", "GBP", "JPY", "AUD", "CAD"],
      "description": "Currency code"
    },
    "winTime": {
      "type": "string",
      "format": "date-time",
      "description": "Timestamp when user won in ISO 8601 format"
    },
    "status": {
      "type": "string",
      "enum": ["pending", "claimed", "expired", "forfeited", "processing"],
      "description": "Current status of the prize"
    },
    "claimedAt": {
      "type": ["string", "null"],
      "format": "date-time",
      "description": "Timestamp when prize was claimed (null if unclaimed)"
    },
    "userCountry": {
      "type": "string",
      "description": "Country code of winner (ISO 3166-1 alpha-2)",
      "pattern": "^[A-Z]{2}$"
    },
    "winMultiplier": {
      "type": "number",
      "description": "Multiplier applied to base prize",
      "minimum": 0.1,
      "maximum": 10.0,
      "multipleOf": 0.1
    },
    "baseAmount": {
      "type": "number",
      "description": "Base prize amount before multiplier",
      "minimum": 0,
      "multipleOf": 0.01
    },
    "taxWithheld": {
      "type": "number",
      "description": "Tax amount withheld from prize",
      "minimum": 0,
      "multipleOf": 0.01
    }
  },
  "required": [
    "winnerId",
    "userId",
    "templateId",
    "jackpotName",
    "jackpotType",
    "prizeAmount",
    "currency",
    "winTime",
    "status"
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
      "message": "limit must be a positive integer not exceeding 500"
    },
    {
      "field": "jackpotType",
      "message": "jackpotType must be one of: progressive, milestone, random, seasonal"
    }
  ],
  "timestamp": "2025-11-09T14:35:00Z"
}
```

### 500 Internal Server Error

Server-side error occurred while retrieving winners.

```json
{
  "status": "error",
  "code": "INTERNAL_SERVER_ERROR",
  "message": "Failed to retrieve jackpot winners. Please try again later.",
  "requestId": "req-xyz-abc-123",
  "timestamp": "2025-11-09T14:35:00Z"
}
```

## Status Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Successfully retrieved jackpot winners |
| 400 | Bad Request | Invalid query parameters |
| 401 | Unauthorized | Missing or invalid authentication token |
| 500 | Internal Server Error | Server-side error |

## Validation Rules

1. **jackpotType Parameter**
   - Optional
   - Must be one of: "progressive", "milestone", "random", "seasonal"
   - Case-sensitive
   - If invalid, returns 400 Bad Request

2. **limit Parameter**
   - Must be a positive integer
   - Must not exceed 500
   - Default: 50
   - Common values: 10, 25, 50, 100

3. **offset Parameter**
   - Must be a non-negative integer
   - Used for pagination
   - Default: 0
   - Useful for loading more results

4. **sortBy Parameter**
   - Valid values: "winTime", "prizeAmount", "templateId"
   - Default: "winTime"
   - Case-sensitive

5. **sortOrder Parameter**
   - Valid values: "asc", "desc"
   - Default: "desc" (most recent first)
   - Case-insensitive

6. **Prize Amounts**
   - All amounts are non-negative numbers
   - Accurate to 2 decimal places
   - prizeAmount = (baseAmount * winMultiplier) - taxWithheld

7. **Dates**
   - All timestamps must be in ISO 8601 format
   - Must include timezone information
   - Sorted by winTime by default (most recent first)

8. **User Country**
   - Must be valid ISO 3166-1 alpha-2 country code
   - Examples: US, GB, CA, AU, DE, FR, JP

## Response Statistics

The response includes a `statistics` object with the following fields:

- **totalPrizesDistributed**: Sum of all prizeAmount values
- **averagePrize**: Mean prize amount across all winners
- **highestPrize**: Maximum prize amount
- **lowestPrize**: Minimum prize amount
- **totalWinners**: Total number of winners in database
- **claimedPercentage**: Percentage of prizes claimed
- **unclaimedPercentage**: Percentage of prizes not yet claimed

## Data Privacy

- User IDs are returned as provided (no masking)
- User country is included for transparency
- Partial user information is included to prevent abuse
- For sensitive data, use dedicated user endpoint

## Caching

- Response can be cached for up to 5 minutes
- Cache-Control header: "Cache-Control: public, max-age=300"
- Use ETag for conditional requests

## Rate Limiting

- Rate limit: 100 requests per minute per user
- Rate limit headers included in response:
  - `X-RateLimit-Limit`: 100
  - `X-RateLimit-Remaining`: Requests remaining
  - `X-RateLimit-Reset`: Unix timestamp when limit resets

## Pagination Guidelines

For efficient pagination:
- Start with limit=50, offset=0
- Check `hasMore` in pagination object
- Increment offset by limit value for next page
- Implement client-side caching to reduce API calls

## Performance Considerations

- Default response time: 200-500ms
- Response time with large offset may increase (implement cursor-based pagination for better performance)
- Large limit values may cause slower responses
- Recommended: limit <= 100 for optimal performance
