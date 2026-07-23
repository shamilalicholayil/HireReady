const INTERVIEW_STATUS_FLOW = {
  not_started: ["in_progress"],
  in_progress: ["completed", "no_show"],
  completed: [],
  no_show: [],
};

const canTransition = (current, next) =>
  INTERVIEW_STATUS_FLOW[current]?.includes(next);

module.exports = { INTERVIEW_STATUS_FLOW, canTransition };
