import React from 'react';
import VideoCard from './VideoCard';

const VideoGrid = ({
  localStream,
  localUser,
  remoteStreams = [],
  isHost = false,
  micEnabled = true,
  cameraEnabled = true,
  isScreenSharing = false
}) => {
  const totalCount = 1 + remoteStreams.length;

  const getGridClass = () => {
    if (totalCount === 1) return 'grid-cols-1 max-w-4xl mx-auto h-[calc(100vh-180px)]';
    if (totalCount === 2) return 'grid-cols-1 md:grid-cols-2 max-w-6xl mx-auto h-[calc(100vh-180px)]';
    if (totalCount <= 4) return 'grid-cols-1 sm:grid-cols-2 max-w-6xl mx-auto auto-rows-fr';
    return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto auto-rows-fr';
  };

  return (
    <div className="w-full h-full p-4 overflow-y-auto">
      <div className={`grid gap-4 w-full ${getGridClass()}`}>
        {/* Local Participant Card */}
        <VideoCard
          stream={localStream}
          name={localUser?.name || 'You'}
          isLocal={true}
          isHost={isHost}
          micEnabled={micEnabled}
          cameraEnabled={cameraEnabled}
          isScreenSharing={isScreenSharing}
        />

        {/* Remote Participants Cards */}
        {remoteStreams.map((remote) => (
          <VideoCard
            key={remote.socketId}
            stream={remote.stream}
            name={remote.name}
            isLocal={false}
            isHost={false}
            micEnabled={remote.micEnabled}
            cameraEnabled={remote.cameraEnabled}
            isScreenSharing={remote.isScreenSharing}
          />
        ))}
      </div>
    </div>
  );
};

export default VideoGrid;
