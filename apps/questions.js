import { ObjectId } from "mongodb";
import { db } from "../utils/db.js";
import { Router } from "express";

const questionsRouter = Router()
// Required Software Requirements (Requirement ที่ต้องทำส่ง)
questionsRouter.get("/", async (req, res) => {
  const collection = db.collection("questions")
  const keyword = req.query.keyword
  const query = {}

  if (keyword) {
    query.$or = [
      { topic: new RegExp(keyword, "i") },
      { category: { $in: [new RegExp(keyword, "i")] } }
    ]
  };


  try {
    const questions = await collection.find(query).toArray()

    return res.json({
      data: questions
    })
  } catch (error) {
    res.send(error)
  }

})

questionsRouter.post("/", async (req, res) => {
  const collection = db.collection("questions")
  const questionTopic = {
    ...req.body,
    createAt: new Date()
  }

  try {
    await collection.insertOne(questionTopic)

    return res.status(200).json({
      message: "Question post has been created successfully",
      data: questionTopic
    })
  } catch (error) {
    res.send(error)
  }

})

questionsRouter.put("/:questionId", async (req, res) => {
  const collection = db.collection("questions")
  const questionId = new ObjectId(req.params.questionId)
  const newQuestion = { ...req.body }

  try {
    await collection.updateOne(
      {
        _id: questionId,
      },
      {
        $set: { ...newQuestion, editAt: new Date() }
      }
    )

    return res.json({
      message: "Question post has been updated successfully",
      data: newQuestion,
    })
  } catch (error) {
    res.send(error)
  }

})

questionsRouter.delete("/:questionId", async (req, res) => {
  const questionCollection = db.collection("questions")
  const answerCollection = db.collection("answers")
  const questionId = req.params.questionId

  try {
    await questionCollection.deleteOne({ _id: new ObjectId(questionId) })
    await answerCollection.deleteMany({ questionId: questionId })

    res.json({
      message: `Blog post id: ${questionId} has been deleted successfully`,
    })
  } catch (error) {
    res.status(400).send(error)
  }

})

// Optional Software Requirements (Requirement ที่ไม่ต้องทำส่ง)
questionsRouter.post("/:questionId/answer", async (req, res) => {
  const questCollection = db.collection("questions")
  const answerCollection = db.collection("answers")
  const questionId = req.params.questionId

  const questionTopic = await questCollection.findOne(
    {
      _id: new ObjectId(questionId)
    },
    {
      topic: 1
    })

  const answer = {
    questionId: questionId,
    topic: questionTopic.topic,
    ...req.body, // Assuming the answer is sent as a field named 'answer' in the request body
    answerDate: new Date(),
  }

  try {
    if (answer["answer"].length > 300) {
      return res.status(400).json({
        message: "Answer length should not exceed 300 characters.",
      })
    }

    await answerCollection.insertOne(answer);

    return res.json({
      message: `Answer for question id: ${questionId} has been created successfully.`,
      data: answer
    });
  } catch (error) {
    res.send(error)
  }
})

questionsRouter.get("/:questionId/answer", async (req, res) => {
  const collection = db.collection("answers")
  const questionId = req.params.questionId
  const query = { questionId: questionId }

  try {
    const answers = await collection.find(query).toArray()

    if (answers.length != 0) {
      return res.json({
        data: answers
      })
    } else {
      res.status(400).json("Not found")
    }
  } catch (error) {
    res.send(error)
  }
})

questionsRouter.put("/:questionId/like", async (req, res) => {
  const collection = db.collection("questions")
  const questionId = new ObjectId(req.params.questionId)

  try {
    const updatedQuestion = await collection.findOneAndUpdate(
      { _id: questionId },
      { $inc: { likes: 1 } },
      { returnOriginal: false }
    );

    if (!updatedQuestion.value) {
      return res.status(404).json({ message: "Answer not found" });
    }

    res.json({ message: "Liked the answer", data: updatedQuestion.value });
  } catch (error) {
    res.status(500).send(error)
  }
})

questionsRouter.put("/:questionId/dislike", async (req, res) => {
  const collection = db.collection("questions")
  const questionId = new ObjectId(req.params.questionId)

  try {
    const updatedQuestion = await collection.findOneAndUpdate(
      { _id: questionId },
      { $inc: { dislikes: -1 } },
      { returnOriginal: false }
    );

    if (!updatedQuestion.value) {
      return res.status(404).json({ message: "Answer not found" });
    }

    res.json({ message: "Liked the answer", data: updatedQuestion.value });
  } catch (error) {
    res.status(500).send(error)
  }
})
export default questionsRouter
