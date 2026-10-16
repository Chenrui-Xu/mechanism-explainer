// Original illustrative model. Each event is a state the reader can inspect.
export const queueSteps = Object.freeze([
  Object.freeze({ title: 'Before a job arrives', queued: 0, busy: false }),
  Object.freeze({ title: 'The job waits in the queue', queued: 1, busy: false }),
  Object.freeze({ title: 'The worker accepts the job', queued: 0, busy: true }),
]);

export function queueView(step) {
  return Object.freeze({
    title: step.title,
    count: `${step.queued} waiting`,
    worker: step.busy ? '1 active job' : 'Idle',
    queueJobVisible: step.queued > 0,
    workerJobVisible: step.busy,
    explanation: step.busy
      ? 'The worker accepts the job, so the queue has 0 waiting jobs. The job is active; it is not finished yet.'
      : step.queued > 0
        ? 'One job has arrived. The worker has not accepted it yet, so the queue has 1 waiting job.'
        : 'The queue has 0 waiting jobs, and the worker is idle. No job has arrived yet.',
  });
}
