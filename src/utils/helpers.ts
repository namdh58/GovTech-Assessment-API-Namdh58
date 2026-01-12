import { REGEX } from './constants';

export const extractEmails = (text: string): string[] => {
    const mentions: string[] = [];
    let match;
    while ((match = REGEX.MENTION.exec(text)) !== null) {
        mentions.push(match[1]);
    }
    return mentions;
};
