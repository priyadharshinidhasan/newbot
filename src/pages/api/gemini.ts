import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

// Get the API key securely from environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_API_URL = "https://gemini.googleapis.com/v1beta1/chat:generate";  // Replace with actual URL

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).end(); // Allow only POST requests
  }

  const { messages } = req.body;

  if (!messages || messages.length === 0) {
    return res.status(400).json({ response: "No messages provided." });
  }

  console.log("Received messages:", messages);

  try {
    // Make the API call to Gemini's endpoint
    const response = await axios.post(
      GEMINI_API_URL,
      {
        model: "gemini-pro", // Assuming the model name is 'gemini-pro'
        messages: messages, // Send the messages array as chat history
      },
      {
        headers: {
          "Authorization": `Bearer ${GEMINI_API_KEY}`, // API key in Authorization header
          "Content-Type": "application/json", // Set content type as JSON
        },
      }
    );

    console.log("Gemini response:", response.data);

    // Send the response back to the client
    res.status(200).json({ response: response.data });
  } catch (err) {
    console.error("Error with Gemini API:", err.response?.data || err.message);
    res.status(500).json({ response: "Error with Gemini API.", error: err.message });
  }
}
