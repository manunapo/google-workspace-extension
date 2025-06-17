export function setScriptProperties(key: string, value: string) {
  PropertiesService.getScriptProperties().setProperty(key, value);
}

export function getScriptProperties(key: string) {
  return PropertiesService.getScriptProperties().getProperty(key);
}
