/** Five-step difficulty meter (1 = easy, 5 = strenuous). */
export default function Meter({ level }: { level: number }) {
  return (
    <span className="meter" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((k) => (
        <i key={k} className={k < level ? "on" : ""} />
      ))}
    </span>
  );
}
