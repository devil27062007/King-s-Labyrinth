const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

const baseWidth = 64 * 16
const baseHeight = 64 * 9
window.gameState = {
    won: false,
}

function setupCanvasResolution() {
    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.floor(baseWidth * dpr)
    canvas.height = Math.floor(baseHeight * dpr)
    c.setTransform(dpr, 0, 0, dpr, 0, 0)
    c.imageSmoothingEnabled = false
}

function resizeCanvasDisplay() {
    const rawScale = Math.min(
        window.innerWidth / baseWidth,
        window.innerHeight / baseHeight
    )
    const scale = rawScale >= 1 ? Math.floor(rawScale) : rawScale

    canvas.style.width = `${Math.round(baseWidth * scale)}px`
    canvas.style.height = `${Math.round(baseHeight * scale)}px`
}
window.addEventListener('resize', () => {
    setupCanvasResolution()
    resizeCanvasDisplay()
})
setupCanvasResolution()
resizeCanvasDisplay()

const bodyBackgroundChannels =
    getComputedStyle(document.body)
        .backgroundColor
        .match(/\d+(?:\.\d+)?/g)
        .slice(0, 3)
        .map(Number)

function updateBodyFadeBackground(opacity) {
    const fadeMultiplier = 1 - opacity
    const r = Math.round(bodyBackgroundChannels[0] * fadeMultiplier)
    const g = Math.round(bodyBackgroundChannels[1] * fadeMultiplier)
    const b = Math.round(bodyBackgroundChannels[2] * fadeMultiplier)
    document.body.style.backgroundColor = `rgb(${r}, ${g}, ${b})`
}

function drawRoundedRect(x, y, width, height, radius) {
    c.beginPath()
    c.moveTo(x + radius, y)
    c.lineTo(x + width - radius, y)
    c.quadraticCurveTo(x + width, y, x + width, y + radius)
    c.lineTo(x + width, y + height - radius)
    c.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    c.lineTo(x + radius, y + height)
    c.quadraticCurveTo(x, y + height, x, y + height - radius)
    c.lineTo(x, y + radius)
    c.quadraticCurveTo(x, y, x + radius, y)
    c.closePath()
}

function drawWinScreen() {
    const panelWidth = 680
    const panelHeight = 260
    const panelX = (baseWidth - panelWidth) / 2
    const panely = (baseHeight - panelHeight) / 2

    drawRoundedRect(panelX, panely, panelWidth, panelHeight, 18)
    c.fillStyle = 'rgba(34,28,48,0.94)'
    c.fill()
    c.lineWidth = 4
    c.strokeStyle = '#e5ba76'
    c.stroke()

    c.textAlign = 'center'
    c.fillStyle = '#f6dfaf'
    c.font = 'bold 44px Georgia'
    c.fillText('Victory in the Labyrinth', baseWidth / 2, panely + 82)

    c.fillStyle = '#efd7a0'
    c.font = '24px Georgia'
    c.fillText('The King Has conquered all three halls.', baseWidth / 2, panely + 130)

    c.fillStyle = '#d5c7aa'
    c.font = '20px Georgia'
    c.fillText('Press R or Enter to begin a new game .', baseWidth / 2, panely + 178)

    c.fillStyle = '#c8b9ec'
    c.font = '18px Georgia'
    c.fillText('Thank you for playing Kings\'s Labyrinth', baseWidth / 2, panely + 210)
}
function setWinState() {
    window.gameState.won = true
    player.preventInput = true
    player.velocity.x = 0
    player.velocity.y = 0
    keys.a.pressed = false
    keys.d.pressed = false
    keys.w.pressed = false
    player.switchSprite('idleRight')
    overlay.opacity = 0
}

function restartGame() {
    window.gameState.won = false
    overlay.opacity = 1
    level = 1
    levels[level].init()
    player.switchSprite('idleRight')
    player.preventInput = false
    player.velocity.x = 0
    player.velocity.y = 0
    keys.a.pressed = false
    keys.d.pressed = false
    keys.w.pressed = false

    gsap.to(overlay, {
        opacity: 0,
    })
}

window.restartGame = restartGame

