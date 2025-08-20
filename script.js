document.addEventListener('DOMContentLoaded', () => {
    window.scrollTo(0, 0);

    // --- Referências de Elementos ---
    const mainHeader = document.getElementById('main-header');
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.getElementById('main-nav');
    const navLinks = document.querySelectorAll('.nav-link');
    const adsSection = document.getElementById('ads-section');
    const filterMessageElement = document.getElementById('filter-message');
    const bairroFilter = document.getElementById('bairro-filter');
    const servicoFilter = document.getElementById('servico-filter');
    const clearFilterBtn = document.getElementById('clear-filter-btn');

    // --- Lógica do Menu Hambúrguer ---
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        mainNav.classList.toggle('active');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            // Fecha o menu ao clicar em um link
            menuToggle.classList.remove('active');
            mainNav.classList.remove('active');
        });
    });

    // --- Ajusta a posição do título e `scroll-padding-top` ---
    function adjustSectionTitlePosition() {
        if (mainHeader) {
            const headerHeight = mainHeader.offsetHeight;
            document.documentElement.style.setProperty('--header-height', `${headerHeight + 2}px`);
        }
    }

    adjustSectionTitlePosition();
    window.addEventListener('resize', adjustSectionTitlePosition);

    // --- Função para Embaralhar Arrays ---
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // --- Função Principal para Carrossel ---
    function setupCarousel(carouselId, initialItems = []) {
        const carouselTrack = document.getElementById(`${carouselId}-track`);
        if (!carouselTrack) return;
        
        let carouselItemsOriginal = initialItems.map(item => createCarouselItem(item));
        if (carouselId === 'destaques') {
            shuffleArray(carouselItemsOriginal);
        }

        let currentIndex = 0;
        let intervalId;
        const scrollSpeed = 3000;
        const itemGap = 10;
        
        // --- Lógica de Touch/Swipe ---
        let startX = 0;
        let currentX = 0;
        let isDragging = false;
        const swipeThreshold = 50;

        function createCarouselItem(data) {
            const item = document.createElement('div');
            item.classList.add('carousel-item');
            item.innerHTML = `
                <img src="${data.imageSrc}" alt="${data.title}">
                <h3>${data.title}</h3>
                <p>${data.description}</p>
                ${data.link ? `<a href="${data.link}" target="_blank" class="more-info-btn">Mais Informações</a>` : ''}
                ${data.howToGetLink ? `<a href="${data.howToGetLink}" target="_blank" class="how-to-get-btn">Como Chegar</a>` : ''}
            `;
            return item;
        }

        function initializeCarouselItems() {
            carouselTrack.innerHTML = '';
            if (carouselItemsOriginal.length > 0) {
                carouselItemsOriginal.forEach(item => carouselTrack.appendChild(item.cloneNode(true)));
                const numItemsToClone = carouselItemsOriginal.length * 3;
                for (let i = 0; i < numItemsToClone; i++) {
                    const clone = carouselItemsOriginal[i % carouselItemsOriginal.length].cloneNode(true);
                    carouselTrack.appendChild(clone);
                }
            }
        }

        initializeCarouselItems();
        let allCarouselItems = Array.from(carouselTrack.children);

        function updateCarousel(smooth = true) {
            let itemsPerView;
            const carouselContainer = carouselTrack.parentElement;
            const containerWidth = carouselContainer.clientWidth;
            
            if (window.innerWidth >= 2560) {
                itemsPerView = 5;
            } else if (window.innerWidth >= 1440) {
                itemsPerView = 4;
            } else if (window.innerWidth >= 1024) {
                itemsPerView = 3;
            } else if (window.innerWidth >= 768) {
                itemsPerView = 2;
            } else {
                itemsPerView = 1;
            }

            let itemWidthCalc;
            if (itemsPerView === 1) {
                itemWidthCalc = `100%`;
            } else {
                const totalGapWidthForItems = itemGap * (itemsPerView - 1);
                const availableWidthForItems = containerWidth - totalGapWidthForItems;
                const individualItemWidth = availableWidthForItems / itemsPerView;
                itemWidthCalc = `${individualItemWidth}px`;
            }
            
            allCarouselItems.forEach(item => {
                item.style.minWidth = itemWidthCalc;
                item.style.maxWidth = itemWidthCalc;
                item.style.flexBasis = itemWidthCalc;
            });

            const slideFullWidthToTranslate = (allCarouselItems.length > 0) ? (allCarouselItems[0].offsetWidth + itemGap) : 0;
            
            carouselTrack.style.transition = smooth ? `transform 0.5s ease-in-out` : `none`;
            carouselTrack.style.transform = `translateX(-${currentIndex * slideFullWidthToTranslate}px)`;

            const totalOriginalItems = carouselItemsOriginal.length;
            if (currentIndex >= totalOriginalItems) {
                setTimeout(() => {
                    carouselTrack.style.transition = 'none';
                    currentIndex = 0;
                    carouselTrack.style.transform = `translateX(0px)`;
                    carouselTrack.offsetWidth;
                    carouselTrack.style.transition = `transform 0.5s ease-in-out`;
                }, smooth ? 500 : 0);
            } else if (currentIndex < 0) {
                setTimeout(() => {
                    carouselTrack.style.transition = 'none';
                    currentIndex = totalOriginalItems - 1;
                    carouselTrack.style.transform = `translateX(-${currentIndex * slideFullWidthToTranslate}px)`;
                    carouselTrack.offsetWidth;
                    carouselTrack.style.transition = 'transform 0.5s ease-in-out';
                }, smooth ? 500 : 0);
            }
        }

        function nextSlide() {
            currentIndex++;
            updateCarousel();
        }

        function prevSlide() {
            currentIndex--;
            updateCarousel();
        }

        function startAutoScroll() {
            clearInterval(intervalId);
            if (carouselItemsOriginal.length > 1) {
                intervalId = setInterval(nextSlide, scrollSpeed);
            }
        }

        carouselTrack.parentElement.addEventListener('mouseenter', () => clearInterval(intervalId));
        carouselTrack.parentElement.addEventListener('mouseleave', startAutoScroll);

        carouselTrack.addEventListener('touchstart', (e) => {
            isDragging = true;
            startX = e.touches[0].clientX;
            carouselTrack.style.transition = 'none';
            clearInterval(intervalId);
        });

        carouselTrack.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            currentX = e.touches[0].clientX;
            const diff = currentX - startX;
            const slideFullWidthToTranslate = (allCarouselItems.length > 0) ? (allCarouselItems[0].offsetWidth + itemGap) : 0;
            carouselTrack.style.transform = `translateX(${diff - (currentIndex * slideFullWidthToTranslate)}px)`;
        });

        carouselTrack.addEventListener('touchend', () => {
            isDragging = false;
            const diff = currentX - startX;
            if (Math.abs(diff) > swipeThreshold) {
                if (diff < 0) {
                    nextSlide();
                } else {
                    prevSlide();
                }
            } else {
                updateCarousel();
            }
            startAutoScroll();
        });

        window.addEventListener('resize', () => {
            clearInterval(intervalId);
            initializeCarouselItems();
            allCarouselItems = Array.from(carouselTrack.children);
            currentIndex = 0;
            updateCarousel(false);
            startAutoScroll();
        });

        currentIndex = 0;
        carouselTrack.style.transform = `translateX(0px)`;
        updateCarousel(false);
        startAutoScroll();
    }

    // --- Função para Mini-Carrosséis ---
    function setupMiniCarousel(adItem) {
        const miniCarouselTrack = adItem.querySelector('.mini-carousel-track');
        if (!miniCarouselTrack) return;
        
        let miniCarouselSlidesOriginal = Array.from(miniCarouselTrack.children);
        let currentMiniIndex = 0;
        let miniIntervalId;
        const miniScrollSpeed = 2500;
        const miniItemGap = 3;
        
        // --- Lógica de Touch/Swipe para Mini-Carrosséis ---
        let miniStartX = 0;
        let miniCurrentX = 0;
        let miniIsDragging = false;
        const miniSwipeThreshold = 30;
        
        function initializeMiniCarouselSlides() {
            miniCarouselTrack.innerHTML = '';
            if (miniCarouselSlidesOriginal.length > 1) {
                miniCarouselSlidesOriginal.forEach(item => miniCarouselTrack.appendChild(item.cloneNode(true)));
                const numClonesMini = miniCarouselSlidesOriginal.length * 3;
                for (let i = 0; i < numClonesMini; i++) {
                    const clone = miniCarouselSlidesOriginal[i % miniCarouselSlidesOriginal.length].cloneNode(true);
                    miniCarouselTrack.appendChild(clone);
                }
            } else {
                miniCarouselSlidesOriginal.forEach(item => miniCarouselTrack.appendChild(item.cloneNode(true)));
            }
        }
        
        initializeMiniCarouselSlides();
        let allMiniCarouselSlides = Array.from(miniCarouselTrack.children);
        
        function updateMiniCarousel(smooth = true) {
            if (miniCarouselSlidesOriginal.length <= 1) {
                miniCarouselTrack.style.transition = 'none';
                miniCarouselTrack.style.transform = `translateX(0px)`;
                return;
            }
            
            const slideFullWidthToTranslate = (allMiniCarouselSlides.length > 0) ? (allMiniCarouselSlides[0].offsetWidth + miniItemGap) : 0;
            miniCarouselTrack.style.transition = smooth ? `transform 0.5s ease-in-out` : `none`;
            miniCarouselTrack.style.transform = `translateX(-${currentMiniIndex * slideFullWidthToTranslate}px)`;
            
            const totalOriginalMiniSlides = miniCarouselSlidesOriginal.length;
            if (currentMiniIndex >= totalOriginalMiniSlides) {
                setTimeout(() => {
                    miniCarouselTrack.style.transition = 'none';
                    currentMiniIndex = 0;
                    miniCarouselTrack.style.transform = `translateX(0px)`;
                    miniCarouselTrack.offsetWidth;
                    miniCarouselTrack.style.transition = 'transform 0.5s ease-in-out';
                }, smooth ? 500 : 0);
            } else if (currentMiniIndex < 0) {
                setTimeout(() => {
                    miniCarouselTrack.style.transition = 'none';
                    currentMiniIndex = totalOriginalMiniSlides - 1;
                    miniCarouselTrack.style.transform = `translateX(-${currentMiniIndex * slideFullWidthToTranslate}px)`;
                    miniCarouselTrack.offsetWidth;
                    miniCarouselTrack.style.transition = 'transform 0.5s ease-in-out';
                }, smooth ? 500 : 0);
            }
        }
        
        function nextMiniSlide() {
            currentMiniIndex++;
            updateMiniCarousel();
        }
        
        function prevMiniSlide() {
            currentMiniIndex--;
            updateMiniCarousel();
        }
        
        function startMiniAutoScroll() {
            clearInterval(miniIntervalId);
            if (miniCarouselSlidesOriginal.length > 1) {
                miniIntervalId = setInterval(nextMiniSlide, miniScrollSpeed);
            }
        }
        
        miniCarouselTrack.addEventListener('mouseenter', () => clearInterval(miniIntervalId));
        miniCarouselTrack.addEventListener('mouseleave', startMiniAutoScroll);

        miniCarouselTrack.addEventListener('touchstart', (e) => {
            if (miniCarouselSlidesOriginal.length <= 1) return;
            miniIsDragging = true;
            miniStartX = e.touches[0].clientX;
            miniCarouselTrack.style.transition = 'none';
            clearInterval(miniIntervalId);
        });

        miniCarouselTrack.addEventListener('touchmove', (e) => {
            if (!miniIsDragging || miniCarouselSlidesOriginal.length <= 1) return;
            miniCurrentX = e.touches[0].clientX;
            const diff = miniCurrentX - miniStartX;
            const slideFullWidthToTranslate = (allMiniCarouselSlides.length > 0) ? (allMiniCarouselSlides[0].offsetWidth + miniItemGap) : 0;
            miniCarouselTrack.style.transform = `translateX(${diff - (currentMiniIndex * slideFullWidthToTranslate)}px)`;
        });

        miniCarouselTrack.addEventListener('touchend', () => {
            if (miniCarouselSlidesOriginal.length <= 1) return;
            miniIsDragging = false;
            const diff = miniCurrentX - miniStartX;
            if (Math.abs(diff) > miniSwipeThreshold) {
                if (diff < 0) {
                    nextMiniSlide();
                } else {
                    prevMiniSlide();
                }
            } else {
                updateMiniCarousel();
            }
            startMiniAutoScroll();
        });

        currentMiniIndex = 0;
        miniCarouselTrack.style.transform = `translateX(0px)`;
        updateMiniCarousel(false);
        startMiniAutoScroll();
    }

    // --- Lógica para os Filtros (Popula e aplica) ---
    const friendlyNames = {
        "campo redondo": "Campo Redondo",
        "vila-amelia": "Vila Amélia",
        "centro": "Centro",
        "comerciarios": "Comerciários",
        "restaurante": "Restaurante",
        "hospedagem": "Hospedagem",
        "loja": "Loja",
        "lazer": "Lazer",
        "pousadas": "Pousadas"
    };

    function getFriendlyName(key) {
        if (friendlyNames[key]) {
            return friendlyNames[key];
        }
        return key.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    // Comentário: Essa função populava os filtros com base no HTML estático.
    // Agora, ela será modificada para receber dados dinamicamente.
    function populateFilters(adsData) {
        const availableBairros = new Set();
        const availableServicos = new Set();
        
        adsData.forEach(ad => {
            if (ad.bairro) {
                availableBairros.add(ad.bairro.toLowerCase());
            }
            if (ad.servico) {
                availableServicos.add(ad.servico.toLowerCase());
            }
        });

        // Limpa e popula o filtro de bairros
        bairroFilter.innerHTML = `<option value="todos">Todos os Bairros</option>`;
        Array.from(availableBairros).sort().forEach(bairroKey => {
            const option = document.createElement('option');
            option.value = bairroKey;
            option.textContent = getFriendlyName(bairroKey);
            bairroFilter.appendChild(option);
        });
        
        // Limpa e popula o filtro de serviços
        servicoFilter.innerHTML = `<option value="todos">Todos os Serviços</option>`;
        Array.from(availableServicos).sort().forEach(servicoKey => {
            const option = document.createElement('option');
            option.value = servicoKey;
            option.textContent = getFriendlyName(servicoKey);
            servicoFilter.appendChild(option);
        });
    }

    // Comentário: Esta função agora recebe os dados crus e renderiza o HTML.
    function renderAds(adsData, selectedBairro = 'todos', selectedServico = 'todos') {
        const adsGrid = document.querySelector('.ads-grid');
        adsGrid.innerHTML = '';
        let visibleCount = 0;

        const filteredAds = adsData.filter(ad => {
            const matchesBairro = (selectedBairro === 'todos' || selectedBairro === ad.bairro.toLowerCase());
            const matchesServico = (selectedServico === 'todos' || selectedServico === ad.servico.toLowerCase());
            return matchesBairro && matchesServico;
        });

        filteredAds.forEach(ad => {
            const adItem = document.createElement('div');
            adItem.classList.add('ad-item');
            adItem.dataset.bairro = ad.bairro.toLowerCase();
            adItem.dataset.servico = ad.servico.toLowerCase();

            let miniCarouselHtml = '';
            if (ad.images && ad.images.length > 0) {
                miniCarouselHtml = `
                    <div class="mini-carousel-container">
                        <div class="mini-carousel-track">
                            ${ad.images.map(imgSrc => `<div class="mini-carousel-slide"><img src="${imgSrc}" alt="${ad.title}"></div>`).join('')}
                        </div>
                    </div>
                `;
            }

            let socialButtonsHtml = '';
            if (ad.social && Object.keys(ad.social).length > 0) {
                socialButtonsHtml = `
                    <div class="social-buttons">
                        ${ad.social.whatsapp ? `<a href="${ad.social.whatsapp}" target="_blank" class="whatsapp-btn"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/1200px-WhatsApp.svg.png" alt="WhatsApp"><span>WhatsApp</span></a>` : ''}
                        ${ad.social.instagram ? `<a href="${ad.social.instagram}" target="_blank" class="instagram-btn"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/1024px-Instagram_logo_2016.svg.png" alt="Instagram"><span>Instagram</span></a>` : ''}
                        ${ad.social.googleMaps ? `<a href="${ad.social.googleMaps}" target="_blank" class="googlemaps-btn"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Maps_icon_%282020%29.svg/1200px-Maps_icon_%282020%29.svg.png" alt="Google Maps"><span>Google Maps</span></a>` : ''}
                    </div>
                `;
            }

            adItem.innerHTML = `
                <h3>${ad.title}</h3>
                ${miniCarouselHtml}
                <p>${ad.description}</p>
                ${socialButtonsHtml}
            `;
            adsGrid.appendChild(adItem);
            visibleCount++;
        });
        
        updateFilterMessage(selectedBairro, selectedServico, count);
        
        // Inicializa os mini-carrosséis nos anúncios recém-criados
        document.querySelectorAll('.ad-item').forEach(setupMiniCarousel);
    }
    
    function updateFilterMessage(selectedBairro, selectedServico, count) {
        let message = "";
        if (selectedBairro !== 'todos' || selectedServico !== 'todos' || count === 0) {
            let bairroText = (selectedBairro !== 'todos') ? getFriendlyName(selectedBairro) : "";
            let servicoText = (selectedServico !== 'todos') ? getFriendlyName(selectedServico) : "";

            if (count === 0) {
                message = "Não encontramos nenhum parceiro com os filtros selecionados.";
            } else if (selectedBairro !== 'todos' && selectedServico === 'todos') {
                message = `Aqui estão nossos parceiros no **${bairroText}**: **${count}** encontrado(s).`;
            } else if (selectedBairro === 'todos' && selectedServico !== 'todos') {
                message = `Aqui estão nossos parceiros para **${servicoText}**: **${count}** encontrado(s).`;
            } else {
                message = `Aqui estão nossos parceiros para **${servicoText}** no **${bairroText}**: **${count}** encontrado(s).`;
            }
        }
        filterMessageElement.innerHTML = message;
    }

    function applyFilters(adsData, isInitialLoad = false) {
        const selectedBairro = bairroFilter.value;
        const selectedServico = servicoFilter.value;
        
        renderAds(adsData, selectedBairro, selectedServico);

        if (!isInitialLoad && (selectedBairro !== 'todos' || selectedServico !== 'todos')) {
            const adsSectionRect = adsSection.getBoundingClientRect();
            const isAdsSectionVisible = (adsSectionRect.top >= 0 && adsSectionRect.left >= 0 && adsSectionRect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && adsSectionRect.right <= (window.innerWidth || document.documentElement.clientWidth));

            if (!isAdsSectionVisible) {
                 adsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }

    function clearFilters(adsData) {
        bairroFilter.value = 'todos';
        servicoFilter.value = 'todos';
        applyFilters(adsData);
    }
    
    // Comentário: Esta é a área crucial para ligar ao seu banco de dados.
    // Substitua os dados de exemplo abaixo pela chamada à sua API.
    const getMockData = () => {
        // Simulação de dados retornados por um banco de dados
        return {
            destaques: [
                { title: "Chalé Aguia", description: "Chalé romantico com vista para as montanhas.", imageSrc: "chaleaguia.jpeg", link: "https://wa.me/5511930080331" },
                { title: "Deposito Construção Martelo", description: "Tudo para sua obra em paraibuna.", imageSrc: "deposito3.jpeg", link: "https://wa.me/5512912345678" },
                { title: "Casa de campo", description: "Casa de campo para descanço.", imageSrc: "casa.jpeg", link: "https://wa.me/5512912345678" },
                { title: "Farmacia Paraibuna", description: "Remedios baratos é aqui.", imageSrc: "farmacia.jpeg", link: "https://wa.me/5512912345678" }
            ],
            ads: [
                { title: "Chalé Aguia", description: "Chalé romantico com vista para as montanhas.", bairro: "Campo Redondo", servico: "Pousadas", images: ["chaleaguia.jpeg", "bar1.jpeg"], social: { whatsapp: "https://wa.me/5511930080331", instagram: "https://instagram.com/renaissance.chales", googleMaps: "https://maps.app.goo.gl/dh6Ki7bWK6wwZjPR6" } },
                { title: "Pousada Aconchego", description: "Hospedagem confortável e com vista privilegiada.", bairro: "Vila Amélia", servico: "Hospedagem", images: ["bar2.jpg"], social: { whatsapp: "https://wa.me/5512912345678", instagram: "https://instagram.com/seuinstagram", googleMaps: "https://maps.app.goo.gl/seulocalizacao" } },
                { title: "Loja de Artesanato Local", description: "Produtos artesanais únicos da região. Ótimas lembranças!", bairro: "Centro", servico: "Loja", images: ["https://via.placeholder.com/300x200/8B4513/FFFFFF?text=Loja+1.1", "https://via.placeholder.com/300x200/D2B48C/000000?text=Loja+1.2"], social: { whatsapp: "https://wa.me/5512912345678", instagram: "https://instagram.com/seuinstagram", googleMaps: "https://maps.app.goo.gl/seulocalizacao" } },
                { title: "Parque de Aventuras", description: "Tirolesa, arvorismo e muita diversão para toda a família!", bairro: "Comerciarios", servico: "Lazer", images: ["img/anuncie_aqui.jpg", "img/anuncie_aqui.jpg"], social: { whatsapp: "https://wa.me/5512912345678", instagram: "https://instagram.com/seuinstagram", googleMaps: "https://maps.app.goo.gl/seulocalizacao" } }
            ],
            pontosTuristicos: [
                { title: "Nome do Ponto Turístico 1", description: "Descrição do ponto turístico e o que ele oferece.", imageSrc: "img/anuncie_aqui.jpg", howToGetLink: "https://maps.app.goo.gl/seulocalizacao" },
                { title: "Nome do Ponto Turístico 2", description: "Descrição do ponto turístico e o que ele oferece.", imageSrc: "logo.png", howToGetLink: "https://maps.app.goo.gl/seulocalizacao" },
                { title: "Nome do Ponto Turístico 3", description: "Descrição do ponto turístico e o que ele oferece.", imageSrc: "https://via.placeholder.com/600x400/A0FF33/FFFFFF?text=Ponto+Turistico+3", howToGetLink: "https://maps.app.goo.gl/seulocalizacao" },
                { title: "Nome do Ponto Turístico 4", description: "Descrição do ponto turístico e o que ele oferece.", imageSrc: "https://via.placeholder.com/600x400/33A0FF/FFFFFF?text=Ponto+Turistico+4", howToGetLink: "https://maps.app.goo.gl/seulocalizacao" }
            ]
        };
    };

    // Comentário: Você vai substituir esta função por uma chamada real à sua API.
    // Exemplo: fetch('https://sua-api.com/data').then(response => response.json()).then(data => { ... });
    const loadData = async () => {
        try {
            // Em produção, use fetch para carregar os dados
            // const response = await fetch('URL_DA_SUA_API_DE_DADOS');
            // const data = await response.json();
            
            // Usando dados de mock para o exemplo
            const data = getMockData();

            // Configura os carrosséis com os dados do mock
            setupCarousel('destaques', data.destaques);
            setupCarousel('pontos-turisticos', data.pontosTuristicos);
            
            // Popula os filtros com os dados de anúncios
            populateFilters(data.ads);
            
            // Renderiza os anúncios com base nos dados do mock
            renderAds(data.ads);
            
            // Adiciona os event listeners com a referência aos dados
            bairroFilter.addEventListener('change', () => applyFilters(data.ads));
            servicoFilter.addEventListener('change', () => applyFilters(data.ads));
            clearFilterBtn.addEventListener('click', () => clearFilters(data.ads));

        } catch (error) {
            console.error("Falha ao carregar os dados:", error);
            // Mensagem de erro para o usuário, se necessário
            filterMessageElement.innerHTML = "Ops! Não foi possível carregar os dados. Tente novamente mais tarde.";
        }
    };

    // Inicia o carregamento dos dados
    loadData();
});