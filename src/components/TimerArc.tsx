type TimerArcProps = {
  progress: number;
  radius: number;
  strokeWidth: number;
  strokeFrom: string;
  strokeTo?: string;
  /** 残り時間の割合(0〜1)。これを下回った分は strokeTo の色で描画する */
  strokeToThreshold?: number;
  viewBoxSize: number;
};

function TimerArc({
  progress,
  radius,
  strokeWidth,
  strokeFrom,
  strokeTo,
  strokeToThreshold = 0,
  viewBoxSize,
}: TimerArcProps) {
  const center = viewBoxSize / 2;
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const clampedThreshold = Math.max(0, Math.min(1, strokeToThreshold));
  const circumference = 2 * Math.PI * radius;

  const strokeToLength =
    Math.min(clampedProgress, clampedThreshold) * circumference;
  const strokeFromLength =
    Math.max(0, clampedProgress - clampedThreshold) * circumference;
  const strokeFromOffset = -(clampedThreshold * circumference);

  return (
    <svg
      className="timer-circle-container"
      width={viewBoxSize}
      height={viewBoxSize}
      viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
    >
      {strokeFromLength > 0 && (
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={strokeFrom}
          strokeWidth={strokeWidth}
          strokeDasharray={`${strokeFromLength} ${circumference - strokeFromLength}`}
          strokeDashoffset={strokeFromOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
      )}
      {clampedThreshold > 0 && strokeToLength > 0 && (
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={strokeTo ?? strokeFrom}
          strokeWidth={strokeWidth}
          strokeDasharray={`${strokeToLength} ${circumference - strokeToLength}`}
          strokeDashoffset={0}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
      )}
    </svg>
  );
}

export default TimerArc;
