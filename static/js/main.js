/* ============================================================
   main.js — Infer3D Research Website
   Carousel engine, video synchronization, slide generation
   ============================================================ */

// ─── Dataset Configuration ───────────────────────────────────
const DATASETS = {
  shapenet: {
    basePath: './results/shapenet/',
    baselineLabel: 'Splatter Image',
    type: 'object',
    slides: [
      { folder: 'chair-7e967a3c6d2a46c3e2d62d6f0e6f01ec', label: 'Chair (2)' },
      { folder: 'bench-b09f17c66d25a38cf155d75bbf62b80', label: 'Bench' },
      { folder: 'car-530234273d5e31a57c7baeeaa3dedfc', label: 'Car (1)' },
      { folder: 'chair-21bc90d659dbe28a71aa44dea7a6d383', label: 'Chair (1)' },
      { folder: 'loudspeaker-869225f275f3dee12a42340e65c9f0ec', label: 'Loudspeaker', baselineFile: 'baseline_render.mp4' },
      { folder: 'monitor-810fac004670692fe9d7a3dffbf25100', label: 'Monitor' },
      { folder: 'car-586da8cf648767222a9eb0f146e94477', label: 'Car (2)' },
      { folder: 'plane-6ecf2dd001e3b029dc53c0dc42fb387b', label: 'Plane' },
      { folder: 'sofa-adefd541f3b51aba5f5e789acd4d1122', label: 'Sofa' },
      { folder: 'table-9afa121e3aec8bd7c387f328a37d8ece', label: 'Table' },
    ]
  },
  hydrants: {
    basePath: './results/hydrants/',
    baselineLabel: 'Splatter Image',
    type: 'object',
    slides: [
      { folder: '147_16374', label: 'Hydrant 1' },
      { folder: '415_57191', label: 'Hydrant 2' },
      { folder: '491_70265', label: 'Hydrant 3' },
      { folder: '570_83077', label: 'Hydrant 4' },
      { folder: '580_86059', label: 'Hydrant 5' },
    ]
  },
  vases: {
    basePath: './results/vases/',
    baselineLabel: 'Splatter Image',
    type: 'object',
    slides: [
      { folder: '58_3381', label: 'Vase 1' },
      { folder: '62_4344', label: 'Vase 2', baselineFile: 'baseline.mp4' },
      { folder: '270_28786', label: 'Vase 3' },
      { folder: '608_95872', label: 'Vase 4' },
      { folder: '614_98677', label: 'Vase 5' },
    ]
  },
  re10k: {
    basePath: './results/re10k/',
    baselineLabel: 'CATSplat',
    type: 'scene',
    slides: [
      { folder: '7c9971fb046c8d9a', label: 'Scene 3' },
      { folder: '7fdee044fb73c083', label: 'Scene 4' },
      { folder: 'edaf13c2d419ff89', label: 'Scene 5' },
      { folder: '5dadb9b615a66714', label: 'Scene 2' },
      { folder: '5a15212752d1659a', label: 'Scene 1' },
    ]
  },
  realcars: {
    basePath: './results/realcars/',
    type: 'realcars',
    slides: [
      { folder: '04', label: 'Car 04' },
      { folder: '05', label: 'Car 05' },
      { folder: '10', label: 'Car 10' },
      { folder: '12', label: 'Car 12' },
      { folder: '15', label: 'Car 15' },
      { folder: '13', label: 'Car 13' },
      { folder: '11', label: 'Car 11' },
      { folder: '08', label: 'Car 08' },
      { folder: '09', label: 'Car 09' },
      { folder: '01', label: 'Car 01' },
      // { folder: '02', label: 'Car 02' },
      // { folder: '03', label: 'Car 03' },
      // { folder: '06', label: 'Car 06' },
      // { folder: '07', label: 'Car 07' },
      // { folder: '14', label: 'Car 14' },
      // { folder: '16', label: 'Car 16' },
      // { folder: '17', label: 'Car 17' },
      // { folder: '18', label: 'Car 18' },
      // { folder: '19', label: 'Car 19' },
      // { folder: '00', label: 'Car 00' },
    ]
  }
};

