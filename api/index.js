import express from "express";

const app = express();
const port = 3000;

app.get("/test", (req, res) => {
  res.json("test Okay");
});

app.listen(port, () => {
  console.log(`Server Listening on port ${port}`);
});
