export async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    return false;
  }
  return (await Notification.requestPermission()) === "granted";
}
