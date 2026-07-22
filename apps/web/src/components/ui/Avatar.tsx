export const Avatar = ({ name, size = 36 }: { name: string; size?: number }) => {
  const init =
    name
      .split(" ")
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";
  const hue = (name.charCodeAt(0) * 17) % 360;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `linear-gradient(135deg, hsl(${hue}, 70%, 55%), hsl(${(hue + 40) % 360}, 70%, 45%))`,
        color: "white",
        fontSize: size * 0.36,
        fontWeight: 600,
      }}
      className="inline-flex items-center justify-center flex-shrink-0"
    >
      {init}
    </div>
  );
};
