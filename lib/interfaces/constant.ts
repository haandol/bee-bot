export const Namespace = 'BeeBot';
export const Region = 'ap-northeast-2';

const apps = [
  'hello_world', 'helper', 'memo',
];
export const BotProps = {
  accessTokenKey: '/BEEBOT/SLACK/TOKEN/ACCESS',                 // Should be synced with SSM key
  verificationTokenKey: '/BEEBOT/SLACK/TOKEN/VERIFICATION',     // Should be synced with SSM key
  apps: JSON.stringify(apps),
  cmdPrefix: '!',
}