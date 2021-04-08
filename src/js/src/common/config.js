let scrollEventListenerThirdArgument = false;
(() => {
    try {
        let options = Object.defineProperty({}, "passive", {
            get: () => {
                scrollEventListenerThirdArgument = {passive: true};
            }
        });
        window.addEventListener("test", null, options);
    } catch(err) {}
})();

const MOBILE_MAX_WIDTH  = 768;
const ANIMATION_STEP = 150;
/*
const sliderArrows = {
    prevArrow: '<div class="slider-arrow slider-arrow-prev"></div>',
    nextArrow: '<div class="slider-arrow slider-arrow-next"></div>',
};


let windowWidth = window.innerWidth;
let windowHeight = window.innerHeight;
window.addEventListener('resize', () => {
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;    
});
*/
