let counter = 0;

/** Monotonic id generator for dialog instances. */
export function nextDialogId(): number {
  return ++counter;
}
