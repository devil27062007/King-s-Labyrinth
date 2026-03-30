const gameAssetLoader = (() => {
    const state = {
        total : 0 ,
        loaded : 0 ,
        started : false ,
    }

    const preloadAssets = [
        './img/backgroundLevel1.png',
        './img/backgroundLevel2.png',
        './img/backgroundLevel3.png',
        './img/box.png',
        './img/doorOpen.png' ,
        './img/GameLogo.png' ,
        './img/victory.png' ,
        './img/king/enterDoor.png',
        './img/king/idle.png' ,
        './img/king/idleLeft.png' ,
        './img/king/runLeft.png' ,
        './img/king/runRight.png' ,
        './sounds/bgMusic.mpeg' ,
        './sounds/doorOpen.mp3' ,,
    ]

    function markAssetLoaded(){
        state.loaded = Math.min(state.loaded + 1 , state.total )
    }

    function preloadImage(src){
        return new Promise((resolve) => {
            const image = new Image()

            const done = () => {
                image.removeEventListener('load' , done)
                image.removeEventListener('error', done)
                markAssetLoaded()
                resolve()
            }

            image.addEventListener('load' , done)
            image.addEventListener('error', done)
            image.src = src

            if(image.complete) done()
        })
    }

    function preloadAudio(src){
        return new Promise((resolve)=>{
            const audio = new Audio()
            audio.preload = 'auto'

            let finished = false
            const timeoutId= setTimeout(()=>{
                done()
            },7000)

            const done = () =>{
                if(finished) return
                finished = true

                clearTimeout(timeoutId)
                    audio.removeEventListener('canplaythrough' , done)
                    audio.removeEventListener('loadeddata' , done)
                    audio.removeEventListener('error' , done)
                    markAssetLoaded()
                    resolve()
                }

                audio.addEventListener('canplaythrough' , done)
                audio.addEventListener('loadeddata' , done)
                audio.addEventListener('error' , done)
                audio.src = src
                audio.load()
        })
    }

    async function preloadAllAssets(){
        if(state.started) return
        state.started = true 
        state.total = preloadAssets.length
        
        const tasks = preloadAssets.map((src) =>{
            if(/\.(png|jpg|jpeg|gif)$/i.test(src)){
                return preloadImage(src)
            }

            if(/\.(mp3|mpeg|wav|ogg)$/i.test(src)){
                return preloadAudio(src)
            }

            markAssetLoaded()
            return Promise.resolve
        })

        await Promise.all(tasks)
    }

    function drawLoadingScreen( c, baseWidth, baseHeight ) {
        const t = performance.now() / 1000
        const progress = state.total > 0 ? state.loaded / state.total : 0
        const percent = Math.round(progress * 100)


        document.body.style.backgroundColor = '#3f3851'

        c.fillStyle = '#3f3851'
        c.fillRect( 0, 0, baseWidth , baseHeight )

        c.textAlign = 'center'
        c.fillStyle = '#f6dfaf'
        c.font = 'bold 44px Georgia'
        c.fillText('Loading King\'s Labyrinth...', baseWidth / 2 , baseHeight * 0.44)

        const barWidth = 460
        const barHeight = 22
        const barX = (baseWidth = barWidth) / 2
        const barY = baseHeight * 0.52

        c.fillStyle = '#3c3654'
        c.fillRect( barX, barY, barWidth, barHeight )

        const filledWidth = Math.max( 8, barWidth * progress )
        c.fillStyle = '#e8c06e'
        c.fillRect( barX, barY, filledWidth, barHeight)

        c.fillStyle = '#c8dfff'
        c.font = '20px Georgia'
        c.fillText(`${percent}%` , baseWidth / 2 , barY + 56)

        const dots = '.'.repeat((Math.floor(t * 2.5) % 3) + 1)
        c.fillStyle = '#b8acd7'
        c.font = '16px Georgia'
        c.fillText(`please wait ${dots}`, baseWidth / 2 , barY + 84)
    }

    return {
        preloadAllAssets,
        drawLoadingScreen
    }
})()

window.gameAssetLoader = gameAssetLoader