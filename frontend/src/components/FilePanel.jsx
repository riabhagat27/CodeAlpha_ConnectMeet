import React, { useState, useEffect, useRef } from 'react';
import { Folder, Upload, Download, X, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { fileService } from '../services/api';

const FilePanel = ({ meetingId, meetingCode, socket, currentUser, onClose }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const fileInputRef = useRef(null);

  const fetchFiles = async () => {
    try {
      const res = await fileService.getMeetingFiles(meetingId || meetingCode);
      if (res.success) {
        setFiles(res.data);
      }
    } catch (err) {
      console.error('Error fetching meeting files:', err);
    }
  };

  useEffect(() => {
    fetchFiles();

    if (socket) {
      const handleFileNotification = () => {
        fetchFiles();
      };
      socket.on('file-uploaded-notification', handleFileNotification);
      return () => {
        socket.off('file-uploaded-notification', handleFileNotification);
      };
    }
  }, [meetingId, meetingCode, socket]);

  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setError(null);
    setSuccess(null);

    // Frontend pre-validation for size (10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size exceeds maximum limit of 10MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('meetingId', meetingId || meetingCode);

    try {
      setUploading(true);
      const res = await fileService.uploadFile(formData);

      if (res.success && res.data) {
        setSuccess(`File "${selectedFile.name}" uploaded successfully.`);
        fetchFiles();

        // Notify room via Socket.io
        if (socket) {
          socket.emit('file-uploaded', {
            meetingCode,
            fileRecord: res.data
          });
        }
      }
    } catch (err) {
      console.error('Upload error:', err);
      const msg = err.response?.data?.message || 'Failed to upload file.';
      setError(msg);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-900 border-l border-slate-800 shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
        <div className="flex items-center gap-2">
          <Folder className="w-5 h-5 text-indigo-400" />
          <h3 className="font-semibold text-slate-100 text-base">Shared Files</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Upload Zone */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/30">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-slate-700 hover:border-indigo-500 bg-slate-800/40 hover:bg-slate-800/80 transition-all flex items-center justify-center gap-2 text-sm font-semibold text-slate-300 hover:text-white disabled:opacity-50"
        >
          <Upload className="w-4 h-4 text-indigo-400" />
          <span>{uploading ? 'Uploading File...' : 'Upload New File'}</span>
        </button>
        <p className="text-[11px] text-slate-500 text-center mt-2">Max file size: 10MB. Executables restricted.</p>

        {/* Feedback banners */}
        {error && (
          <div className="mt-3 p-2.5 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mt-3 p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{success}</span>
          </div>
        )}
      </div>

      {/* Files List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {files.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <Folder className="w-10 h-10 mb-2 stroke-1 text-slate-600" />
            <p className="text-sm font-medium">No files shared yet.</p>
            <p className="text-xs text-slate-600 mt-1">Uploaded documents or assets will appear here for participants.</p>
          </div>
        ) : (
          files.map((file) => (
            <div
              key={file.id}
              className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 hover:border-indigo-500/40 transition-colors flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-9 h-9 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-sm font-semibold text-slate-200 truncate">{file.original_name}</h4>
                  <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>{formatFileSize(file.file_size)}</span>
                    <span>•</span>
                    <span className="truncate">by {file.user_name}</span>
                  </p>
                </div>
              </div>

              <a
                href={fileService.getDownloadUrl(file.id)}
                download={file.original_name}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-slate-700 hover:bg-indigo-600 text-slate-200 hover:text-white transition-colors shrink-0"
                title="Download File"
              >
                <Download className="w-4 h-4" />
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FilePanel;
