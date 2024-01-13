import express from "express";
import cors from "cors";
import "dotenv/config";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  password: "kanhaiya",
  database: "booking-website",
  host: "localhost",
  port: 5432,
});

app.use(
  cors({
    credentials: true,
    origin: "http://127.0.0.1:5173",
  })
);
const rounds = process.env.SALTROUNDS;
const jwtSecret = "fjsfjfjlsfjsfjsfjweoeurwrwir";
db.connect();

app.get("/test", (req, res) => {
  res.json("test Okay");
});

// app.post("/register", async (req, res) => {
//   const { name, email, password } = req.body;
//   console.log(name + " " + email + " " + password);
//   // Check if email and password are provided for manual registration
//   if (!email || !password || !name) {
//     console.log("Name, Email and Password are Mandatory Field");
//   }
//   // Check if the user is already registered
//   const existingUser = await db.query("SELECT * FROM users WHERE email = $1", [
//     email,
//   ]);
//   if (existingUser.rows.length > 0) {
//     console.log("User Email is Already Registered use some other Email");
//   }
//   bcrypt.hash(password, rounds, async (err, hash) => {
//     try {
//       const userDoc = await db.query(
//         "INSERT INTO users (username,email, password) VALUES ($1, $2, $3)",
//         [name, email, hash]
//       );
//       res.json(userDoc);
//     } catch (error) {
//       console.log(error);
//     }
//   });
// });

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  console.log(name + " " + email + " " + password);

  // Check if email and password are provided for manual registration
  if (!email || !password || !name) {
    console.log("Name, Email, and Password are Mandatory Fields");
    return res
      .status(400)
      .json("Name, Email, and Password are Mandatory Fields");
  }

  // Check if the user is already registered
  const existingUser = await db.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);

  if (existingUser.rows.length > 0) {
    console.log("User Email is Already Registered, please use another Email");
    return res
      .status(409)
      .json("User Email is Already Registered, please use another Email");
  }

  try {
    // Hash the password before storing it in the database
    const hashedPassword = await new Promise((resolve, reject) => {
      bcrypt.hash(password, parseInt(rounds), (err, hash) => {
        if (err) reject(err);
        resolve(hash);
      });
    });

    // Now insert the user with the hashed password
    const userDoc = await db.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3)",
      [name, email, hashedPassword]
    );

    res.json(userDoc);
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const userDoc = await db.query("SELECT * FROM users WHERE email=($1)", [
    email,
  ]);

  if (userDoc.rows.length > 0) {
    // Check if there is a user
    const user = userDoc.rows[0];
    const result1 = user.password;

    const passOk = bcrypt.compareSync(password, result1);
    const { username, email, user_id } = user;
    if (passOk) {
      jwt.sign(
        {
          email: user.email,
          id: user.user_id,
        },
        jwtSecret,
        {},
        (err, token) => {
          if (err) throw err;
          console.log(token);
          res.cookie("token", token).json({ username, email, user_id });
        }
      );
    } else {
      console.log("User Entered password=", password);
      console.log("Actual password =", result1);
      res.status(422).json("Password Not Ok");
    }
  } else {
    res.status(404).json("User Not Found");
  }
});

app.get("/profile", (req, res) => {
  const { token } = req.cookies;

  if (token) {
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
      if (err) {
        // Token verification failed, clear the cookie
        res.clearCookie("token");
        return res.status(401).json("Unauthorized");
      }
      const data = await db.query("SELECT * FROM users WHERE user_id=($1)", [
        userData.id,
      ]);

      if (data.rows.length > 0) {
        const userFromDatabase = data.rows[0];
        const { email, user_id, username } = userFromDatabase;
        res.json({ email, user_id, username });
        // Your code to handle the user data
      } else {
        // Handle the case where the user is not found
        console.error("User not found in the database");
      }
    });
  } else {
    // No token found, return null or an appropriate response
    res.json(null);
    console.log("No token found");
  }
});

app.listen(port, () => {
  console.log(`Server Listening on port ${port}`);
});
