const mongoose = require("mongoose");

const { canTransition } = require("../utils/interviewStatusFlow");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const logger = require("../utils/logger");
const transporter = require("../utils/mailer");
const { createSlotForCandidate } = require("../utils/slotScheduling");
const escapeRegex = require("../utils/regex");

const ROLES = require("../constants/roles");
const httpStatus = require("../constants/httpStatus");

const Slot = require("../models/Slot");
const JobApplication = require("../models/JobApplication");

const NEXT_ROUND = {
  screening: "technical",
  technical: "managerial",
  managerial: "hr_final",
};

const getMySlots = catchAsync(async (req, res, next) => {
  const {
    track,
    status,
    job,
    round,
    search,
    stage,
    page = 1,
    limit = 10,
  } = req.query;

  const filter =
    req.user.role === ROLES.HR
      ? { contactEmail: req.user.email }
      : { booking: req.user._id };

  if (track) filter.track = track;
  if (status) filter.slotStatus = status;
  if (job) filter.job = job;
  if (round) filter.round = round;
  if (search) filter.name = { $regex: escapeRegex(search), $options: "i" };

  const FINISHED = ["completed", "no_show"];
  if (stage === "finished") filter.interviewStatus = { $in: FINISHED };
  if (stage === "upcoming") filter.interviewStatus = { $nin: FINISHED };

  const skip = (Number(page) - 1) * Number(limit);

  const [slots, total] = await Promise.all([
    Slot.aggregate([
      { $match: filter },
      {
        $addFields: {
          isFinished: { $in: ["$interviewStatus", FINISHED] },
          sortTime: {
            $cond: [
              { $in: ["$interviewStatus", FINISHED] },
              { $multiply: [{ $toLong: "$startTime" }, -1] },
              { $toLong: "$startTime" },
            ],
          },
        },
      },
      { $sort: { isFinished: 1, sortTime: 1 } },
      { $skip: skip },
      { $limit: Number(limit) },
    ]),
    Slot.countDocuments(filter),
  ]);

  await Slot.populate(slots, [
    { path: "job", select: "title company track" },
    { path: "booking", select: "name email" },
  ]);

  const slotIds = slots.map((s) => s._id);
  const nextRoundSlots = await Slot.find({
    previousRound: { $in: slotIds },
  }).select("previousRound");

  const hasNextRoundSet = new Set(
    nextRoundSlots.map((s) => s.previousRound.toString()),
  );

  const slotsWithFlag = slots.map((s) => ({
    ...s,
    hasNextRound: hasNextRoundSet.has(s._id.toString()),
  }));

  res.status(httpStatus.OK).json({
    status: "success",
    data: {
      slots: slotsWithFlag,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    },
  });
});

const getMyInterviewJobGroups = catchAsync(async (req, res, next) => {
  const { search, track, page = 1, limit = 10 } = req.query;

  const baseMatch =
    req.user.role === ROLES.HR
      ? { contactEmail: req.user.email }
      : { booking: req.user._id };

  const pipeline = [
    { $match: baseMatch },
    {
      $group: {
        _id: "$job",
        count: { $sum: 1 },
        nextTime: { $min: "$startTime" },
      },
    },
    {
      $lookup: {
        from: "jobs",
        localField: "_id",
        foreignField: "_id",
        as: "job",
      },
    },
    { $unwind: "$job" },
  ];

  const postMatch = {};
  if (search) {
    const re = new RegExp(escapeRegex(search), "i");
    postMatch.$or = [{ "job.title": re }, { "job.company": re }];
  }
  if (track) postMatch["job.track"] = track;
  if (Object.keys(postMatch).length) pipeline.push({ $match: postMatch });

  pipeline.push({ $sort: { "job.createdAt": -1 } });

  const skip = (Number(page) - 1) * Number(limit);

  const [result] = await Slot.aggregate([
    ...pipeline,
    {
      $facet: {
        data: [{ $skip: skip }, { $limit: Number(limit) }],
        totalCount: [{ $count: "count" }],
      },
    },
  ]);

  const total = result.totalCount[0]?.count || 0;

  res.status(httpStatus.OK).json({
    status: "success",
    data: {
      jobGroups: result.data,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    },
  });
});

