# Food Expiry Tracker Server

Backend API for a Food Expiry Tracker application. This server provides food item management, expiry status data, search/category filtering, and Firebase-protected user item routes.

## Features

- Express.js REST API
- MongoDB database integration
- Firebase Admin token verification
- Food item CRUD operations
- Search foods by name
- Filter foods by category
- Get nearly expired foods
- Get expired and expiry-soon item counts
- Protected routes for authenticated users

## Technologies Used

- Node.js
- Express.js
- MongoDB
- Firebase Admin SDK
- CORS
- dotenv

## Installation

1. Clone the repository.

```bash
git clone <repository-url>
cd food-expiry-tracker-server
```

2. Install dependencies.

```bash
npm install
```

3. Create a `.env` file in the project root and add the required environment variables.

```env
PORT=3000
USER_NAME=your_mongodb_username
PASSWORD=your_mongodb_password
FIREBASE_SERVICE_KEYS=your_base64_encoded_firebase_service_account
```

4. Start the server.

```bash
nodemon index.js
```

The server will run at:

```text
http://localhost:3000
```

## Environment Variables

| Variable | Description |
| --- | --- |
| `PORT` | Server port. Defaults to `3000` if not provided. |
| `USER_NAME` | MongoDB Atlas database username. |
| `PASSWORD` | MongoDB Atlas database password. |
| `FIREBASE_SERVICE_KEYS` | Base64 encoded Firebase service account JSON. |

## API Endpoints

### Root

#### `GET /`

Checks whether the server is running.

Response:

```text
Food Expiry Tracker Server Is running
```

### Foods

#### `GET /foods`

Returns all food items with optional pagination.

Query parameters:

| Parameter | Type | Description |
| --- | --- | --- |
| `skip` | number | Number of items to skip. |
| `limit` | number | Number of items to return. |

Response includes:

- `result`: list of food items
- `total`: total number of food items

#### `GET /foods/:id`

Returns a single food item by MongoDB document ID.

#### `POST /foods`

Adds a new food item.

Authentication required: Firebase Bearer token.

Headers:

```text
Authorization: Bearer <firebase_id_token>
```

#### `PUT /foods/:id`

Updates a food item by ID.

#### `PATCH /foods/:id`

Adds a note to a food item.

#### `DELETE /foods/:id`

Deletes a food item by ID.

### User Items

#### `GET /myItems`

Returns food items for the authenticated user.

Authentication required: Firebase Bearer token.

Query parameters:

| Parameter | Type | Description |
| --- | --- | --- |
| `email` | string | Authenticated user's email address. |
| `skip` | number | Number of items to skip. |
| `limit` | number | Number of items to return. |

The request email must match the email decoded from the Firebase token.

### Expiry Data

#### `GET /nearlyExpire`

Returns foods that will expire within the next 5 days.

Query parameters:

| Parameter | Type | Description |
| --- | --- | --- |
| `limit` | number | Number of items to return. |

#### `GET /expire-count`

Returns counts for expired foods and foods expiring soon.

Response:

```json
{
  "expiredCount": 0,
  "expirySoonCount": 0
}
```

### Search and Filter

#### `GET /search`

Searches foods by name.

Query parameters:

| Parameter | Type | Description |
| --- | --- | --- |
| `search` | string | Search keyword. |

#### `GET /category`

Returns foods from a selected category.

Query parameters:

| Parameter | Type | Description |
| --- | --- | --- |
| `category` | string | Food category name. |

## Authentication

Protected routes expect a Firebase ID token in the `Authorization` header:

```text
Authorization: Bearer <firebase_id_token>
```

The server verifies the token using Firebase Admin SDK. For `/myItems`, the email in the query string must match the email from the verified token.



## Notes

- Expiry dates are compared as ISO date strings.
- The Firebase service account should be base64 encoded before storing it in the `.env` file.
