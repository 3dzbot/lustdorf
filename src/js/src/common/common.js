"use strict"
window.addEventListener("DOMContentLoaded", () => {

	let coursesList;
	let winWidth;

	function testWebP(callback) {
		var webP = new Image();
		webP.onload = webP.onerror = function () {
			callback(webP.height == 2);
		};
		webP.src =
		 "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
	}

	testWebP(function (support) {
		if (support == true) {
			document.querySelector("body").classList.add("webp");
		} else {
			document.querySelector("body").classList.add("no-webp");
		}
	});

	let mainGalleryThumbs = new Swiper('.gallery-thumbs', {
		spaceBetween: 0,
		slidesPerView: 4,
		// loop: true,
		freeMode: true,
		loopedSlides: 5, //looped slides should be the same
		watchSlidesVisibility: true,
		watchSlidesProgress: true,
	});
	let mainGalleryTop = new Swiper('.gallery-top', {
		spaceBetween: 0,
		// loop: true,
		loopedSlides: 5, //looped slides should be the same
		navigation: {
			nextEl: '.swiper-button-next',
			prevEl: '.swiper-button-prev',
		},
		thumbs: {
			swiper: mainGalleryThumbs,
		},
	});

	let coursesBtns = document.querySelectorAll('.courses__header-item');

	if(!!coursesBtns.length) {
		coursesList = document.querySelectorAll('.courses .courses__column');

		coursesBtns.forEach(function(item){
			item.addEventListener('click', function(e) {
				if (this.tagName !== "BUTTON") return false;

				coursesBtns.forEach(item => {
					item.classList.remove('active');
				})
				this.classList.add('active');
				let filterClass = e.target.dataset["filter"];

				coursesList.forEach(elem => {
					elem.classList.remove("hide-tab__item");
					if (!elem.classList.contains(filterClass) && filterClass !== "all") {
						elem.classList.add("hide-tab__item");
					}
				})
			})
		})
	}

	const mobileMenu = document.querySelector('.mobile-menu'),
		  popUp = document.querySelector('.pop-up'),
	 	  burger = document.querySelector('.burger__mobile'),
	 	  mobileMenuClose = document.querySelector('.mobile-menu .close');

	function showMobileMenu(){
		showPopUpBg();
		mobileMenu.classList.add('active');
	}

	function showPopUpBg() {
		document.body.classList.add('hidden-body');
		popUp.classList.add('active');
	}

	function hideMobileMenu() {
		hidePopUpBg();
		mobileMenu.classList.remove('active');
	}

	function hidePopups() {
		hideMobileMenu();
	}
	function hidePopUpBg() {
		document.body.classList.remove('hidden-body');
		popUp.classList.remove('active');
	}

	//ajax
	function req() {
		let dbUrl = location.href + 'db/db.json';
		getResource(`${dbUrl}`)
		 .then(data => createCard(data))
		 .catch(err => console.error(err));

		this.remove();
	}

	function createCard(data){
		data.courses.forEach(item => {

			const {bottom_text, course_type, courses_name, link, photo, price_current, price_old, promo, subtitle, title} = item;
			let card = document.createElement('a');
			card.classList.add('courses__column');
			card.setAttribute('data-filter', course_type);
			card.setAttribute('target', '_blank');
			card.setAttribute('href', link);

			if(course_type.length > 2 ) {
				card.classList.add(`${course_type}`);
			}
			card.innerHTML = `
				<div class="courses__column-item">
 					<div class="courses__column-header">
 						${!!promo.length ? `<div class="courses__column-promo">${promo}</div>` : ''}
						<div class="courses__column-img">
							<img src="${photo}" alt="${title}">
						</div>
					</div>
					<div class="courses__column-subtitle">${subtitle}</div>
						<h3 class="courses__column-title">${title}</h3>
						<div class="courses__column-bottom">
							<div class="price">
							${!!price_old.length ? `<div class="old"><del>${price_old}₴</del></div>` : ''}

								<div class="current">${price_current}₴ <sub>/мес.</sub></div>
							</div>
						<div class="text">${bottom_text}</div>
					</div>
				</div>
			`;
			document.querySelector('.courses .courses__list').appendChild(card);
		})
		coursesList = document.querySelectorAll('.courses .courses__column');
		coursesCount();
	}

	async function getResource(url) {
		const res = await fetch(`${url}`);

		if(!res.ok){
			throw new Error(`could not fetch ${url} status: ${res.status}`);
		}
		return await res.json();
	}

	document.querySelector('.courses-load-more').addEventListener('click', req, {'once': true});

	let courseCount = 6;
	let coursesType = [];
	let allCoursesCardType = [];

	function coursesCount() {
		let coursesHeaderBtns = document.querySelectorAll('.courses .courses__header button');
		coursesHeaderBtns.forEach(btn => {
			let btnClass = btn.dataset["filter"];
			if(btn.dataset["filter"] == 'all'){
				btn.querySelector('sup').textContent = coursesList.length;
			}
			if(!coursesType.includes(btnClass)){
				coursesType.push(btnClass);
			}
		})
		addSupCount(coursesType, coursesHeaderBtns, coursesList);
	}
	coursesCount();

	function addSupCount(arrClass, btnArray, arrCourses){
		allCoursesCardType = [];
		arrCourses.forEach(card => {
			allCoursesCardType.push(card.dataset["filter"]);
		})
		btnArray.forEach(btn=>{
			let filterName = btn.dataset["filter"];
			if( filterName !== 'all'){
				let btnCount = allCoursesCardType.filter(x => x === filterName).length;
				btn.querySelector('sup').textContent = btnCount;
			}

		})
		// allCoursesCardType.filter(x => x === 2).length
	}

	let swiperReview = new Swiper('.review .swiper-container', {
		slidesPerView: 3,
		spaceBetween: 60,
		// loop: true,
		// autoplay: {
		// 	delay: 5000,
		// },
		pagination: {
			el: '.review .swiper-pagination',
			clickable: true
		},
		breakpoints: {
			1268: {
				slidesPerView: 3,
				spaceBetween: 60
			},
			1168: {
				slidesPerView: 3,
				spaceBetween: 30
			},
			767: {
				slidesPerView: 2,
				spaceBetween: 60
			},
			700: {
				slidesPerView: 2,
				spaceBetween: 30
			},
			320: {
				slidesPerView: 1,
				spaceBetween: 30
			}
		}
	});

	mobileMenuClose.addEventListener('click', hidePopups);
	burger.addEventListener('click', showMobileMenu);
	popUp.addEventListener('click', hidePopups);


});
