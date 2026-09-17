const LATE_CANCELLATION_FEE = 200; // INR
const FREE_CANCELLATION_WINDOW_HOURS = 24;

/**
 * Backend-authoritative cancellation fee calculation.
 * Never trust a fee value coming from the client.
 */
function calculateCancellationFee(appointmentStartTime, now = new Date()) {
  const hoursUntilAppointment = (new Date(appointmentStartTime) - now) / (1000 * 60 * 60);
  if (hoursUntilAppointment >= FREE_CANCELLATION_WINDOW_HOURS) {
    return { fee: 0, isLate: false, hoursUntilAppointment };
  }
  return { fee: LATE_CANCELLATION_FEE, isLate: true, hoursUntilAppointment };
}

module.exports = { calculateCancellationFee, LATE_CANCELLATION_FEE, FREE_CANCELLATION_WINDOW_HOURS };
