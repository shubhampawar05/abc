import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
// const { GoogleGenerativeAI } = require("@google/generative-ai");
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
import OpenAI from "openai";
import { upload } from "../utils/Upload.js";
// ApiResponse
const openai = new OpenAI(
  {
    apiKey : process.env.OPENAI_API_KEY
  }
);
export const GptResponse = asyncHandler(async (req,res)=>{
  const {query} = req.body;
  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: `${query}` }],
    model: "gpt-3.5-turbo",
  });

  console.log(completion.choices[0]);
  res.status(200).json(
    new ApiResponse(
      200,
      {
          Output: completion.choices[0].message.content
      },
      "done"
  )
  )
})
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});


export const GeminiResponse = asyncHandler(async (req,res)=>{
  // console.log("working till");
  // console.log(req.body.query);
  const {query} = req.body;
  if(query){
    
    const result = await model.generateContent(query);

    res.status(200).json(
      new ApiResponse(
        200,
        {
          Output: result.response.text()
        },
        "done"
      )
    );
  }
  // // console.log(req.file);
  // const result = await model.generateContent([
  //   "What is in this photo?",
  //   {inlineData: {data: Buffer.from(fs.readFileSync(`${req.file.path}`)).toString("base64"), 
  //   mimeType: 'image/png/jpeg'}}]
  // );
  // // console.log(result.response.text());
  // // console.log(text);
  // fs.unlinkSync(req.file.path);
  // res.status(200).json(
  //   new ApiResponse(
  //     200,
  //     {
  //       Output: result.response.text()
  //       },
  //       "done"
  //       )
  //     )
})
