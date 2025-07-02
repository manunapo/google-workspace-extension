export function setScriptProperties(key: string, value: string) {
  try {
    PropertiesService.getScriptProperties().setProperty(key, value);
  } catch (error) {
    console.error('Error setting script property:', error);
  }
}

export function getScriptProperties(key: string) {
  try {
    return PropertiesService.getScriptProperties().getProperty(key);
  } catch (error) {
    console.error('Error getting script property:', error);
  }
  return null;
}

export function setUserProperties(key: string, value: string) {
  try {
    PropertiesService.getUserProperties().setProperty(key, value);
  } catch (error) {
    console.error('Error setting user property:', error);
  }
}

export function getUserProperties(key: string) {
  try {
    return PropertiesService.getUserProperties().getProperty(key);
  } catch (error) {
    console.error('Error getting user property:', error);
  }
  return null;
}
