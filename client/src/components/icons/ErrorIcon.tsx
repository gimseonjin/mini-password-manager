interface ErrorIconProps {
  width?: number
  height?: number
  fill?: string
  className?: string
}

function ErrorIcon({
  width = 16,
  height = 16,
  fill = "currentColor",
  className = ""
}: ErrorIconProps) {
  return (
    <svg
      width={width}
      height={height}
      fill={fill}
      className={className}
      viewBox="0 0 16 16"
    >
      <path d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z" />
    </svg>
  )
}

export default ErrorIcon 