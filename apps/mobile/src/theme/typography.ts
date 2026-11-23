import { Platform } from 'react-native';

export const bodyFont = Platform.select({ ios: 'System', android: 'sans-serif', default: 'system-ui' });
export const headingFont = Platform.select({ ios: 'System', android: 'sans-serif-medium', default: 'system-ui' });
