# Backend API Reference - Leave Management System

Quick reference guide for all backend API endpoints.

---

## Authentication APIs

### POST /api/auth/register
**Description**: Register new user account
**Access**: Public
**Body**: `{ email, password, full_name, department }`
**Response**: `201` Created with user data

---

## Document Management APIs

### POST /api/documents
**Description**: Upload new document
**Access**: Admin, HR only
**Body**: `FormData` with file and metadata
**Fields**: `file, title, description?, category, tags?, expiry_date?, access_level`
**Response**: `201` Created with document data

### GET /api/documents
**Description**: List documents with search and filters
**Access**: Authenticated users (filtered by access level)
**Query Params**: `search, category, tags, uploader, dateFrom, dateTo, expiryStatus, accessLevel, sortBy, sortOrder, limit, offset`
**Response**: `200` OK with paginated document list

### GET /api/documents/[id]
**Description**: Get document details
**Access**: Authenticated users (based on access level)
**Response**: `200` OK with document data or `404` Not Found

### PATCH /api/documents/[id]
**Description**: Update document metadata
**Access**: Admin, HR only (or document uploader)
**Body**: `{ title?, description?, category?, tags?, expiry_date?, access_level? }`
**Response**: `200` OK with updated document data

### DELETE /api/documents/[id]
**Description**: Delete document
**Access**: Admin only
**Response**: `200` OK with success message

### GET /api/documents/[id]/download
**Description**: Download document file
**Access**: Authenticated users (based on access level)
**Response**: `200` OK with file stream or `404` Not Found

### GET /api/documents/expiry
**Description**: Get expiring and expired documents
**Access**: Admin, HR only
**Query Params**: `status` (expiring|expired|all)
**Response**: `200` OK with document list

---

## Leave Management APIs

### POST /api/leaves
**Description**: Create new leave request
**Access**: Authenticated users
**Body**: `{ leave_type_id, start_date, end_date, days_count, reason? }`
**Response**: `201` Created with leave data

### GET /api/leaves
**Description**: List leave requests (filtered by role)
**Access**: Authenticated users
**Query Params**: `status, start_date, end_date, leave_type_id, user_id, limit, offset`
**Response**: `200` OK with paginated leave list

### POST /api/leaves/{id}/approve
**Description**: Approve leave request
**Access**: Manager, HR, Admin
**Body**: `{ manager_comment? }`
**Response**: `200` OK with updated leave

### POST /api/leaves/{id}/reject
**Description**: Reject leave request
**Access**: Manager, HR, Admin
**Body**: `{ manager_comment }`
**Response**: `200` OK with updated leave

### POST /api/leaves/{id}/cancel
**Description**: Cancel leave request
**Access**: Leave owner or Admin/HR
**Body**: `{ cancellation_reason? }`
**Response**: `200` OK with updated leave

### POST /api/leaves/check-conflicts
**Description**: Check for overlapping leave requests
**Access**: Authenticated users
**Body**: `{ start_date, end_date, user_id? }`
**Response**: `200` OK with conflict status

---

## Leave Types APIs

### GET /api/leave-types
**Description**: List all active leave types
**Access**: Authenticated users
**Response**: `200` OK with leave types array

---

## Calendar APIs

### GET /api/calendar
**Description**: Get calendar events (leaves + holidays)
**Access**: Authenticated users
**Query Params**: `start_date, end_date`
**Response**: `200` OK with events array

---

## Document Management APIs

### POST /api/documents
**Description**: Upload new company document
**Access**: Admin, HR only
**Content-Type**: `multipart/form-data`
**Body**:
```
file: File (PDF, DOC, DOCX, XLS, XLSX, images)
metadata: JSON {
  title: string,
  description?: string,
  category: "Policy" | "Procedure" | "Form" | "Guidelines" | "Manual" | "Other",
  tags?: string[],
  expiry_date?: ISO datetime,
  access_level?: "PUBLIC" | "EMPLOYEE" | "MANAGER" | "ADMIN" | "HR"
}
```
**Response**: `201` Created with document metadata

