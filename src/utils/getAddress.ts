export async function getAddress(latitude: number, longitude: number) {
  const API_KEY = 'pk.3d5da611eff9f930202f35fe178ac983';
  try {
    const response = await fetch(
      `https://us1.locationiq.com/v1/reverse?lat=${latitude}&lon=${longitude}&format=json&key=${API_KEY}&units=metric`,
    );
    const data = await response.json();
    return data.display_name || '';
  } catch (error) {
    return '';
  }
}
