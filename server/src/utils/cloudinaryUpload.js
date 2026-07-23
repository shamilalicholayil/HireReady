const streamifier = require("streamifier");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const cloudinary = require("../config/cloudinary");

function classifyMime(mimetype) {
  if (mimetype.startsWith("image/"))
    return { resourceType: "image", attachmentType: "image" };
  if (mimetype.startsWith("video/"))
    return { resourceType: "video", attachmentType: "video" };
  if (mimetype.startsWith("audio/"))
    return { resourceType: "video", attachmentType: "audio" };

  return { resourceType: "raw", attachmentType: "file" };
}

const streamUpload = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "hireready/avatars" },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      },
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

const streamUploadResume = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "hireready/resumes", resource_type: "raw" },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      },
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

const streamUploadAttachment = (buffer, originalname, mimetype) => {
  const { resourceType, attachmentType } = classifyMime(mimetype);
  const ext = path.extname(originalname);
  const publicId = `${uuidv4()}${ext}`;

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "hireready/messages",
        resource_type: resourceType,
        public_id: publicId,
        use_filename: false,
        unique_filename: false,
      },
      (error, result) => {
        if (result) resolve({ ...result, attachmentType });
        else reject(error);
      },
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

const streamUploadHRDocument = (buffer, resourceType = "image") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "hireready/hr-verification", resource_type: resourceType },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      },
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

module.exports = {
  streamUpload,
  streamUploadResume,
  streamUploadAttachment,
  streamUploadHRDocument,
};
