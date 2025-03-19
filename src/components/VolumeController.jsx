import { useEffect, useRef, useState } from "react";
import "./VolumeController.css";

const VolumeController = ({ audio }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [volume, setVolume] = useState(0.5); // Start at 50%
  const circleRef = useRef(null);
  const dotRef = useRef(null);

  useEffect(() => {
    if (audio) {
      audio.volume = volume;
      // Convert volume to angle (0.5 -> π, 1 -> 2π, 0 -> 0)
      const angle = volume * 2 * Math.PI;
      updateDotPosition(angle);
    }
  }, [audio, volume]);

  const updateDotPosition = (angle) => {
    if (!circleRef.current || !dotRef.current) return;

    const circleWidth = circleRef.current.offsetWidth;
    const dotWidth = 16; // Match CSS width
    const padding = 20; // Match CSS padding

    // Calculate true center of circle
    const centerOffset = circleWidth / 2;
    // Calculate radius with padding
    const radius = centerOffset - dotWidth - padding;

    // Calculate dot position from center
    const dotX = centerOffset + radius * Math.cos(angle - Math.PI / 2);
    const dotY = centerOffset + radius * Math.sin(angle - Math.PI / 2);

    // Adjust position by subtracting half dot width
    dotRef.current.style.left = `${dotX - dotWidth / 2}px`;
    dotRef.current.style.top = `${dotY - dotWidth / 2}px`;
  };

  const updatePosition = (e) => {
    if (!circleRef.current) return;

    const rect = circleRef.current.getBoundingClientRect();
    // Calculate true center of circle in page coordinates
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const x = e.clientX - centerX;
    const y = e.clientY - centerY;

    let angle = Math.atan2(y, x) + Math.PI / 2;
    if (angle < 0) angle += 2 * Math.PI;

    const newVolume = angle / (2 * Math.PI);
    setVolume(newVolume);
    updateDotPosition(angle);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        updatePosition(e);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div className="controller">
      <div className="circle" ref={circleRef}>
        <div
          className="dot"
          ref={dotRef}
          onMouseDown={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
        />
        <div className="volume-display">{Math.round(volume * 100)}%</div>
      </div>
    </div>
  );
};

export default VolumeController;
