const transporter = require("./mailer");
const logger = require("./logger");
const Slot = require("../models/Slot");
const AppError = require("./AppError");
const httpStatus = require("../constants/httpStatus");

const formatDate = (d) => new Date(d).toLocaleDateString("en-GB");
const formatTime = (d) =>
  new Date(d).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

async function createSlotForCandidate({
  applicantId,
  applicantName,
  applicantEmail,
  jobId,
  jobTitle,
  jobCompany,
  jobTrack,
  round,
  previousRoundSlotId = null,
  startTime,
  endTime,
  contactEmail,
}) {
  if (new Date(startTime) >= new Date(endTime)) {
    throw new AppError(
      "startTime must be before endTime",
      httpStatus.BAD_REQUEST,
    );
  }

  const slot = await Slot.create({
    name: applicantName,
    contactEmail,
    track: jobTrack,
    job: jobId,
    date: startTime,
    startTime,
    endTime,
    slotStatus: "booked",
    booking: applicantId,
    round,
    previousRound: previousRoundSlotId,
  });

  const interviewLink = `${process.env.CLIENT_URL}/interview/${slot._id}`;
  try {
    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: applicantEmail,
      subject: `Interview Scheduled — ${round.replace("_", " ")} — ${jobTitle}`,
      html: `
        <p>You've been scheduled for the <strong>${round.replace("_", " ")}</strong> round for <strong>${jobTitle}</strong> at ${jobCompany}.</p>
        <p>Your interview is on <strong>${formatDate(slot.startTime)} from ${formatTime(slot.startTime)} to ${formatTime(slot.endTime)}</strong>.</p>
        <p><a href="${interviewLink}">Join Interview</a></p>
      `,
    });
  } catch (mailErr) {
    logger.error(
      `Failed to send interview email to ${applicantEmail}: ${mailErr.message}`,
    );
  }

  return slot;
}

module.exports = { createSlotForCandidate };
