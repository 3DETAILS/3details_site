(() => {
  const carousel = document.querySelector("[data-carousel]");
  if (!carousel) return;

  const track = carousel.querySelector("[data-carousel-track]");
  const previous = carousel.querySelector("[data-carousel-prev]");
  const next = carousel.querySelector("[data-carousel-next]");
  const progress = document.querySelector("[data-carousel-progress]");

  const step = () => {
    const firstCard = track.querySelector("figure");
    if (!firstCard) return track.clientWidth;
    const styles = getComputedStyle(track);
    return firstCard.getBoundingClientRect().width + Number.parseFloat(styles.columnGap || styles.gap || 0);
  };

  const update = () => {
    const maximum = Math.max(0, track.scrollWidth - track.clientWidth);
    const current = Math.min(maximum, Math.max(0, track.scrollLeft));
    previous.disabled = current <= 2;
    next.disabled = current >= maximum - 2;

    if (progress) {
      const visibleShare = Math.min(1, track.clientWidth / track.scrollWidth);
      const travel = 1 - visibleShare;
      const offset = maximum ? (current / maximum) * travel : 0;
      progress.style.width = `${visibleShare * 100}%`;
      progress.style.transform = `translateX(${offset * 100 / visibleShare}%)`;
    }
  };

  previous.addEventListener("click", () => {
    track.scrollBy({ left: -step(), behavior: "smooth" });
  });

  next.addEventListener("click", () => {
    track.scrollBy({ left: step(), behavior: "smooth" });
  });

  track.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
})();
