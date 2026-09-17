const { getDatabase } = require('../config/database');

// Helper to generate format like ABC-123-XYZ
function generateMeetingCode() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';

  const part1 = Array.from({ length: 3 }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
  const part2 = Array.from({ length: 3 }, () => numbers[Math.floor(Math.random() * numbers.length)]).join('');
  const part3 = Array.from({ length: 3 }, () => letters[Math.floor(Math.random() * letters.length)]).join('');

  return `${part1}-${part2}-${part3}`;
}

const createMeeting = async (req, res) => {
  try {
    const { title } = req.body;
    const hostId = req.user.id;
    const meetingTitle = title && title.trim().length > 0 ? title.trim() : `${req.user.name}'s Meeting`;

    const db = await getDatabase();

    let meetingCode = generateMeetingCode();
    let existing = await db.get('SELECT id FROM meetings WHERE meeting_code = ?', [meetingCode]);

    // Guarantee uniqueness
    while (existing) {
      meetingCode = generateMeetingCode();
      existing = await db.get('SELECT id FROM meetings WHERE meeting_code = ?', [meetingCode]);
    }

    const result = await db.run(
      'INSERT INTO meetings (meeting_code, host_id, title) VALUES (?, ?, ?)',
      [meetingCode, hostId, meetingTitle]
    );

    const createdMeeting = await db.get(
      `SELECT m.id, m.meeting_code, m.host_id, m.title, m.created_at, u.name as host_name 
       FROM meetings m 
       JOIN users u ON m.host_id = u.id 
       WHERE m.id = ?`,
      [result.lastID]
    );

    return res.status(201).json({
      success: true,
      message: 'Meeting created successfully.',
      data: createdMeeting
    });
  } catch (error) {
    console.error('Error in createMeeting:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create meeting room.'
    });
  }
};

const getMeetings = async (req, res) => {
  try {
    const db = await getDatabase();
    const meetings = await db.all(
      `SELECT m.id, m.meeting_code, m.host_id, m.title, m.created_at, u.name as host_name 
       FROM meetings m 
       JOIN users u ON m.host_id = u.id 
       WHERE m.host_id = ? 
       ORDER BY m.created_at DESC 
       LIMIT 20`,
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      data: meetings
    });
  } catch (error) {
    console.error('Error in getMeetings:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch meetings.'
    });
  }
};

const getMeetingByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const formattedCode = code.toUpperCase().trim();

    const db = await getDatabase();
    const meeting = await db.get(
      `SELECT m.id, m.meeting_code, m.host_id, m.title, m.created_at, u.name as host_name 
       FROM meetings m 
       JOIN users u ON m.host_id = u.id 
       WHERE m.meeting_code = ?`,
      [formattedCode]
    );

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found. Please check the meeting code.'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        ...meeting,
        is_host: meeting.host_id === req.user.id
      }
    });
  } catch (error) {
    console.error('Error in getMeetingByCode:', error);
    return res.status(500).json({
      success: false,
      message: 'Error looking up meeting room.'
    });
  }
};

const deleteMeeting = async (req, res) => {
  try {
    const { code } = req.params;
    const db = await getDatabase();

    const meeting = await db.get('SELECT * FROM meetings WHERE meeting_code = ?', [code.toUpperCase().trim()]);

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found.'
      });
    }

    if (meeting.host_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the meeting host can delete or end this meeting.'
      });
    }

    await db.run('DELETE FROM meetings WHERE id = ?', [meeting.id]);

    return res.status(200).json({
      success: true,
      message: 'Meeting deleted successfully.'
    });
  } catch (error) {
    console.error('Error in deleteMeeting:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete meeting.'
    });
  }
};

module.exports = {
  createMeeting,
  getMeetings,
  getMeetingByCode,
  deleteMeeting
};
