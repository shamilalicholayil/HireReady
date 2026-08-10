const Job = require("../models/Job");
const JobApplication = require("../models/JobApplication");
const Slot = require("../models/Slot");

const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const transporter = require("../utils/mailer");
const logger = require("../utils/logger");
const escapeRegex = require("../utils/regex");
const { createSlotForCandidate } = require("../utils/slotScheduling");

const httpStatus = require("../constants/httpStatus");

const createJob = catchAsync(async (req, res, next) => {
  const job = await Job.create({ ...req.body, postedBy: req.user._id });
  res.status(httpStatus.CREATED).json({ status: "success", data: { job } });
});

const getActiveJobs = catchAsync(async (req, res) => {
  const { search, track, page = 1, limit = 10 } = req.query;

  const filter = { isActive: true };

  if (search) {
    filter.title = { $regex: escapeRegex(search), $options: "i" };
  }

  if (track) {
    filter.track = track;
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [jobs, total] = await Promise.all([
    Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Job.countDocuments(filter),
  ]);

  res.status(httpStatus.OK).json({
    status: "success",
    data: {
      jobs,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    },
  });
});

const getJobById = catchAsync(async (req, res, next) => {
  const job = await Job.findById(req.params.id);
  if (!job) return next(new AppError("Job not found", httpStatus.NOT_FOUND));

  const isOwner =
    req.user && job.postedBy.toString() === req.user._id.toString();

  if (!isOwner && (!job.isActive || job.isClosed)) {
    return next(
      new AppError(
        "This job posting is no longer active",
        httpStatus.NOT_FOUND,
      ),
    );
  }

  res.status(httpStatus.OK).json({ status: "success", data: { job } });
});

const getMyJobPostings = catchAsync(async (req, res, next) => {
  const { search, track, page = 1, limit = 10 } = req.query;

  const filter = { postedBy: req.user._id };

  if (req.query.includeClosed !== "true") {
    filter.isClosed = false;
  }
  if (search) {
    filter.title = { $regex: escapeRegex(search), $options: "i" };
  }
  if (track) {
    filter.track = track;
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [jobs, total] = await Promise.all([
    Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Job.countDocuments(filter),
  ]);

  const jobsWithCounts = await Promise.all(
    jobs.map(async (job) => {
      const applicantCount = await JobApplication.countDocuments({
        job: job._id,
      });
      return { ...job.toObject(), applicantCount };
    }),
  );

  res.status(httpStatus.OK).json({
    status: "success",
    data: {
      jobs: jobsWithCounts,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    },
  });
});

const toggleJobStatus = catchAsync(async (req, res, next) => {
  const job = await Job.findById(req.params.id);
  if (!job) return next(new AppError("Job not found", httpStatus.NOT_FOUND));
  if (job.postedBy.toString() !== req.user._id.toString()) {
    return next(
      new AppError("Not authorized to modify this job", httpStatus.FORBIDDEN),
    );
  }
  if (job.isClosed) {
    return next(
      new AppError(
        "This job has already been closed and scheduled; it can't be reactivated",
        httpStatus.BAD_REQUEST,
      ),
    );
  }
  job.isActive = !job.isActive;
  await job.save();
  res.status(httpStatus.OK).json({ status: "success", data: { job } });
});

const applyToJob = catchAsync(async (req, res, next) => {
  const job = await Job.findById(req.params.id);
  if (!job) return next(new AppError("Job not found", httpStatus.NOT_FOUND));
  if (!job.isActive)
    return next(
      new AppError(
        "This job is no longer accepting applications",
        httpStatus.BAD_REQUEST,
      ),
    );

  try {
    const application = await JobApplication.create({
      job: job._id,
      applicant: req.user._id,
    });
    res
      .status(httpStatus.CREATED)
      .json({ status: "success", data: { application } });
  } catch (err) {
    if (err.code === 11000) {
      return next(
        new AppError(
          "You've already applied to this job",
          httpStatus.BAD_REQUEST,
        ),
      );
    }
    throw err;
  }
});

const getApplicationsForJob = catchAsync(async (req, res, next) => {
  const { search, status } = req.query;

  const job = await Job.findById(req.params.id);
  if (!job) return next(new AppError("Job not found", httpStatus.NOT_FOUND));
  if (job.postedBy.toString() !== req.user._id.toString()) {
    return next(
      new AppError(
        "Not authorized to view these applications",
        httpStatus.FORBIDDEN,
      ),
    );
  }

  let applications = await JobApplication.find({ job: job._id })
    .populate("applicant", "name email track skills resumeUrl")
    .populate("scheduledSlot")
    .sort({ createdAt: -1 });

  if (status) {
    applications = applications.filter((app) => app.status === status);
  }

  if (search) {
    const term = search.toLowerCase();
    applications = applications.filter((app) =>
      app.applicant?.name?.toLowerCase().includes(term),
    );
  }

  res.status(httpStatus.OK).json({ status: "success", data: { applications } });
});

const updateApplicationStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;
  const application = await JobApplication.findById(req.params.appId).populate(
    "job",
  );

  if (!application)
    return next(new AppError("Application not found", httpStatus.NOT_FOUND));
  if (application.job.postedBy.toString() !== req.user._id.toString()) {
    return next(
      new AppError(
        "Not authorized to update this application",
        httpStatus.FORBIDDEN,
      ),
    );
  }

  application.status = status;
  await application.save();

  res.status(httpStatus.OK).json({ status: "success", data: { application } });
});

