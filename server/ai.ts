import { getDatabase, DatabaseSchema } from './db';
import { TokenPayload } from './auth';
import { GoogleGenAI } from '@google/genai';

export async function processAICampusQuery(
  query: string,
  user: TokenPayload
): Promise<{ reply: string; source: 'rule_engine' | 'gemini_grounded' }> {
  const db = getDatabase();
  const lower = query.toLowerCase().trim();

  // 1. GATHER AUTHORIZED DATA FOR THIS USER
  let attendanceInfo = '';
  if (user.role === 'student') {
    let totalClasses = 0;
    let attendedClasses = 0;
    const subjectWise: Record<string, { total: number; present: number }> = {};

    db.attendance.forEach(session => {
      const rec = session.studentRecords.find(r => r.studentId === user.userId);
      if (rec) {
        totalClasses++;
        if (rec.status === 'present') attendedClasses++;

        if (!subjectWise[session.subjectName]) {
          subjectWise[session.subjectName] = { total: 0, present: 0 };
        }
        subjectWise[session.subjectName].total++;
        if (rec.status === 'present') subjectWise[session.subjectName].present++;
      }
    });

    const overallPct = totalClasses > 0 ? ((attendedClasses / totalClasses) * 100).toFixed(1) : '100.0';
    attendanceInfo = `Total Classes: ${totalClasses}, Attended: ${attendedClasses}, Overall Percentage: ${overallPct}%. ` +
      Object.entries(subjectWise)
        .map(([subj, s]) => `${subj}: ${s.present}/${s.total} (${((s.present / s.total) * 100).toFixed(0)}%)`)
        .join(', ');
  }

  let timetableInfo = '';
  if (user.role === 'student' || user.role === 'faculty') {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const relevantSlots = db.timetable.filter(t => {
      if (user.role === 'faculty') return t.facultyId === user.userId;
      return true; // For student, shows relevant dept semester
    });
    timetableInfo = relevantSlots.map(t => `${t.dayOfWeek} ${t.timeSlot}: ${t.subjectName} (${t.subjectCode}) in ${t.roomNumber}`).join('; ');
  }

  let gatePassInfo = '';
  if (user.role === 'student') {
    const studentPasses = db.gatePasses.filter(g => g.studentId === user.userId);
    if (studentPasses.length > 0) {
      const latest = studentPasses[0];
      gatePassInfo = `Pass Code: ${latest.passCode}, Status: ${latest.status.toUpperCase()}, Exit Time: ${new Date(latest.exitTime).toLocaleString()}, Reason: ${latest.reason}.`;
    } else {
      gatePassInfo = 'No gate passes requested yet.';
    }
  }

  let leaveInfo = '';
  if (user.role === 'student') {
    const studentLeaves = db.leaveRequests.filter(l => l.studentId === user.userId);
    if (studentLeaves.length > 0) {
      const latest = studentLeaves[0];
      leaveInfo = `Latest Leave Request (${latest.leaveType}): From ${latest.fromDate} to ${latest.toDate}, Status: ${latest.status.toUpperCase()}, Comments: ${latest.comments || 'Pending review'}.`;
    } else {
      leaveInfo = 'No leave requests on file.';
    }
  }

  let hostelInfo = '';
  if (user.role === 'warden' || user.role === 'admin') {
    let totalCap = 0;
    let totalOcc = 0;
    db.hostels.forEach(h => {
      h.rooms.forEach(r => {
        totalCap += r.capacity;
        totalOcc += r.occupied;
      });
    });
    hostelInfo = `Campus Hostels: ${db.hostels.length} halls, Total Capacity: ${totalCap} beds, Occupied: ${totalOcc}, Vacant Beds: ${totalCap - totalOcc}.`;
  } else if (user.role === 'student') {
    const studentUser = db.users.find(u => u.id === user.userId);
    const assignedHostel = db.hostels.find(h => h.id === studentUser?.hostelId);
    hostelInfo = assignedHostel
      ? `Allocated: ${assignedHostel.name}, Room: ${studentUser?.roomNumber || 'Not assigned'}`
      : 'No hostel room assigned.';
  }

  const todayDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todayMenu = db.messMenu.find(m => m.dayOfWeek.toLowerCase() === todayDay.toLowerCase()) || db.messMenu[0];
  const messInfo = `Today's (${todayMenu.dayOfWeek}) Menu — Breakfast: ${todayMenu.breakfast.join(', ')}; Lunch: ${todayMenu.lunch.join(', ')}; Dinner: ${todayMenu.dinner.join(', ')}.`;

  const approvedOpportunities = db.alumniPosts
    .filter(p => p.status === 'approved')
    .map(p => `${p.type.toUpperCase()}: ${p.title} by ${p.alumniName} at ${p.company} (Deadline: ${p.deadline})`)
    .join('; ');

  // 2. CHECK RULE-BASED MATCH FIRST (Fast, 100% deterministic, no external delay)
  if (lower.includes('attendance') || lower.includes('present') || lower.includes('percentage') || lower.includes('bunk')) {
    if (user.role === 'student') {
      return {
        reply: `📊 **Your Academic Attendance Status**:\n${attendanceInfo || 'No attendance records registered yet.'}\n\n*Institutional warning threshold is set at ${db.settings.attendanceWarningThreshold}%.*`,
        source: 'rule_engine'
      };
    } else {
      return {
        reply: `Faculty attendance portal lets you mark and manage classroom attendance sessions for your assigned batches.`,
        source: 'rule_engine'
      };
    }
  }

  if (lower.includes('next class') || lower.includes('timetable') || lower.includes('schedule') || lower.includes('lecture')) {
    return {
      reply: `🗓️ **Academic Timetable & Class Schedule**:\n${timetableInfo || 'No classes currently scheduled for your section.'}`,
      source: 'rule_engine'
    };
  }

  if (lower.includes('gate pass') || lower.includes('pass') || lower.includes('exit')) {
    if (user.role === 'student') {
      return {
        reply: `🎫 **Gate Pass Status**:\n${gatePassInfo}\n\nApproved gate passes can be scanned at the main security gates with a digital QR code.`,
        source: 'rule_engine'
      };
    } else if (user.role === 'security') {
      return {
        reply: `Security personnel can use the QR Gate Pass verification console to scan QR passes and record student ingress and egress.`,
        source: 'rule_engine'
      };
    }
  }

  if (lower.includes('leave') || lower.includes('leave request') || lower.includes('vacation')) {
    if (user.role === 'student') {
      return {
        reply: `📋 **Leave Application Status**:\n${leaveInfo}`,
        source: 'rule_engine'
      };
    }
  }

  if (lower.includes('mess') || lower.includes('food') || lower.includes('menu') || lower.includes('lunch') || lower.includes('dinner') || lower.includes('breakfast')) {
    return {
      reply: `🍽️ **Campus Dining & Mess Information**:\n${messInfo}`,
      source: 'rule_engine'
    };
  }

  if (lower.includes('hostel') || lower.includes('room') || lower.includes('bed') || lower.includes('occupancy')) {
    return {
      reply: `🏢 **Hostel & Housing Information**:\n${hostelInfo}`,
      source: 'rule_engine'
    };
  }

  if (lower.includes('workshop') || lower.includes('job') || lower.includes('internship') || lower.includes('alumni') || lower.includes('opportunity')) {
    return {
      reply: `💼 **Active Alumni & Placement Opportunities**:\n${approvedOpportunities || 'No published alumni opportunities at this moment.'}`,
      source: 'rule_engine'
    };
  }

  if (lower.includes('fee') || lower.includes('dues') || lower.includes('payment') || lower.includes('receipt')) {
    if (user.role === 'student') {
      const studentFees = db.fees.filter(f => f.studentId === user.userId);
      const feeSummary = studentFees.map(f => `${f.feeType}: ₹${f.amount.toLocaleString()} (Paid: ₹${f.paidAmount.toLocaleString()}, Status: ${f.status.toUpperCase()})`).join('\n');
      return {
        reply: `💳 **Fee Ledger & Payment Status**:\n${feeSummary || 'No pending fee ledgers found.'}`,
        source: 'rule_engine'
      };
    }
  }

  // 3. OPTIONAL GEMINI-ENHANCED ANSWER IF API KEY IS CONFIGURED
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
    try {
      const ai = new GoogleGenAI({});
      const prompt = `You are Campus Nexus AI, the official intelligent assistant for ${db.settings.institutionName}.
User Role: ${user.role}
User Name: ${user.name}
Department: ${user.department || 'N/A'}

AUTHORITATIVE PERMITTED USER DATA:
- Attendance: ${attendanceInfo || 'N/A'}
- Timetable: ${timetableInfo || 'N/A'}
- Gate Pass: ${gatePassInfo || 'N/A'}
- Leave Status: ${leaveInfo || 'N/A'}
- Hostel Info: ${hostelInfo || 'N/A'}
- Today's Mess Menu: ${messInfo}
- Available Alumni Opportunities: ${approvedOpportunities || 'None'}

QUESTION FROM USER: "${query}"

INSTRUCTIONS:
1. Answer concisely, professionally, and accurately using strictly the permitted data above.
2. If the user asks about data not available or asks about another student, politely state that you can only share permitted records for their own verified profile.
3. Keep response under 4 sentences unless structured bullet points are necessary.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      if (response && response.text) {
        return {
          reply: response.text,
          source: 'gemini_grounded'
        };
      }
    } catch (err) {
      console.warn('Gemini query fallback:', err);
    }
  }

  // Generic fallback if not matched
  return {
    reply: `Hello ${user.name}! I am your Campus Nexus AI Assistant. You can ask me questions such as:\n- "What is my attendance percentage?"\n- "When is my next class?"\n- "What is the status of my gate pass?"\n- "What is today's mess menu?"\n- "Which alumni workshops or internships are available?"\n- "What is the status of my leave request?"`,
    source: 'rule_engine'
  };
}
