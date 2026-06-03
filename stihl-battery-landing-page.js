document.addEventListener('DOMContentLoaded', function () {
  // === 1. FAQ Accordion Toggle ===
  const faqItems = document.querySelectorAll('.stihl-lp-faq-item');
  
  faqItems.forEach(item => {
    const question = item.querySelector('.stihl-lp-faq-question');
    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      // Close all other active FAQ items
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
        }
      });
      
      // Toggle current FAQ item
      if (isActive) {
        item.classList.remove('active');
      } else {
        item.classList.add('active');
      }
    });
  });

  // === 2. Video Spotlight Controls ===
  const videoCards = document.querySelectorAll('.stihl-lp-split-card');
  
  videoCards.forEach(card => {
    const video = card.querySelector('video');
    const overlay = card.querySelector('.stihl-lp-video-overlay');
    const playText = overlay.querySelector('span');
    
    if (!video) return;

    let playPromise = null;

    // Helper to play/pause
    const playVideo = () => {
      // Pause all other videos first
      videoCards.forEach(otherCard => {
        if (otherCard !== card) {
          const otherVideo = otherCard.querySelector('video');
          const otherOverlay = otherCard.querySelector('.stihl-lp-video-overlay');
          if (otherVideo && !otherVideo.paused) {
            otherVideo.pause();
            if (otherOverlay) otherOverlay.style.opacity = '1';
          }
        }
      });

      playPromise = video.play();
      if (playPromise !== undefined && playPromise !== null) {
        playPromise.then(() => {
          overlay.style.opacity = '0';
        }).catch(err => {
          console.log("Play interrupted or blocked:", err);
        });
      }
    };

    const pauseVideo = () => {
      if (playPromise !== undefined && playPromise !== null) {
        playPromise.then(() => {
          video.pause();
          overlay.style.opacity = '1';
          playText.textContent = 'Click to Watch Video';
        }).catch(() => {
          video.pause();
          overlay.style.opacity = '1';
          playText.textContent = 'Click to Watch Video';
        });
      } else {
        video.pause();
        overlay.style.opacity = '1';
        playText.textContent = 'Click to Watch Video';
      }
    };

    // Hover actions for desktop (specifically hover on the video container to avoid layout triggers)
    const videoWrapper = card.querySelector('.stihl-lp-card-video-wrapper');
    if (videoWrapper) {
      videoWrapper.addEventListener('mouseenter', () => {
        playVideo();
      });

      videoWrapper.addEventListener('mouseleave', () => {
        pauseVideo();
      });
    }

    // Touch/Click actions (important for mobile & direct click)
    overlay.addEventListener('click', (e) => {
      e.stopPropagation();
      if (video.paused) {
        playVideo();
      } else {
        pauseVideo();
      }
    });

    // Event listeners on video element to sync overlay in case of browser-level actions
    video.addEventListener('play', () => {
      overlay.style.opacity = '0';
    });
    
    video.addEventListener('pause', () => {
      overlay.style.opacity = '1';
    });
  });

  // === 3. Product Grid Filtering ===
  const filterBtns = document.querySelectorAll('.stihl-lp-filter-btn');
  const productCards = document.querySelectorAll('.stihl-lp-product-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Toggle active button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      productCards.forEach(card => {
        if (filterValue === 'all') {
          card.style.display = 'flex';
          // trigger minor animation
          card.style.opacity = '0';
          setTimeout(() => { card.style.opacity = '1'; }, 50);
        } else if (card.classList.contains(`stihl-lp-category-${filterValue}`)) {
          card.style.display = 'flex';
          card.style.opacity = '0';
          setTimeout(() => { card.style.opacity = '1'; }, 50);
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // === 4. Interactive Quiz Selector ===
  let currentStep = 1;
  const totalSteps = 3;
  const quizAnswers = {
    location: null,
    priority: null,
    weather: null
  };

  const steps = document.querySelectorAll('.stihl-lp-quiz-step');
  const prevBtn = document.getElementById('stihl-lp-quiz-prev');
  const nextBtn = document.getElementById('stihl-lp-quiz-next');
  const resetBtn = document.getElementById('stihl-lp-quiz-reset');
  const progressBar = document.querySelector('.stihl-lp-quiz-progress-bar');

  // Question Options click handlers
  const optionContainers = document.querySelectorAll('.stihl-lp-quiz-options');
  
  optionContainers.forEach(container => {
    const options = container.querySelectorAll('.stihl-lp-quiz-option');
    const category = container.getAttribute('data-quiz-category');

    options.forEach(option => {
      option.addEventListener('click', () => {
        // Deselect others in this container
        options.forEach(o => o.classList.remove('selected'));
        // Select this one
        option.classList.add('selected');
        const radio = option.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;

        // Save value
        quizAnswers[category] = option.getAttribute('data-quiz-val');

        // Enable Next Button
        nextBtn.removeAttribute('disabled');
      });
    });
  });

  function updateQuizUI() {
    // Show current step, hide others
    steps.forEach(step => {
      const stepNum = parseInt(step.getAttribute('data-quiz-step'));
      if (stepNum === currentStep) {
        step.classList.add('active');
      } else {
        step.classList.remove('active');
      }
    });

    // Update progress bar
    const progressPercent = ((currentStep - 1) / totalSteps) * 100;
    progressBar.style.width = `${progressPercent}%`;

    // Manage buttons visibility
    if (currentStep === 1) {
      prevBtn.style.visibility = 'hidden';
    } else {
      prevBtn.style.visibility = 'visible';
    }

    if (currentStep > totalSteps) {
      // Recommendation Screen
      prevBtn.style.display = 'none';
      nextBtn.style.display = 'none';
      progressBar.style.width = '100%';
      calculateRecommendation();
    } else {
      prevBtn.style.display = 'inline-flex';
      nextBtn.style.display = 'inline-flex';
      
      // Check if current step already has an answer to enable/disable Next
      const currentCategory = steps[currentStep - 1].querySelector('.stihl-lp-quiz-options').getAttribute('data-quiz-category');
      if (quizAnswers[currentCategory]) {
        nextBtn.removeAttribute('disabled');
      } else {
        nextBtn.setAttribute('disabled', 'true');
      }
    }
  }

  // Next & Prev button actions
  nextBtn.addEventListener('click', () => {
    if (currentStep <= totalSteps) {
      currentStep++;
      updateQuizUI();
    }
  });

  prevBtn.addEventListener('click', () => {
    if (currentStep > 1) {
      currentStep--;
      updateQuizUI();
    }
  });

  resetBtn.addEventListener('click', () => {
    // Reset answers
    quizAnswers.location = null;
    quizAnswers.priority = null;
    quizAnswers.weather = null;
    
    // Clear selection classes
    document.querySelectorAll('.stihl-lp-quiz-option').forEach(option => {
      option.classList.remove('selected');
      const radio = option.querySelector('input[type="radio"]');
      if (radio) radio.checked = false;
    });

    // Reset UI state
    currentStep = 1;
    prevBtn.style.display = 'inline-flex';
    nextBtn.style.display = 'inline-flex';
    updateQuizUI();

    // Scroll back to top of quiz smoothly
    document.getElementById('stihl-battery-advisor').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  function calculateRecommendation() {
    let akScore = 0;
    let apScore = 0;

    // Location
    if (quizAnswers.location === 'domestic') akScore++;
    if (quizAnswers.location === 'commercial') apScore++;

    // Priority
    if (quizAnswers.priority === 'value') akScore++;
    if (quizAnswers.priority === 'power') apScore++;

    // Weather
    if (quizAnswers.weather === 'dry') akScore++;
    if (quizAnswers.weather === 'all-weather') apScore++;

    const recommendation = (apScore >= 2) ? 'ap' : 'ak';
    
    // Render the recommended result screen
    const resultStep = document.getElementById('stihl-lp-quiz-result');
    const resultContent = resultStep.querySelector('.stihl-lp-result-content');

    if (recommendation === 'ak') {
      resultContent.className = 'stihl-lp-result-content recommend-ak';
      resultContent.innerHTML = `
        <div class="stihl-lp-result-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </div>
        <span class="stihl-lp-result-badge">Your Recommended System</span>
        <h3 class="stihl-lp-result-title">STIHL AK System</h3>
        <p class="stihl-lp-result-description">
          The AK system is the perfect match for your gardening goals! Designed specifically for domestic homeowners with medium to large gardens, it balances impressive cordless cutting and blowing power with lightweight ergonomics and excellent value.
        </p>
        <div class="stihl-lp-result-features">
          <div class="stihl-lp-result-feature-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            <div>
              <h5>Lightweight & Easy</h5>
              <p>Minimal fatigue and perfect balance during operation.</p>
            </div>
          </div>
          <div class="stihl-lp-result-feature-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            <div>
              <h5>One Battery, Many Tools</h5>
              <p>Swap the battery seamlessly between lawnmowers, hedge trimmers, blowers & chainsaws.</p>
            </div>
          </div>
          <div class="stihl-lp-result-feature-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            <div>
              <h5>Excellent Value</h5>
              <p>High-end German engineering at an accessible price point for homeowners.</p>
            </div>
          </div>
        </div>
        <div class="stihl-lp-result-actions">
          <a href="https://briantsofrisborough.co.uk/product-category/garden-machinery/cordless-machinery/stihl-ak-system/" class="stihl-lp-btn stihl-lp-btn-secondary" target="_parent">
            Browse AK System Products
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </a>
          <button id="stihl-lp-quiz-reset-btn" class="stihl-lp-btn stihl-lp-btn-outline">
            Take Quiz Again
          </button>
        </div>
      `;
    } else {
      resultContent.className = 'stihl-lp-result-content recommend-ap';
      resultContent.innerHTML = `
        <div class="stihl-lp-result-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
        </div>
        <span class="stihl-lp-result-badge">Your Recommended System</span>
        <h3 class="stihl-lp-result-title">STIHL AP System</h3>
        <p class="stihl-lp-result-description">
          You need high-performance reliability! The AP system is designed for professional landscape contractors, municipal tree care workers, and owners of very large gardens or estates. It delivers premium power, maximum runtimes, all-weather durability (IPX4 weatherproofing), and high battery charging cycles.
        </p>
        <div class="stihl-lp-result-features">
          <div class="stihl-lp-result-feature-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            <div>
              <h5>Commercial Durability</h5>
              <p>IPX4 splash protection allows you to keep working, even in heavy rain.</p>
            </div>
          </div>
          <div class="stihl-lp-result-feature-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            <div>
              <h5>Max Power & Runtime</h5>
              <p>Handles the most demanding professional jobs. Supports backpack batteries (AR range) for all-day energy.</p>
            </div>
          </div>
          <div class="stihl-lp-result-feature-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            <div>
              <h5>Long-Term Investment</h5>
              <p>AP 500 S features Power Laminate technology, rated for 2,500+ charge cycles (double standard round cells).</p>
            </div>
          </div>
        </div>
        <div class="stihl-lp-result-actions">
          <a href="https://briantsofrisborough.co.uk/product-category/garden-machinery/cordless-machinery/stihl-ap-system/" class="stihl-lp-btn stihl-lp-btn-primary" target="_parent">
            Browse AP System Products
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </a>
          <button id="stihl-lp-quiz-reset-btn" class="stihl-lp-btn stihl-lp-btn-outline">
            Take Quiz Again
          </button>
        </div>
      `;
    }

    // Attach reset listener on the newly rendered quiz reset button
    document.getElementById('stihl-lp-quiz-reset-btn').addEventListener('click', () => {
      resetBtn.click();
    });
  }

  // Initialize Quiz UI
  updateQuizUI();
});
