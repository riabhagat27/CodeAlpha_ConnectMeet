const path = require('path');
const fs = require('fs');
const { getDatabase } = require('../config/database');

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded or file rejected due to security policy.'
      });
    }

    const { meetingId } = req.body;
    if (!meetingId) {
      return res.status(400).json({
        success: false,
        message: 'Meeting ID is required for file upload.'
      });
    }

    const { originalname, filename, path: filePath, size } = req.file;
    const userId = req.user.id;

    const db = await getDatabase();
    const result = await db.run(
      `INSERT INTO files (meeting_id, user_id, original_name, stored_name, file_path, file_size) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [meetingId, userId, originalname, filename, filePath, size]
    );

    const uploadedRecord = await db.get(
      `SELECT f.id, f.meeting_id, f.user_id, f.original_name, f.stored_name, f.file_size, f.uploaded_at, u.name as user_name 
       FROM files f 
       JOIN users u ON f.user_id = u.id 
       WHERE f.id = ?`,
      [result.lastID]
    );

    return res.status(201).json({
      success: true,
      message: 'File uploaded successfully.',
      data: uploadedRecord
    });
  } catch (error) {
    console.error('Error in uploadFile:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while uploading file.'
    });
  }
};

const getMeetingFiles = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const db = await getDatabase();

    const files = await db.all(
      `SELECT f.id, f.meeting_id, f.user_id, f.original_name, f.stored_name, f.file_size, f.uploaded_at, u.name as user_name 
       FROM files f 
       JOIN users u ON f.user_id = u.id 
       WHERE f.meeting_id = ? 
       ORDER BY f.uploaded_at DESC`,
      [meetingId]
    );

    return res.status(200).json({
      success: true,
      data: files
    });
  } catch (error) {
    console.error('Error in getMeetingFiles:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve files for this meeting.'
    });
  }
};

const downloadFile = async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDatabase();

    const file = await db.get('SELECT * FROM files WHERE id = ?', [id]);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File record not found.'
      });
    }

    if (!fs.existsSync(file.file_path)) {
      return res.status(404).json({
        success: false,
        message: 'File physical storage not found on server.'
      });
    }

    return res.download(file.file_path, file.original_name);
  } catch (error) {
    console.error('Error in downloadFile:', error);
    return res.status(500).json({
      success: false,
      message: 'Error downloading file.'
    });
  }
};

module.exports = {
  uploadFile,
  getMeetingFiles,
  downloadFile
};
