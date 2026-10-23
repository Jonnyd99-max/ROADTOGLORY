declare const __APP_BUILD__:string;
export const APP_VERSION='0.2.1';
export const BUILD_TIME=typeof __APP_BUILD__==='string'?__APP_BUILD__.slice(0,16).replace('T',' ')+' UTC':'Development';
