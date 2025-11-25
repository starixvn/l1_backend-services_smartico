// MongoDB seed script for authentication testing
// Run with: mongosh smartico_backoffice scripts/seed-auth-data.js

const operatorId = ObjectId("507f1f77bcf86cd799439011");

// Create Admin Role with all permissions
const adminRole = {
  _id: ObjectId("507f1f77bcf86cd799439012"),
  operatorId: operatorId,
  name: "Administrator",
  permissions: [
    "ViewTournaments",
    "CreateTournaments",
    "EditTournaments",
    "DeleteTournaments",
    "PublishTournaments",
    "ViewMissions",
    "CreateMissions",
    "EditMissions",
    "DeleteMissions",
    "PublishMissions",
    "ViewUsers",
    "CreateUsers",
    "EditUsers",
    "DeleteUsers",
    "ManageUserRoles",
    "ViewRoles",
    "CreateRoles",
    "EditRoles",
    "DeleteRoles",
    "ViewAnalytics",
    "ExportReports",
    "ManageOperatorSettings",
    "ViewAuditLogs"
  ],
  isSystem: true,
  createdAt: new Date(),
  updatedAt: new Date()
};

// Password: "Admin123!" hashed with BCrypt
const adminUser = {
  _id: ObjectId("507f1f77bcf86cd799439013"),
  operatorId: operatorId,
  email: "admin@example.com",
  fullName: "System Administrator",
  passwordHash: "$2a$11$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
  roleIds: [ObjectId("507f1f77bcf86cd799439012")],
  isActive: true,
  lastLoginAt: null,
  createdAt: new Date(),
  updatedAt: new Date()
};

// Create Manager Role with limited permissions
const managerRole = {
  _id: ObjectId("507f1f77bcf86cd799439014"),
  operatorId: operatorId,
  name: "Campaign Manager",
  permissions: [
    "ViewTournaments",
    "CreateTournaments",
    "EditTournaments",
    "PublishTournaments",
    "ViewMissions",
    "CreateMissions",
    "EditMissions",
    "PublishMissions",
    "ViewAnalytics"
  ],
  isSystem: false,
  createdAt: new Date(),
  updatedAt: new Date()
};

// Password: "Manager123!" hashed with BCrypt
const managerUser = {
  _id: ObjectId("507f1f77bcf86cd799439015"),
  operatorId: operatorId,
  email: "manager@example.com",
  fullName: "Campaign Manager",
  passwordHash: "$2a$11$zFZ3Ey7E.qV9hGvLj0LfWujZ8W1K7qYTJ6xWHpqKjD.jKmYzCLZ3u",
  roleIds: [ObjectId("507f1f77bcf86cd799439014")],
  isActive: true,
  lastLoginAt: null,
  createdAt: new Date(),
  updatedAt: new Date()
};

// Insert roles
try {
  db.roles.deleteMany({ operatorId: operatorId });
  db.roles.insertMany([adminRole, managerRole]);
  print("✓ Roles created successfully");
} catch (e) {
  print("✗ Error creating roles:", e);
}

// Insert users
try {
  db.users.deleteMany({ operatorId: operatorId });
  db.users.insertMany([adminUser, managerUser]);
  print("✓ Users created successfully");
} catch (e) {
  print("✗ Error creating users:", e);
}

print("\n=== Seed Data Summary ===");
print("\nTest Accounts:");
print("1. Administrator");
print("   Email: admin@example.com");
print("   Password: Admin123!");
print("   Permissions: All");
print("\n2. Campaign Manager");
print("   Email: manager@example.com");
print("   Password: Manager123!");
print("   Permissions: Campaign management only");
print("\nAPI Endpoint: http://localhost:5120/api/auth/login");
print("Swagger UI: http://localhost:5120/swagger");
