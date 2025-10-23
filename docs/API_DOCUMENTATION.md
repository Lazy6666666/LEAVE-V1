# Leave Management System - API Documentation

## Table of Contents

1. [API Overview](#api-overview)
2. [Authentication](#authentication)
3. [Base URL and Endpoints](#base-url-and-endpoints)
4. [User Management APIs](#user-management-apis)
5. [Leave Request APIs](#leave-request-apis)
6. [Leave Balance APIs](#leave-balance-apis)
7. [Approval APIs](#approval-apis)
8. [Notification APIs](#notification-apis)
9. [Calendar APIs](#calendar-apis)
10. [Document Management APIs](#document-management-apis)
11. [Search APIs](#search-apis)
12. [Report APIs](#report-apis)
13. [Error Handling](#error-handling)
14. [Rate Limiting](#rate-limiting)
15. [Webhooks](#webhooks)

---

## API Overview

The Leave Management System provides a comprehensive RESTful API for managing employee leave requests, user accounts, approvals, and system administration. This API documentation covers all available endpoints, request/response formats, authentication methods, and usage examples.

### API Features

- **RESTful Architecture**: Clean, resource-oriented API design
- **JSON Format**: Standard JSON request/response format
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access**: Permission-based endpoint access
- **Pagination**: Efficient data retrieval for large datasets
- **Filtering and Sorting**: Advanced data querying capabilities
- **Webhook Support**: Real-time event notifications
- **Comprehensive Error Handling**: Detailed error responses

### API Versioning

- **Current Version**: v1
- **Versioning Strategy**: URL-based versioning (`/api/v1/`)
- **Backward Compatibility**: Maintained for minor versions
- **Deprecation Policy**: 6-month deprecation notice for major changes

### Supported HTTP Methods

- **GET**: Retrieve resources
- **POST**: Create new resources
- **PUT**: Update existing resources (full update)
- **PATCH**: Partial resource updates
- **DELETE**: Remove resources

---

## Authentication

### Authentication Overview

The API uses JSON Web Tokens (JWT) for authentication. All API endpoints (except authentication endpoints) require a valid JWT token in the Authorization header.

### Getting Access Tokens

#### Login Endpoint

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@company.com",
  "password": "securePassword123"
}
```

#### Successful Response

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600,
    "user": {
      "id": "user_123",
      "email": "user@company.com",
      "name": "John Doe",
      "role": "employee",
      "department": "Engineering"
    }
  }
}
```

#### Using Access Tokens

```http
GET /api/v1/users/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

### Token Refresh

#### Refresh Token Endpoint

```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Logout Endpoint

```http
POST /api/v1/auth/logout
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Expiration

- **Access Token**: 1 hour expiration
- **Refresh Token**: 30 days expiration
- **Automatic Refresh**: Client applications should handle token refresh
- **Storage**: Store tokens securely (httpOnly cookies recommended)

---

## Base URL and Endpoints

### Environment URLs

#### Development Environment

```
Base URL: http://localhost:3002/api/v1
```

#### Staging Environment

```
Base URL: https://staging-leaves.company.com/api/v1
```

#### Production Environment

```
Base URL: https://leaves.company.com/api/v1
```

### Response Format

All API responses follow a consistent format:

#### Success Response

```json
{
  "success": true,
  "data": {
    // Response data here
  },
  "message": "Operation completed successfully",
  "timestamp": "2025-10-20T10:30:00.000Z"
}
```

#### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  },
  "timestamp": "2025-10-20T10:30:00.000Z"
}
```

---

## User Management APIs

### Get Current User Profile

Retrieve the profile information of the currently authenticated user.

```http
GET /api/v1/users/profile
Authorization: Bearer {token}
```

#### Response

```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "john.doe@company.com",
    "firstName": "John",
    "lastName": "Doe",
    "employeeId": "EMP001234",
    "department": "Engineering",
    "position": "Senior Developer",
    "role": "employee",
    "managerId": "user_456",
    "hireDate": "2022-01-15",
    "isActive": true,
    "leaveBalances": {
      "annual": 15.5,
      "sick": 8.0,
      "personal": 3.0
    },
    "createdAt": "2022-01-15T09:00:00.000Z",
    "updatedAt": "2025-10-19T14:30:00.000Z"
  }
}
```

### Update User Profile

Update the profile information of the current user.

```http
PUT /api/v1/users/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1-555-123-4567",
  "address": "123 Main St, City, State 12345"
}
```

### Get Users (Admin/Manager)

Retrieve a list of users with filtering and pagination options.

```http
GET /api/v1/users?department=Engineering&role=employee&page=1&limit=20
Authorization: Bearer {token}
```

#### Query Parameters

- `department` (optional): Filter by department
- `role` (optional): Filter by user role
- `isActive` (optional): Filter by active status (true/false)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `search` (optional): Search by name or email

#### Response

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user_123",
        "email": "john.doe@company.com",
        "name": "John Doe",
        "department": "Engineering",
        "role": "employee",
        "isActive": true
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

### Create User (Admin)

Create a new user account.

```http
POST /api/v1/users
Authorization: Bearer {token}
Content-Type: application/json

{
  "email": "new.user@company.com",
  "firstName": "New",
  "lastName": "User",
  "employeeId": "EMP001235",
  "department": "Engineering",
  "position": "Developer",
  "role": "employee",
  "managerId": "user_456",
  "hireDate": "2025-10-20",
  "leaveBalances": {
    "annual": 20,
    "sick": 10,
    "personal": 5
  }
}
```

### Update User (Admin)

Update user information.

```http
PUT /api/v1/users/{userId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "department": "Product",
  "position": "Senior Developer",
  "role": "manager",
  "isActive": true
}
```

### Deactivate User (Admin)

Deactivate a user account.

```http
DELETE /api/v1/users/{userId}
Authorization: Bearer {token}
```

---

## Leave Request APIs

### Create Leave Request

Submit a new leave request.

```http
POST /api/v1/leave-requests
Authorization: Bearer {token}
Content-Type: application/json

{
  "leaveType": "annual",
  "startDate": "2025-12-20",
  "endDate": "2025-12-31",
  "reason": "Christmas vacation with family",
  "isHalfDay": false,
  "documents": [
    {
      "name": "travel_itinerary.pdf",
      "url": "https://example.com/documents/travel.pdf"
    }
  ]
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "id": "leave_req_789",
    "userId": "user_123",
    "leaveType": "annual",
    "startDate": "2025-12-20",
    "endDate": "2025-12-31",
    "duration": 8,
    "reason": "Christmas vacation with family",
    "status": "pending",
    "approverId": "user_456",
    "documents": [
      {
        "id": "doc_123",
        "name": "travel_itinerary.pdf",
        "url": "https://example.com/documents/travel.pdf"
      }
    ],
    "createdAt": "2025-10-20T10:30:00.000Z",
    "updatedAt": "2025-10-20T10:30:00.000Z"
  }
}
```

### Get Leave Requests

Retrieve leave requests with filtering options.

```http
GET /api/v1/leave-requests?status=pending&userId=user_123&page=1&limit=20
Authorization: Bearer {token}
```

#### Query Parameters

- `status` (optional): Filter by status (pending, approved, rejected, cancelled)
- `userId` (optional): Filter by user ID
- `leaveType` (optional): Filter by leave type
- `startDate` (optional): Filter by start date (YYYY-MM-DD)
- `endDate` (optional): Filter by end date (YYYY-MM-DD)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

### Get Leave Request by ID

Retrieve details of a specific leave request.

```http
GET /api/v1/leave-requests/{requestId}
Authorization: Bearer {token}
```

### Update Leave Request

Update an existing leave request (only possible before approval).

```http
PUT /api/v1/leave-requests/{requestId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "startDate": "2025-12-21",
  "endDate": "2025-12-30",
  "reason": "Updated vacation plans"
}
```

### Cancel Leave Request

Cancel a pending or approved leave request.

```http
POST /api/v1/leave-requests/{requestId}/cancel
Authorization: Bearer {token}
Content-Type: application/json

{
  "reason": "Change in travel plans"
}
```

---

## Leave Balance APIs

### Get Leave Balances

Retrieve current leave balances for a user.

```http
GET /api/v1/leave-balances/{userId}
Authorization: Bearer {token}
```

#### Response

```json
{
  "success": true,
  "data": {
    "userId": "user_123",
    "balances": [
      {
        "leaveType": "annual",
        "totalDays": 20,
        "usedDays": 4.5,
        "remainingDays": 15.5,
        "pendingDays": 8,
        "accrualRate": 1.67,
        "lastAccrualDate": "2025-10-01"
      },
      {
        "leaveType": "sick",
        "totalDays": 10,
        "usedDays": 2,
        "remainingDays": 8,
        "pendingDays": 0,
        "accrualRate": 0.83,
        "lastAccrualDate": "2025-10-01"
      }
    ],
    "updatedAt": "2025-10-19T14:30:00.000Z"
  }
}
```

### Update Leave Balance (Admin)

Manually adjust leave balances.

```http
PUT /api/v1/leave-balances/{userId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "leaveType": "annual",
  "adjustment": 2,
  "reason": "Carry over from previous year",
  "effectiveDate": "2025-01-01"
}
```

### Get Leave Balance History

Retrieve historical changes to leave balances.

```http
GET /api/v1/leave-balances/{userId}/history?startDate=2025-01-01&endDate=2025-12-31
Authorization: Bearer {token}
```

---

## Approval APIs

### Get Pending Approvals (Manager)

Retrieve leave requests pending approval.

```http
GET /api/v1/approvals/pending?page=1&limit=20
Authorization: Bearer {token}
```

#### Response

```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "id": "leave_req_789",
        "user": {
          "id": "user_123",
          "name": "John Doe",
          "department": "Engineering",
          "position": "Senior Developer"
        },
        "leaveType": "annual",
        "startDate": "2025-12-20",
        "endDate": "2025-12-31",
        "duration": 8,
        "reason": "Christmas vacation with family",
        "submittedAt": "2025-10-20T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

### Approve Leave Request

Approve a pending leave request.

```http
POST /api/v1/approvals/{requestId}/approve
Authorization: Bearer {token}
Content-Type: application/json

{
  "comments": "Approved. Enjoy your vacation!",
  "notifyEmployee": true
}
```

### Reject Leave Request

Reject a pending leave request.

```http
POST /api/v1/approvals/{requestId}/reject
Authorization: Bearer {token}
Content-Type: application/json

{
  "reason": "Critical project deadline during this period",
  "comments": "Please reschedule for after project completion",
  "notifyEmployee": true
}
```

### Get Approval History

Retrieve approval history for a request.

```http
GET /api/v1/approvals/{requestId}/history
Authorization: Bearer {token}
```

---

## Notification APIs

### Get Notifications

Retrieve user notifications.

```http
GET /api/v1/notifications?page=1&limit=20&unread=true
Authorization: Bearer {token}
```

#### Query Parameters

- `unread` (optional): Filter by read status (true/false)
- `type` (optional): Filter by notification type
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

#### Response

```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif_123",
        "type": "leave_approved",
        "title": "Leave Request Approved",
        "message": "Your leave request for Dec 20-31 has been approved",
        "isRead": false,
        "data": {
          "requestId": "leave_req_789",
          "leaveType": "annual"
        },
        "createdAt": "2025-10-20T11:00:00.000Z"
      }
    ],
    "unreadCount": 3,
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "totalPages": 1
    }
  }
}
```

### Mark Notification as Read

Mark a notification as read.

```http
PUT /api/v1/notifications/{notificationId}/read
Authorization: Bearer {token}
```

### Mark All Notifications as Read

Mark all notifications as read for the user.

```http
PUT /api/v1/notifications/mark-all-read
Authorization: Bearer {token}
```

### Delete Notification

Delete a notification.

```http
DELETE /api/v1/notifications/{notificationId}
Authorization: Bearer {token}
```

---

## Calendar APIs

### Get Calendar Events

Retrieve calendar events for a specified date range.

```http
GET /api/v1/calendar/events?startDate=2025-12-01&endDate=2025-12-31&department=Engineering
Authorization: Bearer {token}
```

#### Query Parameters

- `startDate` (required): Start date (YYYY-MM-DD)
- `endDate` (required): End date (YYYY-MM-DD)
- `department` (optional): Filter by department
- `userId` (optional): Filter by specific user
- `eventType` (optional): Filter by event type (leave, holiday, event)

#### Response

```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "leave_req_789",
        "title": "John Doe - Annual Leave",
        "start": "2025-12-20",
        "end": "2025-12-31",
        "allDay": true,
        "type": "leave",
        "color": "#22c55e",
        "userId": "user_123",
        "userName": "John Doe",
        "department": "Engineering",
        "status": "approved"
      }
    ]
  }
}
```

### Get Company Holidays

Retrieve company holidays for a specified year.

```http
GET /api/v1/calendar/holidays?year=2025
Authorization: Bearer {token}
```

### Create Holiday (Admin)

Create a new company holiday.

```http
POST /api/v1/calendar/holidays
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Company Anniversary",
  "date": "2025-06-15",
  "type": "company",
  "recurring": true,
  "description": "Annual company celebration day"
}
```

---

## Document Management APIs

### Upload Document

Upload a document for a leave request.

```http
POST /api/v1/documents/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: [binary file data]
requestId: leave_req_789
documentType: medical_certificate
description: "Medical certificate for sick leave"
```

#### Response

```json
{
  "success": true,
  "data": {
    "id": "doc_456",
    "name": "medical_certificate.pdf",
    "originalName": "doctor_note.pdf",
    "size": 1024000,
    "type": "application/pdf",
    "url": "https://example.com/documents/doc_456.pdf",
    "requestId": "leave_req_789",
    "documentType": "medical_certificate",
    "uploadedBy": "user_123",
    "createdAt": "2025-10-20T10:45:00.000Z"
  }
}
```

### Get Documents

Retrieve documents for a leave request.

```http
GET /api/v1/documents?requestId=leave_req_789
Authorization: Bearer {token}
```

### Download Document

Download a document file.

```http
GET /api/v1/documents/{documentId}/download
Authorization: Bearer {token}
```

### Delete Document

Delete a document.

```http
DELETE /api/v1/documents/{documentId}
Authorization: Bearer {token}
```

---

## Search APIs

### Global Search

Perform a global search across leave requests, users, and documents.

```http
GET /api/v1/search?q=john vacation&page=1&limit=20
Authorization: Bearer {token}
```

#### Query Parameters

- `q` (required): Search query
- `type` (optional): Search type (requests, users, documents, all)
- `filters` (optional): Additional filters in JSON format
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

#### Response

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "type": "leave_request",
        "id": "leave_req_789",
        "title": "John Doe - Annual Leave Request",
        "description": "Christmas vacation with family",
        "url": "/leave-requests/leave_req_789",
        "highlight": "John Doe - <mark>Annual</mark> Leave Request",
        "score": 0.95
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 8,
      "totalPages": 1
    }
  }
}
```

### Advanced Search

Perform advanced search with complex filters.

```http
POST /api/v1/search/advanced
Authorization: Bearer {token}
Content-Type: application/json

{
  "query": "vacation",
  "filters": {
    "leaveType": ["annual", "personal"],
    "status": ["approved", "pending"],
    "dateRange": {
      "start": "2025-01-01",
      "end": "2025-12-31"
    },
    "departments": ["Engineering", "Product"]
  },
  "sort": {
    "field": "createdAt",
    "order": "desc"
  },
  "page": 1,
  "limit": 20
}
```

---

## Report APIs

### Generate Leave Report

Generate a comprehensive leave report.

```http
POST /api/v1/reports/leave
Authorization: Bearer {token}
Content-Type: application/json

{
  "reportType": "utilization",
  "dateRange": {
    "start": "2025-01-01",
    "end": "2025-12-31"
  },
  "filters": {
    "departments": ["Engineering", "Product"],
    "leaveTypes": ["annual", "sick"],
    "statuses": ["approved"]
  },
  "format": "pdf"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "reportId": "report_789",
    "status": "processing",
    "estimatedTime": 30,
    "downloadUrl": null
  }
}
```

### Get Report Status

Check the status of a generated report.

```http
GET /api/v1/reports/{reportId}/status
Authorization: Bearer {token}
```

#### Response

```json
{
  "success": true,
  "data": {
    "reportId": "report_789",
    "status": "completed",
    "progress": 100,
    "downloadUrl": "https://example.com/reports/report_789.pdf",
    "expiresAt": "2025-10-27T10:45:00.000Z",
    "createdAt": "2025-10-20T10:45:00.000Z",
    "completedAt": "2025-10-20T11:15:00.000Z"
  }
}
```

### Download Report

Download a generated report.

```http
GET /api/v1/reports/{reportId}/download
Authorization: Bearer {token}
```

### Get Dashboard Analytics

Retrieve dashboard analytics data.

```http
GET /api/v1/reports/analytics?period=monthly&year=2025
Authorization: Bearer {token}
```

#### Response

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalEmployees": 150,
      "totalRequests": 1250,
      "approvalRate": 0.92,
      "averageProcessingTime": 48
    },
    "leaveUtilization": [
      {
        "month": "2025-01",
        "annual": 45.5,
        "sick": 12.3,
        "personal": 8.7
      }
    ],
    "departmentStats": [
      {
        "department": "Engineering",
        "totalRequests": 320,
        "approvalRate": 0.94,
        "topLeaveType": "annual"
      }
    ]
  }
}
```

---

## Error Handling

### Error Response Format

All error responses follow a consistent format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": [
      {
        "field": "field_name",
        "message": "Specific field error"
      }
    ]
  },
  "timestamp": "2025-10-20T10:30:00.000Z",
  "requestId": "req_123456"
}
```

### Common Error Codes

#### Authentication Errors

- `UNAUTHORIZED` (401): Invalid or missing authentication token
- `TOKEN_EXPIRED` (401): Authentication token has expired
- `INSUFFICIENT_PERMISSIONS` (403): User lacks required permissions

#### Validation Errors

- `VALIDATION_ERROR` (400): Request data validation failed
- `MISSING_REQUIRED_FIELD` (400): Required field is missing
- `INVALID_FORMAT` (400): Field format is invalid

#### Business Logic Errors

- `INSUFFICIENT_LEAVE_BALANCE` (400): Not enough leave balance
- `DUPLICATE_REQUEST` (409): Duplicate leave request
- `REQUEST_NOT_MODIFIABLE` (400): Request cannot be modified in current state

#### System Errors

- `INTERNAL_SERVER_ERROR` (500): Unexpected server error
- `SERVICE_UNAVAILABLE` (503): Service temporarily unavailable
- `RATE_LIMIT_EXCEEDED` (429): Too many requests

### Handling Errors

#### Client-Side Error Handling

```javascript
try {
  const response = await fetch("/api/v1/leave-requests", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestData),
  });

  const result = await response.json();

  if (!result.success) {
    // Handle error based on error code
    switch (result.error.code) {
      case "VALIDATION_ERROR":
        // Show validation errors to user
        break;
      case "INSUFFICIENT_LEAVE_BALANCE":
        // Show insufficient balance message
        break;
      default:
      // Show generic error message
    }
  }
} catch (error) {
  // Handle network or other errors
}
```

---

## Rate Limiting

### Rate Limiting Rules

The API implements rate limiting to ensure fair usage and system stability:

#### Authentication Endpoints

- **Login**: 5 requests per minute per IP
- **Token Refresh**: 10 requests per minute per user

#### Standard Endpoints

- **GET Requests**: 100 requests per minute per user
- **POST/PUT/PATCH Requests**: 50 requests per minute per user
- **DELETE Requests**: 20 requests per minute per user

#### Report Generation

- **Report Creation**: 5 requests per minute per user
- **Report Download**: 20 requests per minute per user

### Rate Limit Headers

All API responses include rate limiting headers:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1697829420
```

### Handling Rate Limits

When rate limits are exceeded, the API returns a 429 status code:

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retryAfter": 60
  }
}
```

#### Exponential Backoff Strategy

```javascript
async function apiCallWithRetry(url, options, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After") || 60;
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff

        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      return response;
    } catch (error) {
      if (attempt === maxRetries) throw error;

      const delay = Math.pow(2, attempt) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}
```

---

## Webhooks

### Webhook Overview

Webhooks provide real-time notifications when events occur in the system. Configure webhook endpoints to receive instant notifications about leave requests, approvals, and other important events.

### Supported Events

#### Leave Request Events

- `leave_request.created`: New leave request submitted
- `leave_request.approved`: Leave request approved
- `leave_request.rejected`: Leave request rejected
- `leave_request.cancelled`: Leave request cancelled
- `leave_request.updated`: Leave request modified

#### User Events

- `user.created`: New user account created
- `user.updated`: User profile updated
- `user.deactivated`: User account deactivated

#### System Events

- `system.maintenance`: Scheduled maintenance notification
- `system.backup_completed`: Backup process completed
- `report.generated`: Report generation completed

### Webhook Configuration

#### Create Webhook

```http
POST /api/v1/webhooks
Authorization: Bearer {token}
Content-Type: application/json

{
  "url": "https://your-app.com/webhooks/leave-events",
  "events": [
    "leave_request.created",
    "leave_request.approved",
    "leave_request.rejected"
  ],
  "secret": "your-webhook-secret-key",
  "active": true,
  "description": "Leave request notifications"
}
```

#### Webhook Payload Format

Webhook payloads are sent as POST requests with JSON content:

```json
{
  "event": "leave_request.approved",
  "timestamp": "2025-10-20T10:30:00.000Z",
  "data": {
    "requestId": "leave_req_789",
    "userId": "user_123",
    "leaveType": "annual",
    "startDate": "2025-12-20",
    "endDate": "2025-12-31",
    "duration": 8,
    "approverId": "user_456",
    "approvedAt": "2025-10-20T10:30:00.000Z"
  }
}
```

#### Webhook Security

Webhooks include a signature header for verification:

```http
X-Webhook-Signature: sha256=5d41402abc4b2a76b9719d911017c592
```

##### Signature Verification (Node.js)

```javascript
const crypto = require("crypto");

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

### Webhook Management

#### List Webhooks

```http
GET /api/v1/webhooks
Authorization: Bearer {token}
```

#### Update Webhook

```http
PUT /api/v1/webhooks/{webhookId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "url": "https://updated-url.com/webhooks",
  "events": ["leave_request.created"],
  "active": false
}
```

#### Delete Webhook

```http
DELETE /api/v1/webhooks/{webhookId}
Authorization: Bearer {token}
```

#### Test Webhook

Send a test webhook payload:

```http
POST /api/v1/webhooks/{webhookId}/test
Authorization: Bearer {token}
```

---

## SDK and Client Libraries

### JavaScript/TypeScript SDK

#### Installation

```bash
npm install @company/leave-management-sdk
```

#### Basic Usage

```typescript
import { LeaveManagementAPI } from "@company/leave-management-sdk";

const api = new LeaveManagementAPI({
  baseURL: "https://leaves.company.com/api/v1",
  token: "your-jwt-token",
});

// Get user profile
const profile = await api.users.getProfile();

// Create leave request
const request = await api.leaveRequests.create({
  leaveType: "annual",
  startDate: "2025-12-20",
  endDate: "2025-12-31",
  reason: "Christmas vacation",
});

// Get pending approvals
const pending = await api.approvals.getPending();
```

### Python SDK

#### Installation

```bash
pip install leave-management-sdk
```

#### Basic Usage

```python
from leave_management_sdk import LeaveManagementAPI

api = LeaveManagementAPI(
    base_url='https://leaves.company.com/api/v1',
    token='your-jwt-token'
)

# Get user profile
profile = api.users.get_profile()

# Create leave request
request = api.leave_requests.create(
    leave_type='annual',
    start_date='2025-12-20',
    end_date='2025-12-31',
    reason='Christmas vacation'
)

# Get pending approvals
pending = api.approvals.get_pending()
```

---

## API Changelog

### Version 1.2.0 (Latest)

- Added webhook support for real-time notifications
- Enhanced search capabilities with advanced filtering
- Improved error handling and response formats
- Added rate limiting headers

### Version 1.1.0

- Added document management APIs
- Introduced report generation endpoints
- Enhanced calendar functionality
- Added bulk operations for user management

### Version 1.0.0

- Initial API release
- Core leave management functionality
- User authentication and authorization
- Basic reporting capabilities

---

## Support and Resources

### Documentation

- **API Reference**: Complete endpoint documentation
- **SDK Documentation**: Client library guides
- **Integration Guides**: Step-by-step integration tutorials
- **Best Practices**: API usage recommendations

### Support Channels

- **Technical Support**: api-support@company.com
- **Developer Community**: https://community.company.com
- **Status Page**: https://status.company.com
- **Issue Tracking**: https://github.com/company/api-issues

### Rate Limits and Quotas

- **Standard Plan**: 10,000 requests per month
- **Professional Plan**: 100,000 requests per month
- **Enterprise Plan**: Unlimited requests
- **Custom Plans**: Contact sales for custom requirements

---

## Glossary

| Term              | Definition                                   |
| ----------------- | -------------------------------------------- |
| **JWT**           | JSON Web Token for authentication            |
| **API**           | Application Programming Interface            |
| **REST**          | Representational State Transfer architecture |
| **CRUD**          | Create, Read, Update, Delete operations      |
| **SLA**           | Service Level Agreement                      |
| **Rate Limiting** | Controlling API request frequency            |
| **Webhook**       | HTTP callback for event notifications        |
| **SDK**           | Software Development Kit                     |

---

**This API documentation covers all available endpoints for the Leave Management System. For technical support or questions, please contact the API development team or refer to the developer resources.**

**Version**: 1.2.0
**Last Updated**: October 20, 2025
**API Version**: v1
**Base URL**: https://leaves.company.com/api/v1
