export function LiveMinutePulse({ minute }: { minute: number }) {
  return (
    <span className="text-emerald-400 font-bold animate-pulse">
      {minute}&apos;
    </span>
  );
}