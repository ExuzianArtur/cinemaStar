(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) return;
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) processPreload(link);
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") continue;
      for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
    }
  }).observe(document, {
    childList: true,
    subtree: true
  });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep) return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
document.addEventListener("DOMContentLoaded", function() {
  const contactMainBtn = document.getElementById("contactMainBtn");
  const socialButtons = document.getElementById("socialButtons");
  document.querySelector(".orbit-container");
  contactMainBtn.addEventListener("click", function() {
    this.classList.toggle("active");
    socialButtons.classList.toggle("active");
    this.classList.remove("animate");
  });
  document.addEventListener("click", function(e) {
    if (!contactMainBtn.contains(e.target) && !document.querySelector(".social-btn")?.contains(e.target)) {
      contactMainBtn.classList.remove("active");
      socialButtons.classList.remove("active");
    }
  });
});
document.addEventListener("DOMContentLoaded", function() {
  const burger = document.getElementById("burger");
  const mobileMenu = document.getElementById("mobileMenu");
  const closeBtn = document.getElementById("closeBtn");
  const menuItems = document.querySelectorAll(".mobile-menu__item");
  const social = document.getElementById("social");
  const header = document.getElementById("header");
  const menuLinks = document.querySelectorAll(".mobile-menu__link", ".mobile-social__link");
  burger.addEventListener("click", function() {
    header.classList.add("hidden");
    mobileMenu.classList.add("active");
    menuItems.forEach((item, index) => {
      setTimeout(() => {
        item.classList.add("show");
      }, 150 * index);
    });
    setTimeout(() => {
      social.classList.add("show");
    }, 150 * menuItems.length);
    setTimeout(() => {
      closeBtn.classList.add("show");
    }, 150 * (menuItems.length + 1));
  });
  function closeMenu() {
    closeBtn.classList.remove("show");
    setTimeout(() => {
      social.classList.remove("show");
    }, 150);
    menuItems.forEach((item, index) => {
      setTimeout(() => {
        item.classList.remove("show");
      }, 150 * (menuItems.length - index));
    });
    setTimeout(() => {
      mobileMenu.classList.remove("active");
      header.classList.remove("hidden");
    }, 150 * (menuItems.length + 1));
  }
  closeBtn.addEventListener("click", closeMenu);
  mobileMenu.addEventListener("click", function(e) {
    if (e.target === mobileMenu) {
      closeMenu();
    }
  });
  menuLinks.forEach((link) => {
    link.addEventListener("click", function(e) {
      e.preventDefault();
      console.log(`Клик по элементу: ${this.textContent}`);
      const url = this.getAttribute("href");
      if (url && url !== "#" && url !== "javascript:void(0)") {
        window.open(url, "_blank");
      }
      closeMenu();
    });
  });
});
function getHash() {
  if (location.hash) {
    return location.hash.replace("#", "");
  }
}
let bodyLockStatus = true;
let bodyUnlock = (delay = 500) => {
  if (bodyLockStatus) {
    const lockPaddingElements = document.querySelectorAll("[data-fls-lp]");
    setTimeout(() => {
      lockPaddingElements.forEach((lockPaddingElement) => {
        lockPaddingElement.style.paddingRight = "";
      });
      document.body.style.paddingRight = "";
      document.documentElement.removeAttribute("data-fls-scrolllock");
    }, delay);
    bodyLockStatus = false;
    setTimeout(function() {
      bodyLockStatus = true;
    }, delay);
  }
};
const gotoBlock = (targetBlock, noHeader = false, speed = 500, offsetTop = 0) => {
  const targetBlockElement = document.querySelector(targetBlock);
  if (targetBlockElement) {
    let headerItem = "";
    let headerItemHeight = 0;
    if (noHeader) {
      headerItem = "header.header";
      const headerElement = document.querySelector(headerItem);
      if (!headerElement.classList.contains("--header-scroll")) {
        headerElement.style.cssText = `transition-duration: 0s;`;
        headerElement.classList.add("--header-scroll");
        headerItemHeight = headerElement.offsetHeight;
        headerElement.classList.remove("--header-scroll");
        setTimeout(() => {
          headerElement.style.cssText = ``;
        }, 0);
      } else {
        headerItemHeight = headerElement.offsetHeight;
      }
    }
    if (document.documentElement.hasAttribute("data-fls-menu-open")) {
      bodyUnlock();
      document.documentElement.removeAttribute("data-fls-menu-open");
    }
    let targetBlockElementPosition = targetBlockElement.getBoundingClientRect().top + scrollY;
    targetBlockElementPosition = headerItemHeight ? targetBlockElementPosition - headerItemHeight : targetBlockElementPosition;
    targetBlockElementPosition = offsetTop ? targetBlockElementPosition - offsetTop : targetBlockElementPosition;
    window.scrollTo({
      top: targetBlockElementPosition,
      behavior: "smooth"
    });
  }
};
function pageNavigation() {
  document.addEventListener("click", pageNavigationAction);
  document.addEventListener("watcherCallback", pageNavigationAction);
  function pageNavigationAction(e) {
    if (e.type === "click") {
      const targetElement = e.target;
      if (targetElement.closest("[data-fls-scrollto]")) {
        const gotoLink = targetElement.closest("[data-fls-scrollto]");
        const gotoLinkSelector = gotoLink.dataset.flsScrollto ? gotoLink.dataset.flsScrollto : "";
        const noHeader = gotoLink.hasAttribute("data-fls-scrollto-header") ? true : false;
        const gotoSpeed = gotoLink.dataset.flsScrolltoSpeed ? gotoLink.dataset.flsScrolltoSpeed : 500;
        const offsetTop = gotoLink.dataset.flsScrolltoTop ? parseInt(gotoLink.dataset.flsScrolltoTop) : 0;
        if (window.fullpage) {
          const fullpageSection = document.querySelector(`${gotoLinkSelector}`).closest("[data-fls-fullpage-section]");
          const fullpageSectionId = fullpageSection ? +fullpageSection.dataset.flsFullpageId : null;
          if (fullpageSectionId !== null) {
            window.fullpage.switchingSection(fullpageSectionId);
            if (document.documentElement.hasAttribute("data-fls-menu-open")) {
              bodyUnlock();
              document.documentElement.removeAttribute("data-fls-menu-open");
            }
          }
        } else {
          gotoBlock(gotoLinkSelector, noHeader, gotoSpeed, offsetTop);
        }
        e.preventDefault();
      }
    } else if (e.type === "watcherCallback" && e.detail) {
      const entry = e.detail.entry;
      const targetElement = entry.target;
      if (targetElement.dataset.flsWatcher === "navigator") {
        document.querySelector(`[data-fls-scrollto].--navigator-active`);
        let navigatorCurrentItem;
        if (targetElement.id && document.querySelector(`[data-fls-scrollto="#${targetElement.id}"]`)) {
          navigatorCurrentItem = document.querySelector(`[data-fls-scrollto="#${targetElement.id}"]`);
        } else if (targetElement.classList.length) {
          for (let index = 0; index < targetElement.classList.length; index++) {
            const element = targetElement.classList[index];
            if (document.querySelector(`[data-fls-scrollto=".${element}"]`)) {
              navigatorCurrentItem = document.querySelector(`[data-fls-scrollto=".${element}"]`);
              break;
            }
          }
        }
        if (entry.isIntersecting) {
          navigatorCurrentItem ? navigatorCurrentItem.classList.add("--navigator-active") : null;
        } else {
          navigatorCurrentItem ? navigatorCurrentItem.classList.remove("--navigator-active") : null;
        }
      }
    }
  }
  if (getHash()) {
    let goToHash;
    if (document.querySelector(`#${getHash()}`)) {
      goToHash = `#${getHash()}`;
    } else if (document.querySelector(`.${getHash()}`)) {
      goToHash = `.${getHash()}`;
    }
    goToHash ? gotoBlock(goToHash) : null;
  }
}
document.querySelector("[data-fls-scrollto]") ? window.addEventListener("load", pageNavigation) : null;
document.addEventListener("DOMContentLoaded", function() {
  const scrollToTopButton = document.getElementById("scrollToTop");
  function toggleScrollButton() {
    if (window.scrollY > 300) {
      scrollToTopButton.classList.add("show");
    } else {
      scrollToTopButton.classList.remove("show");
    }
  }
  window.addEventListener("scroll", toggleScrollButton);
  toggleScrollButton();
  scrollToTopButton.addEventListener("click", function() {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
});
document.addEventListener("DOMContentLoaded", function() {
  const parallaxText = document.getElementById("parallaxText");
  const heroSection = document.querySelector(".hero");
  heroSection.addEventListener("mousemove", (e) => {
    const xAxis = (window.innerWidth / 2 - e.pageX) / 50;
    const yAxis = (window.innerHeight / 2 - e.pageY) / 50;
    parallaxText.style.transform = `translate(${xAxis}px, ${yAxis}px)`;
  });
  heroSection.addEventListener("mouseleave", () => {
    parallaxText.style.transform = "translate(0px, 0px)";
  });
});
document.addEventListener("DOMContentLoaded", function() {
  const slides = document.querySelectorAll(".about__image-slide");
  let currentSlide = 0;
  function showSlide(index) {
    slides[currentSlide].classList.remove("active");
    currentSlide = index;
    slides[currentSlide].classList.add("active");
  }
  setInterval(() => {
    let nextSlide = (currentSlide + 1) % slides.length;
    showSlide(nextSlide);
  }, 5e3);
});
document.addEventListener("DOMContentLoaded", function() {
  const sectionTitles = document.querySelectorAll(".section__title");
  function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    return rect.top <= windowHeight * 0.9 && rect.bottom >= windowHeight * 0.1;
  }
  function handleScroll() {
    sectionTitles.forEach((title) => {
      if (isElementInViewport(title)) {
        title.classList.add("active");
      } else {
        title.classList.remove("active");
      }
    });
  }
  window.addEventListener("scroll", handleScroll);
  handleScroll();
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach((link) => {
    link.addEventListener("click", function(e) {
      e.preventDefault();
      const targetId = this.getAttribute("href");
      const targetSection = document.querySelector(targetId);
      window.scrollTo({
        top: targetSection.offsetTop,
        behavior: "smooth"
      });
    });
  });
});
document.addEventListener("DOMContentLoaded", function() {
  const movies = [
    {
      id: 1,
      title: "Аватар: Путь воды",
      genre: "Фантастика",
      duration: "3ч 12мин",
      description: "Сиквел фильма 'Аватар' рассказывает о новых приключениях Джейка Салли и Нейтири на подводном мире Пандоры. После событий первой части, Джейк стал лидером клана оматикайя, и вместе с Нейтири основал семью. Однако их спокойной жизни угрожает опасность, и они вынуждены покинуть родные леса и отправиться в морские глубины Пандоры, где им предстоит вступить в конфликт с новым человеческим вторжением.",
      image: "/assets/img/films/1.jpg",
      schedule: [
        { time: "10:30", hall: "Зал 1", price: "500 ₽" },
        { time: "14:15", hall: "Зал 2", price: "550 ₽" },
        { time: "18:00", hall: "Зал 3", price: "600 ₽" },
        { time: "21:45", hall: "Зал 1", price: "650 ₽" }
      ]
    },
    {
      id: 2,
      title: "Черная Пантера: Ваканда навеки",
      genre: "Боевик",
      duration: "2ч 41мин",
      description: "Король Т'Чалла и народ Ваканды сражаются за свою страну после смерти любимого монарха. В центре сюжета - борьба за право наследования трона Ваканды. В то время как жители пяти кланов Ваканды оплакивают смерть своего короля, вокруг них сгущаются тучи. Из-за того, что секрет технологии вибраниума стал известен остальному миру, в Ваканду приходят враги со всего земного шара.",
      image: "/assets/img/films/2.jpg",
      schedule: [
        { time: "11:00", hall: "Зал 2", price: "500 ₽" },
        { time: "15:30", hall: "Зал 1", price: "550 ₽" },
        { time: "19:15", hall: "Зал 3", price: "600 ₽" },
        { time: "23:00", hall: "Зал 2", price: "650 ₽" }
      ]
    },
    {
      id: 3,
      title: "Оппенгеймер",
      genre: "Драма",
      duration: "3ч 00мин",
      description: "Биографическая драма о создателе атомной бомбы Роберте Оппенгеймере и его моральных терзаниях. Фильм рассказывает историю жизни американского физика Дж. Роберта Оппенгеймера, который возглавлял曼хэттенский проект по созданию атомной бомбы во время Второй мировой войны. Картина исследует внутренние конфликты ученого, его политические взгляды и последствия создания оружия массового поражения.",
      image: "/assets/img/films/3.jpg",
      schedule: [
        { time: "12:15", hall: "Зал 3", price: "500 ₽" },
        { time: "16:45", hall: "Зал 1", price: "550 ₽" },
        { time: "20:30", hall: "Зал 2", price: "600 ₽" },
        { time: "00:15", hall: "Зал 3", price: "650 ₽" }
      ]
    }
  ];
  const carousel = document.getElementById("carousel");
  const mobileTrack = document.getElementById("mobileTrack");
  const pagination = document.getElementById("pagination");
  const movieBackground = document.getElementById("movieBackground");
  const movieModal = document.getElementById("movieModal");
  const modalClose = document.getElementById("modalClose");
  const movieModalMobile = document.getElementById("movieModalMobile");
  const modalMobileClose = document.getElementById("modalMobileClose");
  let currentIndex = 0;
  let startX = 0;
  let endX = 0;
  function createDesktopCards() {
    movies.forEach((movie) => {
      const movieCard = document.createElement("div");
      movieCard.className = "movie-card";
      movieCard.dataset.movie = movie.id;
      movieCard.innerHTML = `
                      <article class="movie-card">
                        <img src="${movie.image}" alt="${movie.title}" class="movie-card__image">
                        <div class="movie-card__content">
                            <h3 class="movie-card__title">${movie.title}</h3>
                            <div class="movie-card__info">
                                <span class="movie-card__genre">${movie.genre}</span>
                                <span class="movie-card__duration">${movie.duration}</span>
                            </div>
                            <p class="movie-card__description">${movie.description}</p>
                        </div>
                      </article>
                    `;
      movieCard.addEventListener("mouseenter", function() {
        movieBackground.src = movie.image;
        movieBackground.classList.add("active");
      });
      movieCard.addEventListener("mouseleave", function() {
        movieBackground.classList.remove("active");
      });
      movieCard.addEventListener("click", function() {
        openModal(movie);
      });
      carousel.appendChild(movieCard);
    });
  }
  function createMobileCards() {
    movies.forEach((movie) => {
      const mobileSlide = document.createElement("div");
      mobileSlide.className = "mobile-slide";
      mobileSlide.innerHTML = `
                        <article class="mobile-card" data-movie="${movie.id}">
                            <img src="${movie.image}" alt="${movie.title}" class="mobile-card__image">
                            <div class="mobile-card__content">
                                <h3 class="mobile-card__title">${movie.title}</h3>
                                <div class="mobile-card__info">
                                    <span class="mobile-card__genre">${movie.genre}</span>
                                    <span class="mobile-card__duration">${movie.duration}</span>
                                </div>
                                <p class="mobile-card__description">${movie.description}</p>
                            </div>
                        </article>
                    `;
      mobileTrack.appendChild(mobileSlide);
    });
    movies.forEach((_, index) => {
      const dot = document.createElement("div");
      dot.className = "pagination-dot";
      if (index === 0) dot.classList.add("active");
      dot.dataset.index = index;
      dot.addEventListener("click", function() {
        currentIndex = parseInt(this.dataset.index);
        updateMobileSlider();
      });
      pagination.appendChild(dot);
    });
    mobileTrack.addEventListener("touchstart", handleTouchStart, false);
    mobileTrack.addEventListener("touchmove", handleTouchMove, false);
    mobileTrack.addEventListener("touchend", handleTouchEnd, false);
    const mobileCards = document.querySelectorAll(".mobile-card");
    mobileCards.forEach((card) => {
      card.addEventListener("click", function() {
        const movieId = parseInt(this.dataset.movie);
        const movie = movies.find((m) => m.id === movieId);
        if (movie) {
          openMobileModal(movie);
        }
      });
    });
  }
  function handleTouchStart(e) {
    startX = e.touches[0].clientX;
  }
  function handleTouchMove(e) {
    endX = e.touches[0].clientX;
  }
  function handleTouchEnd() {
    const diff = startX - endX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        if (currentIndex < movies.length - 1) {
          currentIndex++;
          updateMobileSlider();
        }
      } else {
        if (currentIndex > 0) {
          currentIndex--;
          updateMobileSlider();
        }
      }
    }
  }
  function updateMobileSlider() {
    const translateX = -currentIndex * 100;
    mobileTrack.style.transform = `translateX(${translateX}%)`;
    const dots = document.querySelectorAll(".pagination-dot");
    dots.forEach((dot, index) => {
      if (index === currentIndex) {
        dot.classList.add("active");
      } else {
        dot.classList.remove("active");
      }
    });
    const currentMovie = movies[currentIndex];
    if (currentMovie) {
      movieBackground.src = currentMovie.image;
      movieBackground.classList.add("active");
    }
  }
  function openModal(movie) {
    document.getElementById("modalImage").src = movie.image;
    document.getElementById("modalImage").alt = movie.title;
    document.getElementById("modalTitle").textContent = movie.title;
    document.getElementById("modalGenre").textContent = movie.genre;
    document.getElementById("modalDuration").textContent = movie.duration;
    document.getElementById("modalDescription").textContent = movie.description;
    const scheduleList = document.getElementById("scheduleList");
    scheduleList.innerHTML = "";
    movie.schedule.forEach((session) => {
      const scheduleItem = document.createElement("div");
      scheduleItem.className = "schedule__item";
      scheduleItem.innerHTML = `
                        <div class="schedule__time">${session.time}</div>
                        <div class="schedule__price">${session.price}</div>
                    `;
      scheduleList.appendChild(scheduleItem);
    });
    movieModal.classList.add("active");
    document.body.style.overflow = "hidden";
  }
  function openMobileModal(movie) {
    document.getElementById("modalMobileTitle").textContent = movie.title;
    document.getElementById("modalMobileInfo").textContent = `${movie.genre}, ${movie.duration}`;
    const mobileScheduleList = document.getElementById("mobileScheduleList");
    mobileScheduleList.innerHTML = "";
    movie.schedule.forEach((session) => {
      const scheduleItem = document.createElement("div");
      scheduleItem.className = "modal-mobile__schedule-item";
      scheduleItem.innerHTML = `
                        <div class="modal-mobile__schedule-time">${session.time}</div>
                        <div class="modal-mobile__schedule-price">${session.price}</div>
                    `;
      mobileScheduleList.appendChild(scheduleItem);
    });
    movieModalMobile.classList.add("active");
    document.body.style.overflow = "hidden";
  }
  modalClose.addEventListener("click", function() {
    movieModal.classList.remove("active");
    document.body.style.overflow = "auto";
  });
  movieModal.addEventListener("click", function(e) {
    if (e.target === movieModal) {
      movieModal.classList.remove("active");
      document.body.style.overflow = "auto";
    }
  });
  modalMobileClose.addEventListener("click", function() {
    movieModalMobile.classList.remove("active");
    document.body.style.overflow = "auto";
  });
  movieModalMobile.addEventListener("click", function(e) {
    if (e.target === movieModalMobile) {
      movieModalMobile.classList.remove("active");
      document.body.style.overflow = "auto";
    }
  });
  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape") {
      if (movieModal.classList.contains("active")) {
        movieModal.classList.remove("active");
        document.body.style.overflow = "auto";
      }
      if (movieModalMobile.classList.contains("active")) {
        movieModalMobile.classList.remove("active");
        document.body.style.overflow = "auto";
      }
    }
  });
  createDesktopCards();
  createMobileCards();
  updateMobileSlider();
});
document.addEventListener("DOMContentLoaded", function() {
  const tabs = document.querySelectorAll(".tab");
  const contents = document.querySelectorAll(".schedule__content");
  tabs.forEach((tab) => {
    tab.addEventListener("click", function() {
      const day = this.getAttribute("data-day");
      tabs.forEach((t) => t.classList.remove("active"));
      contents.forEach((c) => c.classList.remove("active"));
      this.classList.add("active");
      document.getElementById(day).classList.add("active");
    });
  });
  const timeSlots = document.querySelectorAll(".movie-item__time span");
  timeSlots.forEach((slot) => {
    slot.addEventListener("click", function() {
      timeSlots.forEach((s) => s.classList.remove("active"));
      this.classList.add("active");
      console.log(`Выбран сеанс: ${this.textContent}`);
    });
  });
});
document.addEventListener("DOMContentLoaded", function() {
  let mapInstance = null;
  let placemarkInstance = null;
  function initMap(lat = 43.908284, lon = 39.332456) {
    const coordinates = [lat, lon];
    if (mapInstance) {
      mapInstance.setCenter(coordinates);
      if (placemarkInstance) {
        placemarkInstance.geometry.setCoordinates(coordinates);
      }
      return;
    }
    mapInstance = new ymaps.Map("map", {
      center: coordinates,
      zoom: 16,
      controls: ["zoomControl", "fullscreenControl"]
    });
    placemarkInstance = new ymaps.Placemark(coordinates, {
      balloonContent: "<strong>Кинотеатр CinemaStar 3D</strong><br>354200, г. Сочи, Лазаревское, ул. Победы, 31<br>Тел: +7(918) 614-28-28"
    }, {
      preset: "islands#violetIcon",
      iconColor: "#8a2be2"
    });
    mapInstance.geoObjects.add(placemarkInstance);
    placemarkInstance.events.add("click", function() {
      placemarkInstance.balloon.open();
    });
  }
  function loadYandexMap() {
    const script = document.createElement("script");
    script.src = "https://api-maps.yandex.ru/2.1/?apikey=YOUR_API_KEY&lang=ru_RU";
    script.onload = function() {
      ymaps.ready(() => initMap());
    };
    script.onerror = function() {
      document.getElementById("map").innerHTML = `
                        <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: linear-gradient(45deg, #1a001a, #2a002a); color: #8a2be2; text-align: center; padding: 20px;">
                            <div>
                                <i class="fas fa-map-marker-alt" style="font-size: 3rem; margin-bottom: 20px;"></i>
                                <h3 style="font-size: 1.5rem; margin-bottom: 15px;">Карта Яндекс</h3>
                                <p>354200, г. Сочи, Лазаревское, ул. Победы, 31</p>
                                <p style="margin-top: 15px; font-size: 0.9rem; color: #b0b0b0;">
                                    Для отображения карты необходим API ключ Яндекс Карт
                                </p>
                            </div>
                        </div>
                    `;
    };
    document.head.appendChild(script);
  }
  document.getElementById("updateMapBtn").addEventListener("click", function() {
    const latInput = document.getElementById("latitude");
    const lonInput = document.getElementById("longitude");
    const lat = parseFloat(latInput.value);
    const lon = parseFloat(lonInput.value);
    if (isNaN(lat) || isNaN(lon)) {
      alert("Пожалуйста, введите корректные числовые значения координат");
      return;
    }
    if (lat < -90 || lat > 90) {
      alert("Широта должна быть в диапазоне от -90 до 90");
      return;
    }
    if (lon < -180 || lon > 180) {
      alert("Долгота должна быть в диапазоне от -180 до 180");
      return;
    }
    if (typeof ymaps !== "undefined" && ymaps.ready) {
      initMap(lat, lon);
    } else {
      alert("API Яндекс Карт еще не загружен. Попробуйте позже.");
    }
  });
  loadYandexMap();
});
document.addEventListener("DOMContentLoaded", function() {
  const feedbackForm = document.getElementById("feedbackForm");
  const formMessage = document.getElementById("formMessage");
  feedbackForm.addEventListener("submit", function(e) {
    e.preventDefault();
    const formData = new FormData(feedbackForm);
    const data = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });
    if (!validateForm(data)) {
      return;
    }
    submitForm();
  });
  function validateForm(data) {
    if (!data.name || !data.email || !data.message) {
      showMessage("Пожалуйста, заполните все обязательные поля", "error");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      showMessage("Пожалуйста, введите корректный email адрес", "error");
      return false;
    }
    if (data.message.length < 10) {
      showMessage("Сообщение должно содержать минимум 10 символов", "error");
      return false;
    }
    return true;
  }
  function submitForm(data) {
    const submitBtn = feedbackForm.querySelector(".btn");
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Отправка...";
    setTimeout(() => {
      showMessage("Сообщение успешно отправлено! Мы свяжемся с вами в ближайшее время.", "success");
      feedbackForm.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }, 2e3);
  }
  function showMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = "form-message " + type;
    setTimeout(() => {
      formMessage.className = "form-message";
    }, 5e3);
  }
  const phoneInput = document.getElementById("phone");
  phoneInput.addEventListener("input", function(e) {
    let value = e.target.value.replace(/\D/g, "");
    if (value.startsWith("7") || value.startsWith("8")) {
      value = value.substring(1);
    }
    if (value.length > 10) {
      value = value.substring(0, 10);
    }
    let formattedValue = "+7";
    if (value.length > 0) {
      formattedValue += " (" + value.substring(0, 3);
    }
    if (value.length > 3) {
      formattedValue += ") " + value.substring(3, 6);
    }
    if (value.length > 6) {
      formattedValue += "-" + value.substring(6, 8);
    }
    if (value.length > 8) {
      formattedValue += "-" + value.substring(8, 10);
    }
    e.target.value = formattedValue;
  });
});
