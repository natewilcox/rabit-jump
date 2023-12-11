const createBatAnims = (anims: Phaser.Animations.AnimationManager) => {

    anims.create({
        key: `sitting`, 
        frames: [{ key: 'bat', frame: 'sitting/bat-1.png' }]
    });
    
    anims.create({
        key: `flying`, 
        frames: anims.generateFrameNames('bat', {start: 1, end: 2, prefix: 'flying/bat-', suffix: '.png'}),
        frameRate: 13,
        repeat: -1
    });
}

export {
    createBatAnims
}