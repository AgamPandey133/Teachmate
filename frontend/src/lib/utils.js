export const capitialize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

export function formatMessageTime(date) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