const getSlotById = catchAsync(async (req, res, next) => {
  res
    .status(httpStatus.OK)
    .json({ status: "success", data: { slot: req.slot } });
});

const updateInterviewStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;
  const slot = req.slot;

  if (!canTransition(slot.interviewStatus, status)) {
    return next(
      new AppError(
        `Cannot transition from ${slot.interviewStatus} to ${status}`,
        httpStatus.BAD_REQUEST,
      ),
    );
  }

  slot.interviewStatus = status;
  if (status === "in_progress") slot.startedAt = new Date();
  if (status === "completed" || status === "no_show") slot.endedAt = new Date();
  if (status === "in_progress" && !slot.roomId)
    slot.roomId = `interview-${slot._id}`;

  await slot.save();
  res.status(httpStatus.OK).json({ status: "success", data: { slot } });
});

const setSlotOutcome = catchAsync(async (req, res, next) => {
  const { outcome } = req.body;
  const slot = req.slot;

  if (slot.interviewStatus !== "completed") {
    return next(
      new AppError(
        "Cannot set outcome before interview is completed",
        httpStatus.BAD_REQUEST,
      ),
    );
  }
  if (slot.outcome !== "pending") {
    return next(
      new AppError(
        "Outcome already recorded for this round",
        httpStatus.BAD_REQUEST,
      ),
    );
  }

  slot.outcome = outcome;
  await slot.save();

  if (outcome === "rejected") {
    const application = await JobApplication.findOneAndUpdate(
      { job: slot.job, applicant: slot.booking },
      { status: "rejected" },
      { new: true },
    )
      .populate("applicant", "name email")
      .populate("job", "title company");

    if (application) {
      try {
        await transporter.sendMail({
          from: process.env.MAIL_USER,
          to: application.applicant.email,
          subject: `Application Update — ${application.job.title}`,
          html: `
            <p>Thank you for applying to <strong>${application.job.title}</strong> at ${application.job.company}.</p>
            <p>After careful review, we've decided to move forward with other candidates for this role at this time.</p>
          `,
        });
      } catch (mailErr) {
        logger.error(
          `Failed to send rejection email to ${application.applicant.email}: ${mailErr.message}`,
        );
      }
    }
  }

  res.status(httpStatus.OK).json({ status: "success", data: { slot } });
});

const scheduleNextRound = catchAsync(async (req, res, next) => {
  const { startTime, endTime } = req.body;
  const currentSlot = req.slot;

  if (currentSlot.outcome !== "shortlisted") {
    return next(
      new AppError(
        "Candidate must be shortlisted in this round to schedule the next round",
        httpStatus.BAD_REQUEST,
      ),
    );
  }

  const nextRound = NEXT_ROUND[currentSlot.round];
  if (!nextRound) {
    return next(
      new AppError(
        "This is the final round; there is no next round",
        httpStatus.BAD_REQUEST,
      ),
    );
  }

  await currentSlot.populate([
    { path: "booking", select: "name email" },
    { path: "job", select: "title company track" },
  ]);

  const nextSlot = await createSlotForCandidate({
    applicantId: currentSlot.booking._id,
    applicantName: currentSlot.booking.name,
    applicantEmail: currentSlot.booking.email,
    jobId: currentSlot.job._id,
    jobTitle: currentSlot.job.title,
    jobCompany: currentSlot.job.company,
    jobTrack: currentSlot.job.track,
    round: nextRound,
    previousRoundSlotId: currentSlot._id,
    startTime,
    endTime,
    contactEmail: req.user.email,
  });

  res.status(httpStatus.OK).json({ status: "success", data: { nextSlot } });
});

module.exports = {
  getMySlots,
  getMyInterviewJobGroups,
  getSlotById,
  updateInterviewStatus,
  setSlotOutcome,
  scheduleNextRound,
};
