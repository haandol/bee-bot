export const AppContext = {
  ns: 'BeeBot',
};

const apps = [
  'hello_world', 'helper', 'memo',
];
export const BotProps = {
  accessTokenKey: '/BEEBOT/SLACK/TOKEN/ACCESS',                 // Should be synced with SSM key
  verificationTokenKey: '/BEEBOT/SLACK/TOKEN/VERIFICATION',     // Should be synced with SSM key
  apps: JSON.stringify(apps),
  cmdPrefix: '!',
};