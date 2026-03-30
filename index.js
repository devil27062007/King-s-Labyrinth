const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

const baseWidth = 64 * 16
const baseHeight = 64 * 9
window.gameState = {
    started: false,
    homeTransitioning: false,
    victoryTransitioning: false,
    won: false,
}

const homeLogo = new Image()
homeLogo.src = './img/GameLogo.png'

const victoryImage = new Image()
victoryImage.src = './img/victory.png'

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
    const t = performance.now() / 1000
    const waveY = Math.sin(t * 2.1) * 3
    const imageScale = 1 + Math.sin(t * 1.6) * 0.008

    const imageMaxWidth = baseWidth * 1.02
    const imageMaxHeight = baseHeight * 1.02
    let imageWidth = imageMaxWidth
    let imageHeight = imageMaxHeight

    if (victoryImage.complete && victoryImage.naturalWidth > 0) {
        const ratio = victoryImage.naturalWidth / victoryImage.naturalHeight
        imageWidth = imageMaxWidth
        imageHeight = imageWidth / ratio

        if (imageHeight > imageMaxHeight) {
            imageHeight = imageMaxHeight
            imageWidth = imageHeight * ratio
        }
    }

    const scaledImageWidth = imageWidth * imageScale
    const scaledImageHeight = imageHeight * imageScale
    const imageX = (baseWidth - scaledImageWidth) / 2
    const imageY = (baseHeight - scaledImageHeight) / 2 + waveY

    if (victoryImage.complete && victoryImage.naturalWidth > 0) {
        c.drawImage(victoryImage, imageX, imageY, scaledImageWidth, scaledImageHeight)
    } else {
        c.fillStyle = '#1c1830'
        c.fillRect(0, 0, baseWidth, baseHeight)
        c.textAlign = 'center'
        c.fillStyle = '#ffe4ab'
        c.font = 'bold 58px Georgia'
        c.fillText('Victory!', baseWidth / 2, imageY + scaledImageHeight * 0.56)
    }
}

function drawHomeScreen() {
    const t = performance.now() / 1000

    const maxLogoWidth = baseWidth * 1.08
    const maxLogoHeight = baseHeight * 0.76
    let logoWidth = maxLogoWidth
    let logoHeight = maxLogoHeight

    if (homeLogo.complete && homeLogo.naturalWidth > 0) {
        const ratio = homeLogo.naturalWidth / homeLogo.naturalHeight
        logoWidth = maxLogoWidth
        logoHeight = logoWidth / ratio

        if (logoHeight > maxLogoHeight) {
            logoHeight = maxLogoHeight
            logoWidth = logoHeight * ratio
        }
    }

    const waveY = Math.sin(t * 2.1) * 6
    const logoScale = 1 + Math.sin(t * 1.6) * 0.012
    const scaledLogoWidth = logoWidth * logoScale
    const scaledLogoHeight = logoHeight * logoScale
    const logoX = (baseWidth - scaledLogoWidth) / 2
    const logoY = baseHeight * -0.05 + waveY

    if (homeLogo.complete && homeLogo.naturalWidth > 0) {
        c.drawImage(homeLogo, logoX, logoY, scaledLogoWidth, scaledLogoHeight)
    } else {
        c.textAlign = 'center'
        c.fillStyle = '#f6dfaf'
        c.font = 'bold 64px Georgia'
        c.fillText('King\'s Labyrinth', baseWidth / 2, logoY + 80)
    }

    const blink = 0.45 + (Math.sin(t * 3.2) + 1) * 0.275

    c.textAlign = 'center'
    c.fillStyle = `rgba(255, 224, 48, ${blink.toFixed(3)})`
    c.font = 'bold 21px Georgia'
    c.fillText('Press A / W / D to Start', baseWidth / 2, baseHeight * 0.60)

    c.fillStyle = 'rgba(196, 234, 255, 0.95)'
    c.font = '16px Georgia'
    c.fillText('A / D Move   W Jump', baseWidth / 2, baseHeight * 0.65)
}

function setWinState() {
    window.gameState.won = true
    window.gameState.victoryTransitioning = true
    player.preventInput = true
    player.velocity.x = 0
    player.velocity.y = 0
    keys.a.pressed = false
    keys.d.pressed = false
    keys.w.pressed = false
    player.switchSprite('idleRight')
    overlay.opacity = 0
    victoryOverlay.opacity = 0

    gsap.to(victoryOverlay, {
        opacity: 1,
        duration: 0.75,
        ease: 'power2.out',
        onComplete: () => {
            window.gameState.victoryTransitioning = false
            victoryOverlay.opacity = 1
        },
    })
}

function restartGame() {
    window.gameState.won = false
    window.gameState.victoryTransitioning = false
    window.gameState.started = true
    overlay.opacity = 1
    victoryOverlay.opacity = 1
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

                if (level === 3) {
                    setWinState()
                    return
                }

                gsap.to(overlay, {
                    opacity: 1,
                    onComplete: () => {
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

const victoryOverlay = {
    opacity: 1,
}

const homeOverlay = {
    opacity: 1,
}

function startGameFromHome() {
    if (window.gameState.started || window.gameState.homeTransitioning) return

    window.gameState.started = true
    window.gameState.homeTransitioning = true
    homeOverlay.opacity = 1

    gsap.to(homeOverlay, {
        opacity: 0,
        duration: 0.7,
        ease: 'power2.out',
        onComplete: () => {
            window.gameState.homeTransitioning = false
            homeOverlay.opacity = 0
        }
    })
}

window.startGameFromHome = startGameFromHome

function animate() {
    window.requestAnimationFrame(animate)

    background.draw()

    doors.forEach((door) => {
        door.draw()
    })

    if (!window.gameState.started && !window.gameState.homeTransitioning) {
        updateBodyFadeBackground(0)
        drawHomeScreen()
        return
    }

    if (!window.gameState.won) {
        player.handleInput(keys)
        player.update()
        player.draw()
    }

    if (window.gameState.won) {
        updateBodyFadeBackground(0)
        c.save()
        c.globalAlpha = window.gameState.victoryTransitioning ? victoryOverlay.opacity : 1
        drawWinScreen()
        c.restore()
    } else {
        updateBodyFadeBackground(overlay.opacity)

        c.save()
        c.globalAlpha = overlay.opacity
        c.fillStyle = 'black'
        c.fillRect(0, 0, baseWidth, baseHeight)
        c.restore()
    }
    if (window.gameState.homeTransitioning) {
        c.save()
        c.globalAlpha = homeOverlay.opacity
        drawHomeScreen()
        c.restore()
    }

}


levels[level].init()
animate()
