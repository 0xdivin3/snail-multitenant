// src/components/SpiralMark.jsx
// Signature visual motif: a simplified snail-shell spiral, used as logo mark and loading indicator.
export default function SpiralMark({ size = 28, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M20 36C9.5 36 4 28.8 4 21.5C4 15 9 10 15.5 10C21 10 25 14 25 18.8C25 23 22 26 18 26C14.5 26 12 23.5 12 20.5C12 18 13.8 16 16 16"
        stroke={color}
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
