export function formatKes(amount: number) {
  return `KSh ${Math.round(amount).toLocaleString("en-KE")}`;
}
