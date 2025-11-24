1. Title of the project: Proyecto 7 API REST AUTH.
2. Description:
What the project does? -> BBDD for a Game’s Hub website. It has three models: Users.js, Game.js, GameSessions.js. Allow users to register, login, create games, view which games are on BBDD, create sessions, view sessions, delete users, games and sessions, etc.
What is for? Hypothetical database for a Game’s Hub website (it is just an example because it is not connecting to Front).
Technologies: NPM -> npm init -y, Express -> npm i express, Dotenv -> npm i dotenv, Mongoose -> npm i mongoose, jsonwebtoken -> npm i jsonwebtoken, bcrypt ->  encript password
Roles
user -> can register, log in, manage their own profile, and create/view their own game sessions.
admin -> full access: can manage all users, all games, and all game sessions.
Role validation is handled through JWT authentication (isAuth.js) and authorization (isAdmin.js) middlewares.
 
Collection Relationships. The project includes two main relationships:
User → GameSession: each game session belongs to a specific user.
user: { type: ObjectId, ref: "User" }
Game → GameSession: each session is linked to a specific game.
game: { type: ObjectId, ref: "Game" }
A user can have multiple game sessions. A game can have multiple sessions associated.
GameSession.find().populate("user", "userName").populate("game", "name");
3. Prerequisites:
Node installed
MongoDB
Postman/Insomnia (for tests)
4. Installation and use
.env -> PORT=4000. DB_URL=mongodb+srv//your_db_user:password@cluster.yourBBDD. JWT_SECRET=whatever123
Star server: npm run dev
5. Seed (run initial data) -> npm run usersSeed
7. Endpoints
Users:
getAllUsers() GET all users /api/v1/users -> Read users only admin. 
getUser() GET a specific user /api/v1/users/user/:userName. 
registerUser() POST /api/v1/users/register {
  "userName": "",
  "email": "",
  "password": ""
}
registerAdmin() POST /api/v1/users/register/admin -> An admin creates another admin.
loginUser() POST  /api/v1/users/login -> will generate a token
updateUser() PUT /api/v1/users/update/:id -> only admins and the owner of the user if they are authenticated (token)
deleteUser() DELETE /api/v1/users/:id -> only admins (admin can delete any user) and the owner of the user if they are authenticated (token)

Games:
createGame() POST /api/v1/games/ -> Create a game only admin
{
    "name": "",
    "slug": "",
    "description": "",
},
getAllGames() GET /api/v1/games/ -> Read all games
getGameBySlug() GET /api/v1/games/:slug -> Read a game by slug
updateGame() PUT /api/v1/games/:id -> Updates a game only an admin
deleteGame() DELETE /api/v1/games/:id -> Deletes a game only admin

Game Sessions.
createSession() POST /api/v1/sessions/ 
getAllSessions() GET /api/v1/sessions/ -> Only admins
getUserSessions() GET /api/v1/sessions/user/:id -> Only admin or owner of session
getGameSessions() GET /api/v1/sessions/game/:id -> user owner session
getSessions() GET /api/v1/sessions/:id -> user owner or admins
deleteSession() DELETE /api/v1/sessions/:id -> user owner or admins

8. PROYECTO 7 API REST AUTH/
│
├── server.js
│
├── src/
│   ├── api/
│   │   ├── controllers/
│   │   │   ├── gameControllers.js
│   │   │   ├── gameSessionControllers.js
│   │   │   └── userControllers.js
│   │   │
│   │   ├── models/
│   │   │   ├── Game.js
│   │   │   ├── GameSession.js
│   │   │   └── User.js
│   │   │
│   │   └── routes/
│   │       ├── gameRoutes.js
│   │       ├── gameSessionsRoutes.js
│   │       └── userRoutes.js
│   │
│   ├── config/
│   │   ├── db.js
│   │   └── jwt.js
│   │
│   ├── data/
│   │   └── seedUsers.js
│   │
│   ├── middlewares/
│   │   ├── isAdmin.js
│   │   └── isAuth.js
│   │
│   └── utils/
│       └── Seeds/
│           └── users.seeds.js
│
└── README.md

9. Authentication
Token generation: When a user logs in, the server validates the credentials and creates a JWT token signed with a secret key.
How to send it: Include the token in every protected request using the header:
Authorization: Bearer <token>