let parsedCollisions
let collisionBlocks
let background
let doors
const player = new Player({
    imageSrc: './img/king/idle.png',
    frameRate: 11,
    animations: {
        idleRight: {
            frameRate: 11,
            frameBuffer: 2,
            loop: true,
            imageSrc: './img/king/idle.png',
        },
        idleLeft: {
            frameRate: 11,
            frameBuffer: 2,
            loop: true,
            imageSrc: './img/king/idleLeft.png',
        },
        runRight: {
            frameRate: 8,
            frameBuffer: 4,
            loop: true,
            imageSrc: './img/king/runRight.png',
        },
        runLeft: {
            frameRate: 8,
            frameBuffer: 4,
            loop: true,
            imageSrc: './img/king/runLeft.png',
        },
        enterDoor: {
            frameRate: 8,
            frameBuffer: 4,
            loop: false,
            imageSrc: './img/king/enterDoor.png',
            onComplete: () => {

                gsap.to(overlay, {
                    opacity: 1,
                    onComplete: () => {
                        if (level === 3) {
                            setWinState()
                            return
                        }

                        level++

                        if (level === 4) level = 1
                        levels[level].init()
                        player.switchSprite('idleRight')
                        player.preventInput = false
                        gsap.to(overlay, {
                            opacity: 0,
                        })
                    },
                })
            },
        },
    },
})

let level = 1
let levels = {
    1: {
        init: () => {
            player.position.x = 200
            player.position.y = 200
            parsedCollisions = collisionsLevel1.parse2D()
            collisionBlocks = parsedCollisions.createObjectsFrom2D()
            player.collisionBlocks = collisionBlocks

            if (player.currentAnimation) player.currentAnimation.isActive = false

            background = new Sprite({
                position: {
                    x: 0,
                    y: 0,
                },
                imageSrc: './img/backgroundLevel1.png',
            })

            doors = [
                new Sprite({
                    position: {
                        x: 767,
                        y: 270,
                    },
                    imageSrc: './img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                }),
            ]
        },
    },
    2: {
        init: () => {
            parsedCollisions = collisionsLevel2.parse2D()
            collisionBlocks = parsedCollisions.createObjectsFrom2D()
            player.collisionBlocks = collisionBlocks
            player.position.x = 750
            player.position.y = 230

            if (player.currentAnimation) player.currentAnimation.isActive = false

            background = new Sprite({
                position: {
                    x: 0,
                    y: 0,
                },
                imageSrc: './img/backgroundLevel2.png',
            })

            doors = [
                new Sprite({
                    position: {
                        x: 176.0,
                        y: 335,
                    },
                    imageSrc: './img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false
                }),
            ]
        }
    },
    3: {
        init: () => {
            parsedCollisions = collisionsLevel3.parse2D()
            collisionBlocks = parsedCollisions.createObjectsFrom2D()
            player.collisionBlocks = collisionBlocks
            player.position.x = 96
            player.position.y = 140
            if (player.currentAnimation) player.currentAnimation.isActive = false

            background = new Sprite({
                position: {
                    x: 0,
                    y: 0,
                },
                imageSrc: './img/backgroundLevel3.png',
            })

            doors = [
                new Sprite({
                    position: {
                        x: 772.0,
                        y: 336,
                    },
                    imageSrc: './img/doorOpen.png',
                    frameRate: 5,
                    frameBuffer: 5,
                    loop: false,
                    autoplay: false,
                }),
            ]
        },
    },
}

const keys = {
    w: {
        pressed: false,
    },
    a: {
        pressed: false,
    },
    d: {
        pressed: false,
    },
}

const overlay = {
    opacity: 0,
}

function animate() {
    window.requestAnimationFrame(animate)

    background.draw()

    doors.forEach((door) => {
        door.draw()
    })

    if (!window.gameState.won) {
        player.handleInput(keys)
        player.update()
        player.draw()
    }

    if (window.gameState.won) {
        updateBodyFadeBackground(0)
        drawWinScreen()
    } else {
        updateBodyFadeBackground(overlay.opacity)

        c.save()
        c.globalAlpha = overlay.opacity
        c.fillStyle = 'black'
        c.fillRect(0, 0, baseWidth, baseHeight)
        c.restore()
    }
}


levels[level].init()
animate()
