export function generateReferenceNumber(submittedAt: Date, sequence: number): string {
  const yyyy = submittedAt.getUTCFullYear();
  const mm = String(submittedAt.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(submittedAt.getUTCDate()).padStart(2, '0');
  const seq = String(sequence).padStart(3, '0');
  return `VH-${yyyy}${mm}${dd}-${seq}`;
}
