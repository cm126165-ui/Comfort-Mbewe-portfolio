const root = document.documentElement;
const body = document.body;
const navLinks = Array.from(document.querySelectorAll("[data-section-link]"));
const sections = Array.from(document.querySelectorAll("main section[id]"));
const fadeItems = Array.from(document.querySelectorAll(".fade-in"));
const menuToggle = document.querySelector(".menu-toggle");
const sidebar = document.querySelector(".sidebar");
const navScrim = document.querySelector("[data-nav-close]");

document.addEventListener("mousemove", (event) => {
  root.style.setProperty("--mouse-x", event.clientX + "px");
  root.style.setProperty("--mouse-y", event.clientY + "px");
});

const setActiveLink = (sectionId) => {
  navLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${sectionId}`;
    link.classList.toggle("active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "true");
    } else {
      link.removeAttribute("aria-current");
    }
  });
};

const visibleSections = new Map();

const getSectionTopFallback = () => {
  const scrollPosition = window.scrollY + 120;
  const currentSection = sections
    .slice()
    .reverse()
    .find((section) => section.offsetTop <= scrollPosition);

  return currentSection ? currentSection.id : (sections[0] ? sections[0].id : "");
};

const scrollSpyObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        visibleSections.set(entry.target.id, entry.intersectionRatio);
      } else {
        visibleSections.delete(entry.target.id);
      }
    });

    let activeId = "";
    let bestRatio = 0;

    visibleSections.forEach((ratio, id) => {
      if (ratio >= bestRatio) {
        bestRatio = ratio;
        activeId = id;
      }
    });

    setActiveLink(activeId || getSectionTopFallback());
  },
  {
    threshold: [0.3, 0.45, 0.6, 0.75]
  }
);

sections.forEach((section) => scrollSpyObserver.observe(section));

const fadeObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  },
  {
    threshold: 0.1
  }
);

fadeItems.forEach((item) => fadeObserver.observe(item));

const closeNav = () => {
  body.classList.remove("nav-open");

  if (menuToggle) {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
  }
};

const openNav = () => {
  body.classList.add("nav-open");

  if (menuToggle) {
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Close navigation");
  }
};

if (menuToggle) {
  menuToggle.addEventListener("click", (event) => {
    event.stopPropagation();

    if (body.classList.contains("nav-open")) {
      closeNav();
    } else {
      openNav();
    }
  });
}

if (navScrim) {
  navScrim.addEventListener("click", closeNav);
}

document.addEventListener("click", (event) => {
  if (!body.classList.contains("nav-open") || window.innerWidth >= 768) {
    return;
  }

  if ((sidebar && sidebar.contains(event.target)) || (menuToggle && menuToggle.contains(event.target))) {
    return;
  }

  closeNav();
});

window.addEventListener("resize", () => {
  if (window.innerWidth >= 768) {
    closeNav();
  }
});

const smoothScrollTo = (targetSelector) => {
  const target = document.querySelector(targetSelector);

  if (!target) {
    return;
  }

  const offset = 80;
  const targetTop = target.getBoundingClientRect().top + window.scrollY - offset;

  window.scrollTo({
    top: targetTop,
    behavior: "smooth"
  });
};

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetSelector = link.getAttribute("href");

    if (!targetSelector || targetSelector === "#") {
      return;
    }

    const target = document.querySelector(targetSelector);

    if (!target) {
      return;
    }

    event.preventDefault();
    smoothScrollTo(targetSelector);

    if (window.innerWidth < 768) {
      closeNav();
    }
  });
});

setActiveLink(getSectionTopFallback());
document.getElementById('year').textContent = new Date().getFullYear();
