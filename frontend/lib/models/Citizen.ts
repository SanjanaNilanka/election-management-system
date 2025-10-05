import mongoose from "mongoose"

const citizenSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  nic: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  district: { type: String, required: true },
  gnDivision: { type: String, required: true },
  voterNumber: { type: String, unique: true },
  registrationStatus: { 
    type: String, 
    enum: ["pending", "approved", "rejected"], 
    default: "pending" 
  },
  documents: [{
    type: { type: String, required: true },
    url: { type: String, required: true },
    status: { 
      type: String, 
      enum: ["pending", "verified", "rejected"], 
      default: "pending" 
    },
    uploadedAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

export const Citizen = mongoose.models.Citizen || mongoose.model("Citizen", citizenSchema)
