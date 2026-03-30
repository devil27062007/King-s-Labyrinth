window.addEventListener('keydown', (event) => {
    if (window.gameSound) gameSound.unlock()

    if (window.gameState?.won) {
        if (event.key === 'r' || event.key === 'R' || event.key === 'Enter') {
            window.restartGame()
        }
        return
    }

    if (player.preventInput) return
    switch (event.key) {
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
    if (window.gameState?.won) return

    switch (event.key) {
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
