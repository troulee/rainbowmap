"use client";

import { compassLabel } from "@/lib/utils";

type CompassPickerProps = {
  direction: number | null;
  onChange: (deg: number | null) => void;
};

export default function CompassPicker({ direction, onChange }: CompassPickerProps) {
  const deg = direction ?? 0;
  const label = direction != null ? compassLabel(deg) : "--";

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Compass visual */}
      <div className="relative w-36 h-36 flex items-center justify-center">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-4 border-surface-container-highest" />

        {/* Cardinal markers */}
        {["N", "E", "S", "W"].map((d, i) => {
          const angle = i * 90;
          const rad = (angle - 90) * (Math.PI / 180);
          const x = 50 + 42 * Math.cos(rad);
          const y = 50 + 42 * Math.sin(rad);
          return (
            <span
              key={d}
              className="absolute text-[10px] font-bold text-on-surface-variant"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              {d}
            </span>
          );
        })}

        {/* Inner circle */}
        <div className="w-28 h-28 rounded-full bg-surface-container-highest flex items-center justify-center relative">
          {/* Needle */}
          <div
            className="absolute w-0.5 h-20 origin-bottom"
            style={{
              bottom: "50%",
              transform: `rotate(${deg}deg)`,
              background: "linear-gradient(to top, #c6e7ff, #00658d)",
            }}
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rounded-full shadow-md" />
          </div>

          {/* Center label */}
          <div className="text-center z-10 bg-surface-container-highest/80 px-2 py-1 rounded">
            <p className="text-lg font-extrabold text-on-surface">{label}</p>
            <p className="text-[10px] text-on-surface-variant font-mono">{deg}°</p>
          </div>
        </div>
      </div>

      {/* Slider */}
      <input
        type="range"
        min={0}
        max={359}
        value={deg}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #00658d ${(deg / 359) * 100}%, #d8e4ea ${(deg / 359) * 100}%)`,
        }}
      />
    </div>
  );
}
