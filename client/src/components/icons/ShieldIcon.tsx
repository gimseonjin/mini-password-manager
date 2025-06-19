interface ShieldIconProps {
  width?: number
  height?: number
  fill?: string
  stroke?: string
  strokeWidth?: number
  className?: string
}

function ShieldIcon({
  width = 32,
  height = 32,
  fill = "none",
  stroke = "white",
  strokeWidth = 2,
  className = ""
}: ShieldIconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill={fill}
      className={className}
    >
      <path
        d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 12L11 14L15 10"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default ShieldIcon 