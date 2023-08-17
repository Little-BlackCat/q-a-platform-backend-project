import { ObjectId } from "mongodb";
import { db } from "../utils/db.js";
import { Router } from "express";

const answerRouter = Router()

answerRouter.get("/", async (req, res) => {
  const collection = db.collection("answers")

  try {
    const answers = await collection.find().toArray()

    return res.json({
      data: answers
    })
  } catch (error) {
    res.send(error)
  }

})

answerRouter.get("/:answerId", async (req, res) => {
  const collection = db.collection("answers")
  const answerId = new ObjectId(req.params.answerId)

  try {
    const answers = await collection.find({ _id: answerId }).toArray()

    res.json({
      data: answers
    })
  } catch (error) {
    res.status(500).send(error)
  }
})

answerRouter.put("/:answerId/dislike", async (req, res) => {
  const collection = db.collection("answers")
  const answerId = new ObjectId(req.params.answerId)

  try {
    const updatedAnswer = await collection.findOneAndUpdate(
      { _id: answerId },
      { $inc: { dislikes: -1 } },
      { returnOriginal: false }
    );

    if (!updatedAnswer.value) {
      return res.status(404).json({ message: "Answer not found" });
    }

    res.json({ message: "disliked the answer", data: updatedAnswer.value });
  } catch (error) {
    res.status(500).send(error)
  }
})

answerRouter.put("/:answerId/like", async (req, res) => {
  const collection = db.collection("answers")
  const answerId = new ObjectId(req.params.answerId)

  try {
    const updatedAnswer = await collection.findOneAndUpdate(
      { _id: answerId },
      { $inc: { likes: 1 } },
      { returnOriginal: false }
    );

    if (!updatedAnswer.value) {
      return res.status(404).json({ message: "Answer not found" });
    }

    res.json({ message: "Liked the answer", data: updatedAnswer.value });
  } catch (error) {
    res.status(500).send(error)
  }
})


export default answerRouter