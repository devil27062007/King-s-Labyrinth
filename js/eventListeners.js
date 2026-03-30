window.addEventListener('keydown', (event) => {
    if (window.gameSound) gameSound.unlock()
    const key = event.key.toLowerCase()

    if (!window.gameState?.assetsReady) return

    if (window.gameState?.won) {
        if (key === 'r' && window.goHomeFromVictory) {
            window.goHomeFromVictory()
        }
        return
    }

    if (!window.gameState?.started) {
        if (key === 'a' || key === 'd' || key === 'w') {
            if (window.startGameFromHome) {
                window.startGameFromHome()
            } else {
                window.gameState.started = true
            }
        } else {
            return
        }
    }

    if (player.preventInput) return
    switch (key) {
        case 'w':
            for (let i = 0; i < doors.length; i++) {
                const door = doors[i]

                if (
                    player.hitbox.position.x + player.hitbox.width <=
                    door.position.x + door.width &&
                    player.hitbox.position.x >= door.position.x &&
                    player.hitbox.position.y + player.hitbox.height >= door.position.y &&
                    player.hitbox.position.y <= door.position.y + door.height
                ) {
                    player.velocity.x = 0
                    player.velocity.y = 0
                    player.preventInput = true
                    player.switchSprite('enterDoor')
                    if (window.gameSound) gameSound.playDoorOpen()
                    door.play()
                    return
                }
            }
            if (player.velocity.y === 0) player.velocity.y = -25

            break
        case 'a':
            //move left
            keys.a.pressed = true
            break
        case 'd':
            //move left
            keys.d.pressed = true
            break
    }
})

window.addEventListener('keyup', (event) => {
    if (!window.gameState?.assetsReady) return
    if (window.gameState?.won || !window.gameState?.started) return

    switch (event.key.toLowerCase()) {
        case 'a':
            //move left
            keys.a.pressed = false

            break
        case 'd':
            //move right
            keys.d.pressed = false

            break
    }
})

