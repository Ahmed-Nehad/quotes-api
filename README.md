
# Quotes API

A backend service for providing quotes through an API, supporting user authentication, subscription plans, and PayPal integration for subscription upgrades. It is built with Node.js, Hono, Prisma, MongoDB, JWT and paypal.


## Features

- User Authentication
- Subscription Plans Management
- Fetch a random quote
## Usage

Once the server is running and you have added quotes to the database, you can start making requests to the API.

### Sign up a new user

```bash
curl -v -X POST http://localhost:3003/sign-up \
-H 'Content-Type: application/json' \
-d '{
    "name": "Ahma"`,
    "email": "exmaple@email.com",
    "password": "password",
}'
```

#### example response

```bash
{
    "token": "eyJhbG...",
    "apiKey": "UqyNtusL-KA0ribVFM5Zwo"
}
```

### Using the api to get a random quote

```bash
curl -v -X GET http://localhost:3003/v1/quotes?key=UqyNtusL-KA0ribVFM5Zwo
```
#### example response

```bash
{
    "text": "Imagination is more important than knowledge.",
    "categoryName": "fun",
    "author": "Albert Einstein"
}
```

## License

This project is licensed under the [MIT](https://choosealicense.com/licenses/mit/) License.

