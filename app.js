document.addEventListener('DOMContentLoaded', () => {
  // 1. Curtain Animation
  const curtainContainer = document.getElementById('curtain-container');
  const mainContent = document.getElementById('main-content');
  
  if (curtainContainer) {
    curtainContainer.addEventListener('click', () => {
      curtainContainer.classList.add('open');
      mainContent.classList.add('visible');
      
      // Remove from DOM after animation completes so it doesn't block clicks
      setTimeout(() => {
        curtainContainer.style.display = 'none';
      }, 1500);
    });
  }

  // 2. Intersection Observer for Fade-In Elements
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // Only animate once
      }
    });
  }, observerOptions);

  document.querySelectorAll('.fade-in').forEach(el => {
    observer.observe(el);
  });

  // 3. Scratch Reveal Feature
  const canvases = [
    document.getElementById('scratch1'),
    document.getElementById('scratch2'),
    document.getElementById('scratch3')
  ];
  
  const lockedContent = document.getElementById('locked-content');
  const successMessage = document.getElementById('successMessage');
  const instructionText = document.getElementById('scratch-instruction');
  
  let scratchedCount = 0;

  canvases.forEach(canvas => {
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    let isDrawing = false;
    let isScratched = false;

    // Fill with gold
    ctx.fillStyle = '#c5a059';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    function getPointerPos(e) {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    }

    function checkScratchPercentage() {
      if (isScratched) return;
      
      const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let transparentPixels = 0;
      const totalPixels = pixels.length / 4;

      for (let i = 3; i < pixels.length; i += 4) {
        if (pixels[i] < 50) {
          transparentPixels++;
        }
      }

      const percentage = (transparentPixels / totalPixels) * 100;
      if (percentage > 50) {
        isScratched = true;
        canvas.classList.add('scratched'); // Fades out the rest
        scratchedCount++;
        
        if (scratchedCount === 3) {
          unlockPage();
        }
      }
    }

    function scratch(e) {
      if (!isDrawing || isScratched) return;
      e.preventDefault();
      
      const pos = getPointerPos(e);
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 15, 0, Math.PI * 2);
      ctx.fill();
      
      // Throttle checking to save performance
      if (Math.random() > 0.8) {
        checkScratchPercentage();
      }
    }

    // Mouse Events
    canvas.addEventListener('mousedown', (e) => { isDrawing = true; scratch(e); });
    canvas.addEventListener('mousemove', scratch);
    canvas.addEventListener('mouseup', () => { isDrawing = false; checkScratchPercentage(); });
    canvas.addEventListener('mouseleave', () => { isDrawing = false; });

    // Touch Events
    canvas.addEventListener('touchstart', (e) => { isDrawing = true; scratch(e); }, { passive: false });
    canvas.addEventListener('touchmove', scratch, { passive: false });
    canvas.addEventListener('touchend', () => { isDrawing = false; checkScratchPercentage(); });
  });

  function unlockPage() {
    if (instructionText) instructionText.style.display = 'none';
    if (successMessage) successMessage.style.display = 'block';
    
    // Add confetti effect
    createConfetti();
    
    // Unlock content
    if (lockedContent) {
      lockedContent.style.display = 'block';
      setTimeout(() => {
        lockedContent.style.opacity = '1';
        // Re-trigger intersection observer for newly visible elements
        document.querySelectorAll('#locked-content .fade-in').forEach(el => {
          observer.observe(el);
        });
      }, 100);
    }
  }
  
  function createConfetti() {
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.style.position = 'fixed';
      confetti.style.width = Math.random() * 10 + 5 + 'px';
      confetti.style.height = Math.random() * 10 + 5 + 'px';
      confetti.style.backgroundColor = Math.random() > 0.5 ? '#c5a059' : '#3a0000';
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.top = '-20px';
      confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
      confetti.style.zIndex = '9999';
      confetti.style.pointerEvents = 'none';
      
      const duration = Math.random() * 2 + 2;
      confetti.style.transition = `transform ${duration}s ease-in, opacity ${duration}s ease-out`;
      
      document.body.appendChild(confetti);
      
      setTimeout(() => {
        confetti.style.transform = `translateY(100vh) rotate(${Math.random() * 360}deg)`;
        confetti.style.opacity = '0';
      }, 50);
      
      setTimeout(() => {
        confetti.remove();
      }, duration * 1000 + 100);
    }
  }
});
