import mongoose from "mongoose"

const electionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { 
    type: String, 
    enum: ["presidential", "parliamentary", "provincial", "local"], 
    required: true 
  },
  date: { type: Date, required: true },
  registrationDeadline: { type: Date, required: true },
  candidates: [{
    name: { type: String, required: true },
    party: { type: String, required: true },
    symbol: { type: String, required: true },
    description: { type: String }
  }],
  districts: [{ type: String, required: true }],
  status: { 
    type: String, 
    enum: ["draft", "active", "completed", "cancelled"], 
    default: "draft" 
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

export const Election = mongoose.models.Election || mongoose.model("Election", electionSchema)
