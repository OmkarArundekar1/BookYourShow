import mongoose from "mongoose"

let isConnected = false

export async function connectMongoDB() {
  if (isConnected) {
    console.log("MongoDB already connected")
    return
  }

  try {
    const conn = await mongoose.connect(process.env.NEXT_PUBLIC_MONGO_URI || "", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })

    isConnected = true
    console.log("MongoDB connected")
    return conn
  } catch (error) {
    console.error("MongoDB connection error:", error)
    throw error
  }
}