// ─── Slide HTML Generators ───────────────────────────────────

function makeVideoEl(src, isFirst) {
  const srcAttr = isFirst ? `src="${src}"` : `data-src="${src}"`;
  return `<video muted playsinline preload="${isFirst ? 'auto' : 'none'}"><source ${srcAttr} type="video/mp4"></video>`;
}

function makeImageEl(src, isFirst) {
  if (isFirst) return `<img src="${src}" loading="eager">`;
  return `<img data-src="${src}" loading="lazy" src="">`;
}

function panelImage(label, src, isFirst) {
  return `
    <div class="panel">
      <p class="panel-label">${label}</p>
      <div class="panel-media single-media">
        ${makeImageEl(src, isFirst)}
      </div>
    </div>`;
}

function panelVideo(label, src, isFirst) {
  return `
    <div class="panel">
      <p class="panel-label">${label}</p>
      <div class="panel-media single-media">
        ${makeVideoEl(src, isFirst)}
      </div>
    </div>`;
}

function panelPlaceholder(label) {
  return `
    <div class="panel">
      <p class="panel-label">${label}</p>
      <div class="panel-media single-media">
        <div class="panel-placeholder">N/A</div>
      </div>
    </div>`;
}

function panelStackedTwo(basePath, slide, isFirst) {
  const imgIn = basePath + 'ours_in.png';
  const imgRender = basePath + 'ours_render.png';
  return `
    <div class="panel panel-stacked">
      <p class="panel-label">Ours (Intermediate)</p>
      <div class="panel-media">
        <div class="stacked-images">
          <div class="stacked-item">
            <p class="sub-label">Generated Input</p>
            ${makeImageEl(imgIn, isFirst)}
          </div>
          <div class="stacked-item">
            <p class="sub-label">Rendered at OOD Pose</p>
            ${makeImageEl(imgRender, isFirst)}
          </div>
        </div>
      </div>
    </div>`;
}

function panelStackedThree(basePath, slide, isFirst) {
  const imgIn = basePath + 'ours_in.png';
  const imgCam = basePath + 'ours_cam.png';
  const imgRender = basePath + 'ours_render.png';
  return `
    <div class="panel panel-stacked">
      <p class="panel-label">Ours (Intermediate)</p>
      <div class="panel-media">
        <div class="stacked-images">
          <div class="stacked-item">
            <p class="sub-label">Generated Input</p>
            ${makeImageEl(imgIn, isFirst)}
          </div>
          <div class="stacked-item">
            <p class="sub-label">Recovered Lens Distortion</p>
            ${makeImageEl(imgCam, isFirst)}
          </div>
          <div class="stacked-item">
            <p class="sub-label">Rendered after Distortion</p>
            ${makeImageEl(imgRender, isFirst)}
          </div>
        </div>
      </div>
    </div>`;
}

function panelStackedHorizontalTwo(label, srcA, labelA, srcB, labelB, isFirst) {
  return `
    <div class="panel panel-stacked-h">
      <p class="panel-label">${label}</p>
      <div class="panel-media">
        <div class="stacked-images-h">
          <div class="stacked-item-h">
            <p class="sub-label">${labelA}</p>
            ${makeImageEl(srcA, isFirst)}
          </div>
          <div class="stacked-item-h">
            <p class="sub-label">${labelB}</p>
            ${makeImageEl(srcB, isFirst)}
          </div>
        </div>
      </div>
    </div>`;
}

function mechanismPanelImage(label, src, isFirst) {
  return `
    <div class="mechanism-item">
      <p class="sub-label">${label}</p>
      <div class="panel-media single-media">
        ${makeImageEl(src, isFirst)}
      </div>
    </div>`;
}

