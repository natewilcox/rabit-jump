const createBunnyAnims = (anims: Phaser.Animations.AnimationManager) => {

    anims.create({
        key: `idle`, 
        frames: anims.generateFrameNames('bunny', {start: 1, end: 2, prefix: 'idle/idle_', suffix: '.png'}),
        frameRate: 5,
        repeatDelay: 2000,
        repeat: -1
    });

    anims.create({
        key: `jump`, 
        frames: anims.generateFrameNames('bunny', {start: 1, end: 2, prefix: 'jump/jump-', suffix: '.png'}),
        frameRate: 20,
    });

    anims.create({
        key: `ghost`, 
        frames: anims.generateFrameNames('bunny', {start: 1, end: 1, prefix: 'ghost/ghost-', suffix: '.png'}),
        frameRate: 1,
    });
}

export {
    createBunnyAnims
}