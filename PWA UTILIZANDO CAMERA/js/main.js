if ('serviceWorker' in navigator) {
    window.addEventListener('load', async() => {
        try{
            let reg;
            reg - await navigator.serviceWorker.register('/sw.js', {type: "module"});

            console.log('Sevive worker registrada! 😊', reg);
        } catch (err){
            console.log ('😒 Service worker registro falhou:', err);
        }
    });
}