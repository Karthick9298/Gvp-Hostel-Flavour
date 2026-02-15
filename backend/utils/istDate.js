// Correct way to get IST date
function getISTDate(utcDate = new Date()) {
  // IST is UTC + 5:30 (5 hours and 30 minutes)
  const istOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
  const istTime = new Date(utcDate.getTime() + istOffset);
  
  // Get date only (no time) in IST
  const istDateOnly = new Date(istTime.getFullYear(), istTime.getMonth(), istTime.getDate());
  istDateOnly.setHours(0, 0, 0, 0);
  
  return istDateOnly;
}

// Test the function
const now = new Date();
const todayIST = getISTDate(now);
const yesterdayIST = getISTDate(new Date(now.getTime() - 24 * 60 * 60 * 1000));

// console.log('Current UTC:', now.toISOString());
// console.log('Today IST (date only):', todayIST.toISOString());
// console.log('Yesterday IST (date only):', yesterdayIST.toISOString());

export { getISTDate };
