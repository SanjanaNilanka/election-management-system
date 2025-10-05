import mongoose from "mongoose"

const voteSchema = new mongoose.Schema({
  electionId: { type: mongoose.Schema.Types.ObjectId, ref: "Election", required: true },
  citizenId: { type: mongoose.Schema.Types.ObjectId, ref: "Citizen", required: true },
  candidate: { type: String, required: true },
  votedAt: { type: Date, default: Date.now },
  encrypted: { type: Boolean, default: true }
})

// Ensure one vote per citizen per election
voteSchema.index({ electionId: 1, citizenId: 1 }, { unique: true })

export const Vote = mongoose.models.Vote || mongoose.model("Vote", voteSchema)
