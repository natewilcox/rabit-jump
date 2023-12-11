const createEffectsAnims = (anims: Phaser.Animations.AnimationManager) => {

    anims.create({
        key: `blast`, 
        frames: anims.generateFrameNames('effects', {start: 1, end: 6, prefix: 'blast/blast-', suffix: '.png'}),
        frameRate: 5,
        repeat: -1
    });

    anims.create({
        key: `death`, 
        frames: anims.generateFrameNames('effects', {start: 1, end: 10, prefix: 'death/death-', suffix: '.png'}),
        frameRate: 5,
        repeat: -1
    });
}

export {
    createEffectsAnims
}