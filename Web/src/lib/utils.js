export function formatMessageTime(date) {
    return new Date(date).toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
}