**Validation**:
- Max file size: 10MB
- Allowed types: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, JPEG, GIF
- Title: 1-200 characters
- Description: max 1000 characters
- Tags: max 10 tags, each max 50 characters

### GET /api/documents
**Description**: List documents (filtered by access level)
**Access**: All authenticated users
**Query Params**: `category, tags, search, access_level, limit, offset`
**Response**: `200` OK with paginated document list

**Access Control**:
- EMPLOYEE: PUBLIC, EMPLOYEE documents
- MANAGER: PUBLIC, EMPLOYEE, MANAGER documents
- HR: PUBLIC, EMPLOYEE, MANAGER, HR documents
- ADMIN: All documents

---

## Error Response Format

All APIs return errors in this format:

```json
{
  "error": "Error message",
  "details?": [...] // Optional validation details
}
```

**Common Status Codes**:
- `200` OK - Success
- `201` Created - Resource created
- `400` Bad Request - Validation error
- `401` Unauthorized - Not authenticated
- `403` Forbidden - Not authorized
- `404` Not Found - Resource not found
- `409` Conflict - Resource conflict
- `500` Internal Server Error - Server error

---

## Authentication

All API routes (except `/api/auth/register`) require authentication.

**Authentication Method**: Supabase Auth with cookies
**Headers**: Cookies automatically sent by browser

**Getting Current User**:
```typescript
const supabase = createClient();
const { data: { user } } = await supabase.auth.getUser();
```

---

## Pagination

APIs that return lists use this pagination format:

**Query Parameters**:
- `limit`: Number of results (default: 50, max: 100)
- `offset`: Skip N results (default: 0)

**Response Format**:
```json
{
  "items": [...],
  "total": 150,
  "limit": 50,
  "offset": 0
}
```

---

## File Upload

File upload endpoints use `multipart/form-data`:

**JavaScript Example**:
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('metadata', JSON.stringify({
  title: 'Document Title',
  category: 'Policy'
}));

const response = await fetch('/api/documents', {
  method: 'POST',
  body: formData
});
```

**cURL Example**:
```bash
curl -X POST http://localhost:3000/api/documents \
  -H "Cookie: sb-access-token=..." \
  -F "file=@document.pdf" \
  -F 'metadata={"title":"Policy Document","category":"Policy"}'
```

---

## Rate Limiting

**Current Status**: No rate limiting implemented

**Recommended Limits** (for production):
- Authentication: 5 requests per minute per IP
- Uploads: 10 requests per hour per user
- Queries: 100 requests per minute per user

---

## Storage

### Supabase Storage Buckets

**company-documents**:
- Type: Private
- Max size: 50MB
- Access: Signed URLs (1 year expiry)
- Folder: `documents/{userId}/{uuid}-{filename}`

**leave-attachments**:
- Type: Private
- Max size: 10MB
- Access: Signed URLs
- Folder: `attachments/{leaveId}/{uuid}-{filename}`

**profile-photos**:
- Type: Public
- Max size: 2MB
- Access: Public URLs
- Folder: `profiles/{userId}/{uuid}-{filename}`

---

## Database Schema

### Key Tables

**users**: User accounts (Supabase Auth)
**profiles**: User profile data (role, department, etc.)
**leaves**: Leave requests
**leave_types**: Leave type definitions
**company_documents**: Company document metadata
**notification_logs**: User notifications
**audit_logs**: Audit trail

See `prisma/schema.prisma` for complete schema.

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx

# Database
DATABASE_URL=prisma+postgres://...
DIRECT_URL=postgresql://...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Development Tips

### Testing APIs with cURL

**Authenticate first**:
```bash
# Get auth cookies from browser DevTools
curl -X GET http://localhost:3000/api/leaves \
  -H "Cookie: sb-access-token=xxx; sb-refresh-token=xxx"
```

### Using Prisma Studio

View and edit database data:
```bash
npm run prisma:studio
```

### Database Migrations

```bash
# Create migration
npm run prisma:migrate

# Reset database (dev only)
npm run db:reset

# Push schema without migration
npm run db:push
```

---

## Contact

For questions or issues with the backend APIs, contact the Backend Development team.

**Documentation Version**: 1.0.0
**Last Updated**: October 19, 2024
