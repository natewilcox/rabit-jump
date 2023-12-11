
export enum ServerObjectAnimation {
    Idle,
    Jump
}

export const ServerObjectAnimations = [
    'idle',
    'jump'
]

export const ServerObjectAnimationLookup = new Map();
ServerObjectAnimationLookup.set('idle', 0);
ServerObjectAnimationLookup.set('jump', 1);