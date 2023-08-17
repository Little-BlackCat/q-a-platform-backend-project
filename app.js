import express from "express";
import { client } from "./utils/db.js";
import questionsRouter from "./apps/questions.js";
import answerRouter from "./apps/answers.js";

async function init() {
  const app = express();
  const port = 4000;
  await client.connect()

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use("/questions", questionsRouter)
  app.use("/answers", answerRouter)

  app.get("/", (req, res) => {
    return res.json("Hello Skill Checkpoint #2");
  });

  app.get("*", (req, res) => {
    return res.status(404).json("Not found");
  });

  app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
}

init();
