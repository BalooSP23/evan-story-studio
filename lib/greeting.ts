export function getGreetingKey(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'landing.greeting.morning';
  if (hour >= 12 && hour < 17) return 'landing.greeting.afternoon';
  if (hour >= 17 && hour < 21) return 'landing.greeting.evening';
  return 'landing.greeting.night';
}
