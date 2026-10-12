/** The results' grid, shared with the skeletons that stand in for them so the two line up. */
export function ActivityGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">{children}</div>;
}