function panelMechanismThree(basePath, isFirst) {
  return `
    <div class="scene-mechanism">
      ${mechanismPanelImage('Generated Input', basePath + 'ours_in.png', isFirst)}
      ${mechanismPanelImage('Recovered Lens Distortion', basePath + 'ours_cam.png', isFirst)}
      ${mechanismPanelImage('Rendered after Distortion', basePath + 'ours_render.png', isFirst)}
    </div>`;
}

function panelMechanismTwo(basePath, isFirst) {
  return `
    <div class="object-mechanism">
      ${mechanismPanelImage('Generated Input', basePath + 'ours_in.png', isFirst)}
      ${mechanismPanelImage('Rendered at OOD Pose', basePath + 'ours_render.png', isFirst)}
    </div>`;
}

// ─── Build a Carousel ────────────────────────────────────────

function buildCarousel(container, config) {
  const inner = container.querySelector('.carousel-inner');
  const dotsContainer = container.querySelector('.carousel-dots');

  config.slides.forEach((slide, i) => {
    const isFirst = (i === 0);
    const slideEl = document.createElement('div');
    slideEl.className = 'carousel-slide' + (isFirst ? ' active' : '');

    const basePath = config.basePath + slide.folder + '/';
    const baselineFile = slide.baselineFile || 'baseline_ood.mp4';

    let html = '';

    if (config.type === 'scene') {
      // Row 1: clean output comparison
      html += '<div class="comparison-panels scene-main-panels">';
      html += panelImage('OOD Input', basePath + 'ood_image.png', isFirst);
      html += panelVideo(config.baselineLabel, basePath + baselineFile, isFirst);
      html += panelVideo('Ours (Final)', basePath + 'ours.mp4', isFirst);
      html += panelVideo('GT', basePath + 'gt.mp4', isFirst);
      html += '</div>';

      // Row 2: mechanism / intermediate visualizations
      html += `<div class="intermediate-row">${panelMechanismThree(basePath, isFirst)}</div>`;
    } else if (config.type === 'realcars') {
      html += '<div class="comparison-panels realcars-main-panels">';
      html += panelStackedHorizontalTwo(
        'OOD Input',
        basePath + 'gt_bg.png',    'w/ background',
        basePath + 'gt_white.png', 'w/o background',
        isFirst
      );
      html += panelVideo('Splatter Image',  basePath + 'splatter.mp4', isFirst);
      html += panelVideo('LGM',             basePath + 'lgm.mp4',      isFirst);
      html += panelVideo('SF3D',            basePath + 'sf3d.mp4',     isFirst);
      html += panelVideo('Infer3D (Ours)',  basePath + 'ours.mp4',     isFirst);
      html += '</div>';
    } else {
      html += '<div class="comparison-panels object-main-panels">';
      html += panelImage('OOD Input', basePath + 'ood_image.png', isFirst);
      html += panelVideo(config.baselineLabel, basePath + baselineFile, isFirst);
      html += panelVideo('Ours (Final)', basePath + 'ours.mp4', isFirst);
      html += panelVideo('GT', basePath + 'gt.mp4', isFirst);
      html += '</div>';
      html += `<div class="intermediate-row">${panelMechanismTwo(basePath, isFirst)}</div>`;
    }
    slideEl.innerHTML = html;
    inner.appendChild(slideEl);

    // Dot indicator
    const dot = document.createElement('button');
    dot.className = 'carousel-dot' + (isFirst ? ' active' : '');
    dot.dataset.slide = i;
    dot.setAttribute('aria-label', slide.label);
    dotsContainer.appendChild(dot);
  });

  // Toggle for intermediate rows (skip for configs with no intermediate row).
  // Default: expanded.
  if (config.type !== 'realcars') {
    container.classList.add('show-intermediate');
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'intermediate-toggle';
    toggle.setAttribute('aria-expanded', 'true');
    toggle.textContent = 'Hide our intermediate outputs';
    toggle.addEventListener('click', () => {
      const expanded = container.classList.toggle('show-intermediate');
      toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      toggle.textContent = expanded
        ? 'Hide our intermediate outputs'
        : 'Click to see our intermediate outputs';
    });
    const controls = container.querySelector('.carousel-controls');
    if (controls) {
      controls.insertAdjacentElement('beforebegin', toggle);
    }
  }

  initCarouselController(container, config);
}

