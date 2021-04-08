// https://developer.mozilla.org/en-US/docs/Web/API/Element/closest
if (!Element.prototype.matches)
    Element.prototype.matches = Element.prototype.msMatchesSelector ||
        Element.prototype.webkitMatchesSelector;

if (!Element.prototype.closest) {
    Element.prototype.closest = function (s) {
        let el = this;
        if (!document.documentElement.contains(el)) return null;
        do {
            if (el.matches(s)) return el;
            el = el.parentElement || el.parentNode;
        } while (el !== null && el.nodeType === 1);
        return null;
    };
}

const pageScrollState = (() => {
    let pageScrollPosition = 0;
    const fix = () => {
        if(!document.body.parentElement.classList.contains('fixed')){
            pageScrollPosition = window.scrollY;
            document.body.parentNode.classList.add('fixed');
            document.body.scrollTop = pageScrollPosition;
        }
    };
    const unfix = () => {
        if(document.body.parentElement.classList.contains('fixed')) {
            document.body.parentNode.classList.remove('fixed');
            window.scrollTo(0, pageScrollPosition);
        }
    };
    const toggle = () => {
        document.body.parentNode.classList.contains('fixed') ? unfix() : fix();
    };
    const set = (position) => {
        window.scrollTo(0, position);
    };
    return {
        fix,
        unfix,
        toggle,
        set,
    };
})();

const Convert = {
    nodeListToArray: nodeList => Array.prototype.slice.call(nodeList),
    toIntOrZero: val => parseInt(val) || 0,
    toFloatOrZero: val => parseFloat(val) || 0
};

const querySelectorAsArray = (selector, context = document) => Array.prototype.slice.call(context.querySelectorAll(selector));

const isDesktop = () => window.innerWidth > MOBILE_MAX_WIDTH;
const isMobile = () => !isDesktop();

const on = (elements, event, callback) => {
    if(typeof elements === 'string'){
        elements = querySelectorAsArray(elements);
    }else if(elements instanceof NodeList){
        elements = Array.prototype.slice.call(elements);
    }
    elements.forEach(function (item) {
        item.addEventListener(event, callback);
    });
};

// const emailRegExp = () => /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
//допускаем любую почту. главное что б была @ и точка
const emailRegExp = () => /^\S+@\w+\.\S+$/;

const emailValid = email => emailRegExp().test(email);

const phoneInputFilterRegExp = () => /[\d+() -]/;

const isInputFilled = input => input.value.trim() !== '';

const isInputValid = input => {
    if(input.type.toLowerCase() === "email"){
        return input.value !== '' && emailRegExp().test(input.value);
    }else{
        return input.value !== '' && input.validity.valid;
    }
};

const setupPhoneInputFilter = () => {
    on('input[type="tel"]', 'keypress', (e) => {
        const target = e.target;

        if(target.value.length > 17){
            target.value = target.value.substr(0, 16);
            return false;
        }

        if (target.tagName.toUpperCase() === 'INPUT'){
            const code = e.which;
            if (code<32 || e.ctrlKey || e.altKey) return true;

            const char = String.fromCharCode(code);
            if (!phoneInputFilterRegExp().test(char)){
                e.preventDefault();
                return false;
            }
        }
        return true;
    });
};

const scrollToElement = (element, duration = 1000) => {
    if(typeof element === 'string'){
        element = document.querySelector(element);
    }
    let endScrollPosition = element.offsetTop;
    while(element.tagName.toLowerCase() !== 'body'){
        element = element.parentElement;
        endScrollPosition += element.offsetTop;
    }
    const startScrollPosition = window.scrollY;
    const start = performance.now();

    const scrollStep = (endScrollPosition - startScrollPosition)/duration;
    let currentScrollPosition;

    requestAnimationFrame(function doScrollStep(time) {
        let timePassed = time - start;
        if (timePassed > duration) timePassed = duration;

        if(timePassed === duration){
            currentScrollPosition = endScrollPosition;
        }else{
            currentScrollPosition = startScrollPosition + scrollStep * timePassed;
        }
        window.scrollTo(0, currentScrollPosition);

        if (timePassed < duration) {
            requestAnimationFrame(doScrollStep);
        }
    });
};

/**
 * @param elements
 *   массив или массивоподобный объект с элементами для анимации
 *
 * @param animationStep
 *   задержка между стартами анимации элементов
 *   
 * Элемент с классом animate-with-prev-element будет анимироваться вместе с предидущим
**/
const animateElements = (elements, animationStep = ANIMATION_STEP) => {
    let index = 0;
    Array.prototype.forEach.call(elements, item => {
        if(!item.classList.contains('animate-with-prev-element')){
            ++index;
        }
        setTimeout(() => {
            item.classList.remove('unanimated');
            item.classList.add('animated');
        }, animationStep * index);
    });
};

const isClickFromKeyboard = mouseClickEvent => {
    if(!mouseClickEvent.type || mouseClickEvent.type.toLowerCase() !== 'click'){
        throw new Error('Wrong event type!');
    }
    return mouseClickEvent.clientX === 0 && mouseClickEvent.clientY === 0;
};

class StepByStepAnimation{
    constructor(){
        this.steps = [];
    }
    addStep(cb, timeout){
        this.steps.push({cb, timeout});
        return this;
    }
    run(){
        this.steps.reduce((p, step) => {
                return p.then(() => new Promise(resolve => {
                    setTimeout(() => {
                        step.cb();
                        resolve();
                    }, step.timeout);
                }))
            }
            , Promise.resolve());
    }
}

const scrollBlocksAnimation = (() => {
    let scrollAnimatedBlocks;

    const setupData = () => {
        scrollAnimatedBlocks = querySelectorAsArray('.animate-on-scroll');
    };

    const run = () => {
        let offset = window.innerHeight * 0.8;
        if(scrollAnimatedBlocks.length === 0) return;
        scrollAnimatedBlocks.forEach( block => {
            if(block.classList.contains('animated')) return;

            if(block.dataset.startAnimationOffsetCoefficient){
                offset = window.innerHeight * block.dataset.startAnimationOffsetCoefficient;
            }
            const blockRect = block.getBoundingClientRect();
            if(blockRect.top < 0 && blockRect.top < -blockRect.height) return;
            if(blockRect.top - offset < 0){
                setTimeout(function () {
                    if(block.dataset.animationCallBack){
                        window[block.dataset.animationCallBack]();
                    }else{
                        if(!block.classList.contains('do-not-add-class-animated')){
                            block.classList.add('animated');
                        }
                        if(block.classList.contains('animate-by-elements')) {
                            animateElements(block.querySelectorAll('.block-animation-element'), block.dataset.animationDuration);
                        }
                    }
                }, Convert.toIntOrZero(block.dataset.animationDelay));
            }
        });
        scrollAnimatedBlocks = scrollAnimatedBlocks.filter(block => !block.classList.contains('animated') );
    };

    const refresh = () => {
        setupData();
        run();
    };

    const init = () => {
        setupData();
        run();
        window.addEventListener('scroll', run, scrollEventListenerThirdArgument);
        window.addEventListener('resize', run);
    };

    return{
        init,
        refresh,
    }
})();
/*
const findGetParameter = parameterName => {
    const items = location.search.substr(1).split("&");
    for (let index = 0; index < items.length; index++) {
        const tmp = items[index].split("=");
        if (tmp[0] === parameterName) return decodeURIComponent(tmp[1]);
    }
    return null;
};

const numberWithSpaces = num=>num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
*/
