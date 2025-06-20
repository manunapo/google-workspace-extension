export function setScriptProperties(key: string, value: string) {
  PropertiesService.getScriptProperties().setProperty(key, value);
}

export function getScriptProperties(key: string) {
  return PropertiesService.getScriptProperties().getProperty(key);
}

export function setUserProperties(key: string, value: string) {
  PropertiesService.getUserProperties().setProperty(key, value);
}

export function getUserProperties(key: string) {
  return PropertiesService.getUserProperties().getProperty(key);
}
