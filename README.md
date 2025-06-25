# Altheros-Capital
Webapp and Mobile App Repo for Altheros Capital

---

## Prerequisites

- Install [Docker Desktop](https://www.docker.com/products/docker-desktop)
- Make sure Docker is running on your machine

---

## Start the App

Use the following command from the root of the project:

```bash
docker-compose build --no-cache
docker-compose up
```

---

## Once Running

- Frontend available at: http://localhost:3000
- Backend available at: http://localhost:8080

---

## Stop the App

```bash
docker-compose down -v
```

---

### Notes

- The backend expects a .env file inside server/ that contains the required environment variables (feel free to ask Pranav for the file info if needed)
- The frontend .env file has been blocked out of the docker-compose for now, as I don't think they have anything yet (uncomment lines when needed)