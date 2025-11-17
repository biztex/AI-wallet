const fs = require("fs").promises
const path = require("path")

const DB_PATH = path.join(__dirname, "../database.json")

/**
 * Load database
 */
async function loadDatabase() {
  try {
    const data = await fs.readFile(DB_PATH, "utf8")
    return JSON.parse(data)
  } catch (error) {
    console.error("[Backend] Error loading database:", error)
    return { users: [], kyc: [] }
  }
}

/**
 * Save database
 */
async function saveDatabase(db) {
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf8")
  } catch (error) {
    console.error("[Backend] Error saving database:", error)
  }
}

/**
 * Handle KYC submission
 */
async function handleSubmitKYC(data) {
  const { userId, idType, region, photoUri, personalInfo } = data

  if (!userId || !idType || !region || !photoUri) {
    return {
      success: false,
      message: "All KYC fields are required",
    }
  }

  if (personalInfo) {
    const requiredFields = [
      "firstName",
      "lastName",
      "address",
      "city",
      "country",
      "nationality",
      "mobileNumber",
      "dateOfBirth",
      "gender",
    ]
    for (const field of requiredFields) {
      if (!personalInfo[field] || personalInfo[field].trim() === "") {
        return {
          success: false,
          message: `${field} is required`,
        }
      }
    }
  }

  const db = await loadDatabase()

  // Find KYC entry
  const kycIndex = db.kyc.findIndex((k) => k.userId === userId)
  if (kycIndex === -1) {
    return {
      success: false,
      message: "User not found",
    }
  }

  db.kyc[kycIndex] = {
    ...db.kyc[kycIndex],
    status: "pending",
    idType,
    region,
    photoUri,
    personalInfo: personalInfo || null,
    submittedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  await saveDatabase(db)

  return {
    success: true,
    message: "KYC submitted successfully",
    status: "pending",
  }
}

/**
 * Handle KYC status retrieval
 */
async function handleGetKYCStatus(data) {
  const { userId } = data

  if (!userId) {
    return {
      success: false,
      message: "User ID is required",
    }
  }

  const db = await loadDatabase()

  // Find KYC entry
  const kycEntry = db.kyc.find((k) => k.userId === userId)
  if (!kycEntry) {
    return {
      success: false,
      message: "KYC entry not found",
    }
  }

  return {
    success: true,
    status: kycEntry.status,
    rejectionReason: kycEntry.rejectionReason,
    updatedAt: kycEntry.updatedAt,
  }
}

/**
 * Handle KYC status update (Admin only)
 * This is used by administrators to manually update KYC status
 */
async function handleUpdateKYCStatus(data) {
  const { userId, status, rejectionReason } = data

  if (!userId || !status) {
    return {
      success: false,
      message: "User ID and status are required",
    }
  }

  // Validate status
  const validStatuses = ["not_started", "pending", "approved", "rejected"]
  if (!validStatuses.includes(status)) {
    return {
      success: false,
      message: "Invalid status",
    }
  }

  const db = await loadDatabase()

  // Find KYC entry
  const kycIndex = db.kyc.findIndex((k) => k.userId === userId)
  if (kycIndex === -1) {
    return {
      success: false,
      message: "KYC entry not found",
    }
  }

  // Update KYC status
  db.kyc[kycIndex].status = status
  db.kyc[kycIndex].rejectionReason = status === "rejected" ? rejectionReason : null
  db.kyc[kycIndex].updatedAt = new Date().toISOString()

  await saveDatabase(db)

  return {
    success: true,
    message: "KYC status updated successfully",
    status,
    rejectionReason: db.kyc[kycIndex].rejectionReason,
  }
}

async function handleGetUserProfile(data) {
  const { userId } = data

  if (!userId) {
    return {
      success: false,
      message: "User ID is required",
    }
  }

  const db = await loadDatabase()

  // Find KYC entry
  const kycEntry = db.kyc.find((k) => k.userId === userId)
  if (!kycEntry) {
    return {
      success: false,
      message: "User profile not found",
    }
  }

  return {
    success: true,
    data: {
      personalInfo: kycEntry.personalInfo || null,
      profileImage: kycEntry.profileImage || null,
      status: kycEntry.status,
    },
  }
}

async function handleUpdateProfileImage(data) {
  const { userId, imageUri } = data

  if (!userId || !imageUri) {
    return {
      success: false,
      message: "User ID and image URI are required",
    }
  }

  const db = await loadDatabase()

  // Find KYC entry
  const kycIndex = db.kyc.findIndex((k) => k.userId === userId)
  if (kycIndex === -1) {
    return {
      success: false,
      message: "User not found",
    }
  }

  // Update profile image
  db.kyc[kycIndex].profileImage = imageUri
  db.kyc[kycIndex].updatedAt = new Date().toISOString()

  await saveDatabase(db)

  return {
    success: true,
    message: "Profile image updated successfully",
    imageUri,
  }
}

module.exports = {
  handleSubmitKYC,
  handleGetKYCStatus,
  handleUpdateKYCStatus,
  handleGetUserProfile,
  handleUpdateProfileImage,
}
