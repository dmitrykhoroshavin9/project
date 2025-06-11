 /**
 * @file script.js
 * @description Основной JavaScript файл для интерактивности сайта.
 *              Содержит логику для мобильного меню, активной навигации,
 *              кнопки "Наверх", предзагрузчика, Swiper-галереи,
 *              динамической загрузки контента из JSON, работы с LocalStorage для формы,
 *              и запуска анимаций при скролле (Intersection Observer).
 */

document.addEventListener('DOMContentLoaded', () => {

    // ===============================================
    // 1. Предзагрузчик страницы (Preloader)
    // Алгоритм:
    //  - При полной загрузке страницы (событие 'load' на window)
    //  - Добавляем класс 'preloader--hidden' к элементу предзагрузчика, делая его прозрачным и невидимым.
    //  - Через небольшую задержку (для завершения анимации исчезновения) удаляем сам элемент из DOM.
    // Переменные:
    //  - preloader: DOM-элемент предзагрузчика.
    // ===============================================
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        // Устанавливаем минимальную задержку, чтобы анимация прелоадера успела показаться
        const minDisplayTime = 1000; // 1 секунда
        const startTime = Date.now();

        window.addEventListener('load', () => {
            const elapsedTime = Date.now() - startTime;
            const remainingTime = elapsedTime < minDisplayTime ? minDisplayTime - elapsedTime : 0;

            setTimeout(() => {
                preloader.classList.add('preloader--hidden');
                setTimeout(() => {
                    preloader.remove();
                }, 500); // Соответствует времени перехода opacity в CSS
            }, remainingTime);
        });
    }

    // ===============================================
    // 2. Инициализация Swiper для галереи
    // ===============================================
    const swiperElement = document.querySelector('.gallery__swiper');
    if (swiperElement) {
        console.log('Инициализация Swiper...');
        const swiper = new Swiper(swiperElement, {
            loop: true,
            effect: 'slide',
            speed: 800,
            autoplay: {
                delay: 4000,
                disableOnInteraction: false,
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            breakpoints: {
                768: {
                    slidesPerView: 1,
                    spaceBetween: 0,
                },
                1024: {
                    slidesPerView: 1,
                    spaceBetween: 0,
                }
            }
        });
        console.log('Swiper инициализирован успешно.', swiper);
    }

    // ===============================================
    // 3. Логика для мобильного меню (бургер-меню)
    // ===============================================
    const navToggle = document.querySelector('.nav__toggle');
    const headerNav = document.querySelector('.header__nav');
    const navLinks = document.querySelectorAll('.nav__link');

    if (navToggle && headerNav) {
        navToggle.addEventListener('click', () => {
            headerNav.classList.toggle('header__nav--open');
            navToggle.classList.toggle('nav__toggle--open');
            if (headerNav.classList.contains('header__nav--open')) {
                document.body.style.overflow = 'hidden';
                console.log('Мобильное меню открыто, скролл заблокирован.');
            } else {
                document.body.style.overflow = '';
                console.log('Мобильное меню закрыто, скролл разблокирован.');
            }
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (headerNav.classList.contains('header__nav--open')) {
                    headerNav.classList.remove('header__nav--open');
                    navToggle.classList.remove('nav__toggle--open');
                    document.body.style.overflow = '';
                    console.log('Ссылка в меню кликнута, меню закрыто.');
                }
            });
        });
    }

    // ===============================================
    // 4. Активная ссылка навигации при прокрутке
    // ===============================================
    const sections = document.querySelectorAll('.section');
    const header = document.querySelector('.header');
    let headerHeight = header ? header.offsetHeight : 0;

    window.addEventListener('resize', () => {
        headerHeight = header ? header.offsetHeight : 0;
        activateNavLink();
    });

    function activateNavLink() {
        let currentActiveSectionId = '';
        const scrollPos = window.pageYOffset;

        sections.forEach(section => {
            if (!section.getAttribute('id')) {
                return;
            }

            const sectionTop = section.offsetTop - headerHeight - 50;
            const sectionBottom = sectionTop + section.offsetHeight;

            if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
                currentActiveSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('nav__link--active');
            if (currentActiveSectionId && link.getAttribute('href') && link.getAttribute('href').includes(currentActiveSectionId)) {
                link.classList.add('nav__link--active');
            }
        });
    }

    window.addEventListener('scroll', activateNavLink);
    activateNavLink();

    // ===============================================
    // 5. Кнопка "Наверх" (Scroll-to-Top Button)
    // ===============================================
    const scrollTopButton = document.querySelector('.scroll-top-button');

    if (scrollTopButton) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 200) {
                scrollTopButton.classList.add('scroll-top-button--visible');
                console.log('Кнопка "Наверх" видима.');
            } else {
                scrollTopButton.classList.remove('scroll-top-button--visible');
                console.log('Кнопка "Наверх" скрыта.');
            }
        });

        scrollTopButton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            console.log('Кнопка "Наверх" кликнута, прокрутка.');
        });
    }

    // ===============================================
    // 6. Динамическая загрузка "Рекомендуемой литературы" из JSON
    // ===============================================
    const recommendedReadingsGrid = document.querySelector('.recommended-readings__grid');
    const loadingMessage = recommendedReadingsGrid ? recommendedReadingsGrid.querySelector('.recommended-readings__loading-message') : null;
    const dataUrl = 'data.json';

    if (recommendedReadingsGrid) {
        fetch(dataUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(booksData => {
                if (loadingMessage) {
                    loadingMessage.remove();
                }

                if (Array.isArray(booksData) && booksData.length > 0) {
                    booksData.forEach((book, index) => { // Добавляем index для задержки
                        const card = document.createElement('article');
                        card.classList.add('recommended-readings__card');
                        // Добавляем классы анимации для карточек книг
                        card.classList.add('anim', 'anim--slide-in-up');
                        // Устанавливаем задержку для эффекта стаггера
                        // Устанавливаем CSS-переменную через style.setProperty
                        card.style.setProperty('--anim-delay', `${index * 0.15}s`);


                        let cardContent = '';
                        for (const key in book) {
                            if (Object.hasOwnProperty.call(book, key)) {
                                if (key === 'title') {
                                    cardContent += `<h3 class="recommended-readings__card-title">${book[key]}</h3>`;
                                } else if (key === 'author') {
                                    cardContent += `<p class="recommended-readings__card-author">Автор: ${book[key]}</p>`;
                                } else if (key === 'description') {
                                    cardContent += `<p class="recommended-readings__card-description">${book[key]}</p>`;
                                } else if (key === 'link' && book[key] && book[key] !== '#') { // Проверяем, что ссылка не пустая и не заглушка
                                    cardContent += `<a href="${book[key]}" class="recommended-readings__card-link" target="_blank" rel="noopener noreferrer">Подробнее</a>`;
                                }
                            }
                        }
                        card.innerHTML = cardContent;
                        recommendedReadingsGrid.appendChild(card);
                    });
                    console.log('Рекомендуемая литература загружена и отображена.');

                    // После добавления всех карточек, инициализируем IntersectionObserver для них
                    initializeAnimationObserver();
                } else {
                    recommendedReadingsGrid.innerHTML = '<p class="recommended-readings__loading-message">Нет данных для отображения.</p>';
                    console.log('JSON пуст или не содержит данных о книгах.');
                }
            })
            .catch(error => {
                console.error('Ошибка при загрузке рекомендуемой литературы:', error);
                if (loadingMessage) {
                    loadingMessage.textContent = 'Не удалось загрузить литературу. Попробуйте позже.';
                } else {
                    recommendedReadingsGrid.innerHTML = '<p class="recommended-readings__loading-message">Не удалось загрузить литературу. Попробуйте позже.</p>';
                }
            });
    }

    // ===============================================
    // 7. Контактная форма с LocalStorage
    // ===============================================
    const contactForm = document.getElementById('contactForm');
    const nameInput = document.getElementById('contactName');
    const emailInput = document.getElementById('contactEmail');
    const messageTextarea = document.getElementById('contactMessage');
    const clearStorageButton = document.getElementById('clearStorageButton');
    const formStatusMessage = document.getElementById('formStatusMessage');
    const localStorageKey = 'contactFormData';

    /**
     * @function loadFormData
     * @description Загружает данные формы из LocalStorage и заполняет поля.
     * @returns {void}
     */
    function loadFormData() {
        try {
            const savedData = localStorage.getItem(localStorageKey);
            if (savedData) {
                const data = JSON.parse(savedData);
                if (nameInput && data.name) nameInput.value = data.name;
                if (emailInput && data.email) emailInput.value = data.email;
                if (messageTextarea && data.message) messageTextarea.value = data.message;
                console.log('Данные формы загружены из LocalStorage.');
                // Используем getComputedStyle для получения значений CSS переменных
                formStatusMessage.textContent = 'Форма предзаполнена сохраненными данными.';
                formStatusMessage.style.color = getComputedStyle(document.documentElement).getPropertyValue('--color-text-medium');
            }
        } catch (e) {
            console.error('Ошибка при загрузке данных из LocalStorage:', e);
            formStatusMessage.textContent = 'Ошибка загрузки данных из LocalStorage.';
            formStatusMessage.style.color = getComputedStyle(document.documentElement).getPropertyValue('--color-primary');
        }
    }

    /**
     * @function saveFormData
     * @description Сохраняет данные формы в LocalStorage.
     * @returns {void}
     */
    function saveFormData() {
        try {
            const data = {
                name: nameInput.value,
                email: emailInput.value,
                message: messageTextarea.value
            };
            localStorage.setItem(localStorageKey, JSON.stringify(data));
            console.log('Данные формы сохранены в LocalStorage.');
            formStatusMessage.textContent = 'Данные успешно сохранены!';
            formStatusMessage.style.color = getComputedStyle(document.documentElement).getPropertyValue('--color-accent');
        } catch (e) {
            console.error('Ошибка при сохранении данных в LocalStorage:', e);
            formStatusMessage.textContent = 'Ошибка сохранения данных в LocalStorage.';
            formStatusMessage.style.color = getComputedStyle(document.documentElement).getPropertyValue('--color-primary');
        }
    }

    /**
     * @function clearFormData
     * @description Очищает данные формы и LocalStorage.
     * @returns {void}
     */
    function clearFormData() {
        try {
            localStorage.removeItem(localStorageKey);
            if (nameInput) nameInput.value = '';
            if (emailInput) emailInput.value = '';
            if (messageTextarea) messageTextarea.value = '';
            formStatusMessage.textContent = 'Сохраненные данные очищены.';
            formStatusMessage.style.color = getComputedStyle(document.documentElement).getPropertyValue('--color-text-medium');
            console.log('Данные формы и LocalStorage очищены.');
        } catch (e) {
            console.error('Ошибка при очистке LocalStorage:', e);
            formStatusMessage.textContent = 'Ошибка очистки LocalStorage.';
            formStatusMessage.style.color = getComputedStyle(document.documentElement).getPropertyValue('--color-primary');
        }
    }

    // Слушатель отправки формы
    if (contactForm) {
        contactForm.addEventListener('submit', (event) => {
            event.preventDefault();
            saveFormData();
            // В реальном проекте здесь будет код для отправки данных на сервер (например, fetch)
            // setTimeout(() => contactForm.reset(), 2000);
        });
        console.log('Слушатель отправки формы установлен.');
    }

    // Слушатель клика на кнопку "Очистить сохраненные данные"
    if (clearStorageButton) {
        clearStorageButton.addEventListener('click', clearFormData);
        console.log('Слушатель кнопки очистки LocalStorage установлен.');
    }

    // Загружаем данные формы при загрузке страницы
    loadFormData();

    // ===============================================
    // Дополнительный пример: Работа с массивом элементов и forEach
    // Выводим заголовки хронологии в консоль
    // ===============================================
    const chronologyTitles = document.querySelectorAll('.chronology__event-title');
    console.log('\n--- Заголовки хронологии (выведены с помощью forEach) ---');
    if (chronologyTitles.length > 0) {
        chronologyTitles.forEach((title, index) => {
            console.log(`Заголовок ${index + 1}: "${title.textContent}"`);
            if (index % 2 === 0) {
                title.style.color = 'rgb(100, 0, 0)';
            }
        });
    } else {
        console.log('Заголовки хронологии не найдены.');
    }
    console.log('--- Конец заголовков хронологии ---\n');

    // ===============================================
    // 8. Демонстрация for...in для вывода ключевых понятий
    // Алгоритм:
    //  - Определяем объект с ключевыми понятиями и их определениями.
    //  - Получаем DOM-элемент, куда будем вставлять информацию.
    //  - Используем цикл for...in для итерации по свойствам объекта.
    //  - Для каждого свойства создаем HTML-элемент (например, div или p)
    //    и добавляем в него ключ и значение.
    // ===============================================
    const keyConceptsData = {
        "Большевики": "Фракция Российской социал-демократической рабочей партии, возглавляемая В.И. Лениным, пришедшая к власти в Октябре 1917 года.",
        "Белое движение": "Военно-политическое движение в России, сформированное в ходе Гражданской войны с целью свержения советской власти.",
        "Временное правительство": "Высший исполнительно-распорядительный орган государственной власти в России между Февральской и Октябрьской революциями 1917 года.",
        "РСФСР": "Российская Советская Федеративная Социалистическая Республика, первое социалистическое государство, образованное после Октябрьской революции.",
        "Советы": "Органы власти, возникшие в России в начале 20 века, состоящие из депутатов от рабочих, крестьян и солдат.",
        "Интервенция": "Вмешательство иностранных государств во внутренние дела России в период Гражданской войны (1918-1922)."
    };

    const keyConceptsList = document.querySelector('.key-concepts__list');
    const keyConceptsLoadingMessage = keyConceptsList ? keyConceptsList.querySelector('.key-concepts__loading-message') : null;

    if (keyConceptsList) {
        if (keyConceptsLoadingMessage) {
            keyConceptsLoadingMessage.remove(); // Удаляем сообщение о загрузке
        }

        let conceptIndex = 0; // Для индивидуальных задержек анимации
        for (const conceptKey in keyConceptsData) {
            // Убеждаемся, что свойство принадлежит самому объекту, а не унаследовано
            if (Object.hasOwnProperty.call(keyConceptsData, conceptKey)) {
                const conceptValue = keyConceptsData[conceptKey];

                const conceptElement = document.createElement('div');
                conceptElement.classList.add('key-concepts__item');
                // Добавляем классы анимации для каждого элемента списка
                conceptElement.classList.add('anim', 'anim--fade-in-up-big');
                // Устанавливаем индивидуальную задержку для эффекта стаггера
                conceptElement.style.setProperty('--anim-delay', `${0.1 + conceptIndex * 0.1}s`);

                conceptElement.innerHTML = `
                    <h3 class="key-concepts__item-title">${conceptKey}</h3>
                    <p class="key-concepts__item-description">${conceptValue}</p>
                `;
                keyConceptsList.appendChild(conceptElement);
                conceptIndex++;
            }
        }
        console.log('Ключевые понятия загружены с использованием for...in.');
        // Переинициализируем наблюдатель после добавления новых элементов
        initializeAnimationObserver();
    }


    // ===============================================
    // 9. Анимации при появлении в области видимости (Intersection Observer)
    // Алгоритм:
    //  - Находим все элементы с классом 'anim'.
    //  - Создаем IntersectionObserver.
    //  - Для каждого элемента:
    //      - Устанавливаем ему CSS-переменную --anim-delay из data-anim-delay (если есть).
    //      - Начинаем наблюдение.
    //  - Когда элемент входит в область видимости:
    //      - Добавляем ему класс 'anim--start'.
    //      - Прекращаем наблюдение за этим элементом (анимация один раз).
    // ===============================================

    /**
     * @function initializeAnimationObserver
     * @description Инициализирует Intersection Observer для элементов с классом 'anim'.
     *              Вызывается после DOMContentLoaded и после динамической загрузки контента.
     */
    function initializeAnimationObserver() {
        // Выбираем все элементы с базовым классом 'anim', которые еще не были анимированы
        const animElements = document.querySelectorAll('.anim:not(.anim--start)');

        if (animElements.length === 0) {
            console.log('Нет новых элементов для анимации.');
            return;
        }

        const observerOptions = {
            root: null, // viewport
            rootMargin: '0px',
            threshold: 0.1 // 10% видимости элемента для срабатывания
        };

        const observerCallback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    // Проверяем, есть ли data-anim-delay, если нет, то 0.
                    // Если data-anim-delay уже был установлен (например, для хронологии/карточек),
                    // то он уже будет в style.setProperty.
                    // Для элементов без data-anim-delay, --anim-delay будет 0.
                    const delay = parseFloat(element.dataset.animDelay) || 0;
                    element.style.setProperty('--anim-delay', `${delay}s`);

                    element.classList.add('anim--start');
                    observer.unobserve(element); // Прекращаем наблюдение
                    console.log(`Анимация запущена для элемента:`, element.tagName, element.className);
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        animElements.forEach(element => {
            observer.observe(element);
        });
        console.log(`Начато наблюдение за ${animElements.length} элементами для анимации.`);
    }

    // Инициализируем наблюдатель после загрузки DOM
    initializeAnimationObserver();
});