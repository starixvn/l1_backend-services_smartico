# MongoDB Seed Data Import Instructions

This folder contains JSON files for importing test data into MongoDB using MongoDB Compass.

## Import Steps

**IMPORTANT**: Import in this order to ensure referential integrity.

### 1. Import Permissions Collection

1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. Select database: `smartico_backoffice`
4. Create or select collection: `permissions`
5. Click "ADD DATA" → "Import JSON or CSV file"
6. Select file: `seed-permissions.json`
7. Click "Import"

### 2. Import Roles Collection

1. In the same database: `smartico_backoffice`
2. Create or select collection: `roles`
3. Click "ADD DATA" → "Import JSON or CSV file"
4. Select file: `seed-roles.json`
5. Click "Import"

### 3. Import Users Collection

1. In the same database: `smartico_backoffice`
2. Create or select collection: `users`
3. Click "ADD DATA" → "Import JSON or CSV file"
4. Select file: `seed-users.json`
5. Click "Import"

## Test Accounts

After import, you can login with these accounts:

### Administrator Account
- **Email**: admin@example.com
- **Password**: Admin123!
- **Permissions**: All (full system access)

### Campaign Manager Account
- **Email**: manager@example.com
- **Password**: Manager123!
- **Permissions**: Campaign management only (tournaments, missions, analytics)

## API Endpoints

- **Login**: POST http://localhost:5120/api/auth/login
- **Swagger UI**: http://localhost:5120/swagger

## Login Request Example

```json
{
  "email": "admin@example.com",
  "password": "Admin123!"
}
```

## Important Notes

- The `operatorId` for all test data is: `507f1f77bcf86cd799439011`
- Password hashes are BCrypt hashed with work factor 11
- The Administrator role has `isSystem: true` (cannot be deleted)
- Both users are active (`isActive: true`)
