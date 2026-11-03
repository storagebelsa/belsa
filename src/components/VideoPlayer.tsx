'use client';

import React, { useState } from 'react';

interface VideoPlayerProps {
  videoId: string;
  title: string;
  thumbnail: string;
  badge?: string;
  desc?: string;
  aspectRatio?: string;
  showInfo?: boolean;
}

export default function VideoPlayer({
  videoId,
  title,
  thumbnail,
  badge,
  desc,
  aspectRatio = '16 / 9',
  showInfo = true,
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="belsa-video-card">
      <div 
        className="belsa-video-container"
        style={{ aspectRatio }}
      >
        {isPlaying ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="belsa-video-iframe"
          />
        ) : (
          <button
            type="button"
            className="belsa-video-thumb-btn"
            onClick={() => setIsPlaying(true)}
            aria-label={`Putar video: ${title}`}
          >
            <img
              src={thumbnail}
              alt={title}
              className="belsa-video-thumb-img"
              loading="lazy"
            />
            <div className="belsa-video-overlay">
              <div className="belsa-video-play-btn" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
            {badge && (
              <span className="belsa-video-badge">{badge}</span>
            )}
          </button>
        )}
      </div>

      {showInfo && (title || desc) && (
        <div className="belsa-video-info">
          {title && <h3 className="belsa-video-title">{title}</h3>}
          {desc && <p className="belsa-video-desc">{desc}</p>}
        </div>
      )}
    </div>
  );
}
