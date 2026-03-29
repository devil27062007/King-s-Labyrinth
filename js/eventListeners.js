window.addEventListener('keydown' , (event) =>{
    switch(event.key){
        case 'w' :
            if(player.velocity.y === 0) player.velocity.y = -20 

            break
        case 'a' :
            //left moving
            keys.a.pressed = true 
            break
        case 'd' :
            //right moving
            keys.d.pressed = true
            break
    }
})

window.addEventListener('keyup' , (event) =>{
    switch (event.key){
        case 'a' :
            //move left
            keys.a.pressed = false

            break
        case 'd' :
            //move right
            keys.d.pressed = false 

            break
            
    }
})