import express from "express";
import cors from "cors";
import "dotenv/config";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import imageDownloader from "image-downloader";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import multer from "multer";
import fs from "fs";
const app = express();
app.use(express.json());
app.use(cookieParser());

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uploadsPath = join(__dirname, "uploads");
app.use("/uploads", express.static(uploadsPath));
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

function getUserDataFromReq(req) {
  return new Promise((resolve, reject) => {
    jwt.verify(req.cookies.token, jwtSecret, {}, async (err, userData) => {
      if (err) throw err;
      resolve(userData);
    });
  });
}
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
  //console.log(name + " " + email + " " + password);

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
          //   console.log(token);
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

app.post("/logout", (req, res) => {
  res.cookie("token", "").json(true);
});

//
// app.post("/upload-by-link", async (req, res) => {
//   const { link } = req.body;
//   const newName = "photo" + Date.now() + ".jpg";
//   await imageDownloader.image({
//     url: link,
//     dest: "./uploads" + newName,
//   });
//   res.json(newName);
// });

app.post("/upload-by-link", async (req, res) => {
  const { link } = req.body;
  const newName = "photo" + Date.now() + ".jpg";

  // Use path.join to create an absolute path
  const dest = join(uploadsPath, newName);
  try {
    await imageDownloader.image({
      url: link,
      dest: dest,
    });

    res.json(newName);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});
const photoMiddleware = multer({ dest: "uploads/" });
app.post("/upload", photoMiddleware.array("photos", 100), (req, res) => {
  const uploadedFiles = [];
  for (let i = 0; i < req.files.length; i++) {
    const { path, originalname } = req.files[i];
    const parts = originalname.split(".");
    const ext = parts[parts.length - 1];
    const newPath = path + "." + ext;
    fs.renameSync(path, newPath);
    uploadedFiles.push(newPath.replace("uploads", ""));
  }
  res.json(uploadedFiles);
});

app.post("/places", async (req, res) => {
  const { token } = req.cookies;

  const {
    title,
    address,
    addedPhotos,
    description,
    perks,
    extraInfo,
    checkIn,
    checkOut,
    maxGuests,
    price,
  } = req.body;

  try {
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
      const result = await db.query(
        "INSERT INTO place (owner_id, title, address, photos, description, perks, extra_info, check_in, check_out, max_guests,price) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,$11) RETURNING *",
        [
          userData.id,
          title,
          address,
          addedPhotos,
          description,
          perks,
          extraInfo,
          checkIn,
          checkOut,
          maxGuests,
          price,
        ]
      );

      const placeDoc = result.rows[0];
      res.json(placeDoc);
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.get("/user-places", async (req, res) => {
  const { token } = req.cookies;

  try {
    const userData = jwt.verify(token, jwtSecret);
    const { id } = userData;
    const result = await db.query("SELECT * FROM place WHERE owner_id = $1", [
      id,
    ]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/places/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query("SELECT * FROM place WHERE place_id = $1", [
      id,
    ]);

    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: "Place not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.put("/places", async (req, res) => {
  const { token } = req.cookies;
  const {
    id,
    title,
    address,
    addedPhotos,
    description,
    perks,
    extraInfo,
    checkIn,
    checkOut,
    maxGuests,
    price,
  } = req.body;

  try {
    const userData = jwt.verify(token, jwtSecret);

    // Assuming you have a 'place' table in PostgreSQL
    const query = `
      UPDATE place
      SET
        title = $1,
        address = $2,
        photos = $3,
        description = $4,
        perks = $5,
        extra_info = $6,
        check_in = $7,
        check_out = $8,
        max_guests = $9,
        price = $10

      WHERE
        place_id = $11
        AND owner_id = $12;
    `;

    const result = await db.query(query, [
      title,
      address,
      addedPhotos,
      description,
      perks,
      extraInfo,
      checkIn,
      checkOut,
      maxGuests,
      price,
      id,
      userData.id,
    ]);

    if (result.rowCount > 0) {
      res.json("ok");
    } else {
      res.status(403).json({ error: "Unauthorized" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/places", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM place");
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/bookings", async (req, res) => {
  const { token } = req.cookies;

  const { place_id, checkIn, checkOut, numberOfGuests, name, phone, price } =
    req.body;
  try {
    const userData = jwt.verify(token, jwtSecret);

    const result = await db.query(
      "INSERT INTO booking (place_id,user_id,check_in,check_out,name,phone,price,numberOfGuests) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *",
      [
        place_id,
        userData.id,
        checkIn,
        checkOut,
        name,
        phone,
        price,
        numberOfGuests,
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.get("/bookings", async (req, res) => {
  try {
    const userData = await getUserDataFromReq(req);

    // const query = `
    //   SELECT b.*, p.*
    //   FROM booking b
    //   JOIN place p ON b.place_id = p.place_id
    //   WHERE b.user_id = $1;
    // `;
    const query = `
    SELECT 
      b.check_in AS booking_check_in, 
      b.check_out AS booking_check_out,
      b.price AS booking_price,
      b.*, 
      p.*  
    FROM booking b
    JOIN place p ON b.place_id = p.place_id
    WHERE b.user_id = $1;
  `;

    const values = [userData.id];

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No bookings found for the user" });
    }

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.listen(port, () => {
  console.log(`Server Listening on port ${port}`);
});
