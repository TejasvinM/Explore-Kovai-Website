
document.addEventListener("DOMContentLoaded", function () {

    /* ===== Header Animation ===== */
    const header = document.querySelector(".carousel-header");

    if (header) {
        setTimeout(() => {
            header.classList.add("show");
        }, 300);

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("show");
                }
            });
        }, { threshold: 0.3 });

        observer.observe(header);
    }

    /* ===== Featured Slider ===== */
    const track = document.querySelector(".featured-track");
    const slides = document.querySelectorAll(".featured-slide");
    const nextBtn = document.querySelector(".arrow.right");
    const prevBtn = document.querySelector(".arrow.left");

    if (!track || slides.length === 0) return;

    let currentIndex = 0;
    const totalSlides = slides.length;

    function updateSlide() {
        track.style.transform = "translateX(-" + (currentIndex * 100) + "%)";
    }

    nextBtn.addEventListener("click", function () {
        currentIndex = (currentIndex + 1) % totalSlides;
        updateSlide();
    });

    prevBtn.addEventListener("click", function () {
        currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        updateSlide();
    });

});

// Select all dividers
const dividers = document.querySelectorAll('.section-divider');

const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if(entry.isIntersecting){
            entry.target.classList.add('expand'); // trigger expansion
        }
    });
}, {
    threshold: 0.5 // trigger when 50% of divider is visible
});

// Observe each divider
dividers.forEach(div => observer.observe(div));


document.addEventListener("DOMContentLoaded", () => {

  const cards = document.querySelectorAll(".flavor-card");
  let index = 0;

  function highlightNext() {

    cards.forEach(card => card.classList.remove("active"));

    cards[index].classList.add("active");

    index++;
    if (index >= cards.length) {
      index = 0;
    }
  }

  highlightNext();
  setInterval(highlightNext, 2500);

});