const closeJob = catchAsync(async (req, res, next) => {
  const job = await Job.findById(req.params.id);
  if (!job) return next(new AppError("Job not found", httpStatus.NOT_FOUND));
  if (job.postedBy.toString() !== req.user._id.toString()) {
    return next(
      new AppError("Not authorized to close this job", httpStatus.FORBIDDEN),
    );
  }
  if (!job.isActive) {
    return next(
      new AppError("This job is already closed", httpStatus.BAD_REQUEST),
    );
  }

  job.isActive = false;
  job.isClosed = true;
  await job.save();

  const rejected = await JobApplication.find({
    job: job._id,
    status: "rejected",
  }).populate("applicant", "name email");

  for (const application of rejected) {
    try {
      await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: application.applicant.email,
        subject: `Application Update — ${job.title}`,
        html: `
          <p>Thank you for applying to <strong>${job.title}</strong> at ${job.company}.</p>
          <p>After careful review, we've decided to move forward with other candidates for this role at this time.</p>
        `,
      });
    } catch (mailErr) {
      logger.error(
        `Failed to send rejection email to ${application.applicant.email}: ${mailErr.message}`,
      );
    }
  }

  res.status(httpStatus.OK).json({
    status: "success",
    data: { job, rejectedNotified: rejected.length },
  });
});

const scheduleApplicantInterview = catchAsync(async (req, res, next) => {
  const { appId } = req.params;
  const { startTime, endTime } = req.body;

  const application = await JobApplication.findById(appId)
    .populate("job")
    .populate("applicant", "name email");

  if (!application)
    return next(new AppError("Application not found", httpStatus.NOT_FOUND));
  if (application.job.postedBy.toString() !== req.user._id.toString()) {
    return next(
      new AppError(
        "Not authorized to schedule this application",
        httpStatus.FORBIDDEN,
      ),
    );
  }
  if (application.status !== "shortlisted") {
    return next(
      new AppError(
        "Only shortlisted applicants can be scheduled",
        httpStatus.BAD_REQUEST,
      ),
    );
  }
  if (application.scheduledSlot) {
    return next(
      new AppError(
        "This applicant already has a scheduled interview",
        httpStatus.BAD_REQUEST,
      ),
    );
  }

  const slot = await createSlotForCandidate({
    applicantId: application.applicant._id,
    applicantName: application.applicant.name,
    applicantEmail: application.applicant.email,
    jobId: application.job._id,
    jobTitle: application.job.title,
    jobCompany: application.job.company,
    jobTrack: application.job.track,
    round: "screening",
    previousRoundSlotId: null,
    startTime,
    endTime,
    contactEmail: req.user.email,
  });

  application.scheduledSlot = slot._id;
  await application.save();

  res
    .status(httpStatus.OK)
    .json({ status: "success", data: { application, slot } });
});

module.exports = {
  createJob,
  getActiveJobs,
  getJobById,
  getMyJobPostings,
  toggleJobStatus,
  applyToJob,
  getApplicationsForJob,
  updateApplicationStatus,
  closeJob,
  scheduleApplicantInterview,
};