// ─── Carousel Controller ─────────────────────────────────────

function initCarouselController(container) {
  let current = 0;
  const slides = container.querySelectorAll('.carousel-slide');
  const dots = container.querySelectorAll('.carousel-dot');
  const total = slides.length;

  function goTo(index) {
    // Deactivate current
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    stopVideos(slides[current]);

    // Compute new index
    current = ((index % total) + total) % total;

    // Lazy-load assets for new slide
    lazyLoadSlide(slides[current]);

    // Activate
    slides[current].classList.add('active');
    dots[current].classList.add('active');

    // Play & sync videos
    syncAndPlayVideos(slides[current]);
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  // Arrow listeners
  container.querySelector('.carousel-prev').addEventListener('click', prev);
  container.querySelector('.carousel-next').addEventListener('click', next);

  // Dot listeners
  dots.forEach(dot => {
    dot.addEventListener('click', () => goTo(parseInt(dot.dataset.slide)));
  });

  // Initial play
  syncAndPlayVideos(slides[0]);

  // Store for intersection observer
  container._carouselPause = () => {
    stopVideos(slides[current]);
  };
  container._carouselResume = () => {
    syncAndPlayVideos(slides[current]);
  };
}

// ─── Lazy Loading ────────────────────────────────────────────

function lazyLoadSlide(slideEl) {
  if (slideEl._loaded) return;

  slideEl.querySelectorAll('video source[data-src]').forEach(source => {
    source.src = source.dataset.src;
    source.removeAttribute('data-src');
    source.parentElement.load();
  });

  slideEl.querySelectorAll('img[data-src]').forEach(img => {
    img.src = img.dataset.src;
    img.removeAttribute('data-src');
  });

  slideEl._loaded = true;
}

// ─── Video Synchronization ───────────────────────────────────

function syncAndPlayVideos(slideEl) {
  const videos = Array.from(slideEl.querySelectorAll('video'));
  if (videos.length === 0) return;

  // Find the carousel container to check if it's hydrants or vases
  let carouselContainer = slideEl.closest('.comparison-carousel');
  const carouselName = carouselContainer?.dataset.carousel;
  const shouldSpeedUp = carouselName === 'hydrants' || carouselName === 'vases';
  const playbackRate = shouldSpeedUp ? 5.0 : 1.0;
  const applyPlaybackRate = (video) => {
    video.defaultPlaybackRate = playbackRate;
    video.playbackRate = playbackRate;
  };

  // Always set explicit playback speed so non-target carousels stay at 1x.
  videos.forEach(v => {
    applyPlaybackRate(v);
  });

  // Cancel any existing sync
  if (slideEl._syncRAF) {
    cancelAnimationFrame(slideEl._syncRAF);
    slideEl._syncRAF = null;
  }

  // Remove old listeners
  if (slideEl._onMasterEnded) {
    videos[0]?.removeEventListener('ended', slideEl._onMasterEnded);
    slideEl._onMasterEnded = null;
  }

  // Reset all to start
  videos.forEach(v => {
    v.currentTime = 0;
    v.muted = true;
    v.loop = false; // We manage looping ourselves for tighter sync
  });

  // Wait for all videos to be ready before starting sync
  let readyCount = 0;
  const totalVideos = videos.length;
  
  function checkReady() {
    readyCount++;
    if (readyCount < totalVideos) return;
    
    // All videos ready, start playback and sync
    startSync();
  }

  // Set up ready handlers
  videos.forEach(v => {
    if (v.readyState >= 2) { // HAVE_CURRENT_DATA or better
      checkReady();
    } else {
      const onCanPlay = () => {
        v.removeEventListener('canplay', onCanPlay);
        v.removeEventListener('loadedmetadata', onCanPlay);
        applyPlaybackRate(v);
        checkReady();
      };
      v.addEventListener('canplay', onCanPlay);
      v.addEventListener('loadedmetadata', onCanPlay);
    }
  });

  function startSync() {
    // Play all videos
    const playPromises = videos.map(v => {
      applyPlaybackRate(v);
      return v.play().catch(() => {});
    });
    
    Promise.all(playPromises).then(() => {
      // Small delay to let videos stabilize
      setTimeout(() => {
        // Find the shortest video to use as master (handles mismatched durations)
        let master = videos[0];
        let minDuration = master.duration || Infinity;
        videos.forEach(v => {
          if (v.duration && v.duration < minDuration) {
            minDuration = v.duration;
            master = v;
          }
        });

        // Sync loop: keep all videos aligned with master
        function syncLoop() {
          if (!master || master.paused || master.ended) {
            slideEl._syncRAF = requestAnimationFrame(syncLoop);
            return;
          }

          const masterTime = master.currentTime;
          if (isNaN(masterTime) || masterTime < 0) {
            slideEl._syncRAF = requestAnimationFrame(syncLoop);
            return;
          }

          for (let i = 0; i < videos.length; i++) {
            if (videos[i] === master) continue;
            
            if (videos[i].paused && !videos[i].ended) {
              applyPlaybackRate(videos[i]);
              videos[i].play().catch(() => {});
              continue;
            }
            
            if (videos[i].ended) {
              videos[i].currentTime = 0;
              applyPlaybackRate(videos[i]);
              videos[i].play().catch(() => {});
              continue;
            }
            
            const currentTime = videos[i].currentTime;
            if (isNaN(currentTime)) continue;
            
            const drift = Math.abs(currentTime - masterTime);
            // Increased threshold to reduce jitter, only sync if drift is significant
            if (drift > 0.25) {
              videos[i].currentTime = masterTime;
            }
          }

          slideEl._syncRAF = requestAnimationFrame(syncLoop);
        }

        // Handle loop: when master ends, restart all together
        function onMasterEnded() {
          videos.forEach(v => {
            v.currentTime = 0;
            applyPlaybackRate(v);
            v.play().catch(() => {});
          });
        }

        master.addEventListener('ended', onMasterEnded);
        slideEl._onMasterEnded = onMasterEnded;

        slideEl._syncRAF = requestAnimationFrame(syncLoop);
      }, 100);
    });
  }
}

function stopVideos(slideEl) {
  if (slideEl._syncRAF) {
    cancelAnimationFrame(slideEl._syncRAF);
    slideEl._syncRAF = null;
  }
  slideEl.querySelectorAll('video').forEach(v => {
    v.pause();
    v.currentTime = 0;
  });
}

// ─── Intersection Observer (play only when visible) ──────────

function setupIntersectionObserver() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const carousel = entry.target;
      if (entry.isIntersecting) {
        if (carousel._carouselResume) carousel._carouselResume();
      } else {
        if (carousel._carouselPause) carousel._carouselPause();
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('.comparison-carousel').forEach(c => observer.observe(c));
}

// ─── Initialization ──────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  // Set teaser video to 3x speed.
  const teaserVideo = document.querySelector('.teaser-section video');
  if (teaserVideo) teaserVideo.playbackRate = 1.7;

  // Build all carousels from data config
  Object.keys(DATASETS).forEach(key => {
    const container = document.querySelector(`[data-carousel="${key}"]`);
    if (!container) return;
    buildCarousel(container, DATASETS[key]);
  });

  // Set up viewport-based play/pause
  setupIntersectionObserver();
});
