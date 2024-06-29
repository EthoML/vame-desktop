export const header = (text: string) => text.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
