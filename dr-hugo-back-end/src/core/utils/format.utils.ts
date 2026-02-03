export const formatToTitleCase = (input: string): string => {
  if (!input) return input;
  return input
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
