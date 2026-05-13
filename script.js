// script.js - KL Flex Hero Frame-by-Frame Scroll-Driven Experience
// Runs after GSAP + ScrollTrigger are loaded (bottom of index.html)

(function () {
    "use strict";

    gsap.registerPlugin(ScrollTrigger);

    // ── Preloader Logic ─────────────────────────────────
    document.body.style.overflow = "hidden"; // Block scroll while loading

    const tlPreloader = gsap.timeline();

    tlPreloader
        .fromTo("#pl-logo", { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" })
        .fromTo("#pl-label", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, "-=0.6")
        .fromTo("#pl-hook", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1.2, ease: "power3.out" }, "-=0.4")
        .fromTo(["#pl-bar-bg", "#pl-percentage"], { opacity: 0 }, { opacity: 1, duration: 0.5 }, "-=0.5");

    let preloaderMinTimeDone = false;
    let framesAllLoaded = false;

    // Minimum reading time for the hook (3.5 seconds)
    setTimeout(() => {
        preloaderMinTimeDone = true;
        checkPreloaderEnd();
    }, 3500);

    function checkPreloaderEnd() {
        if (preloaderMinTimeDone && framesAllLoaded) {
            gsap.to("#klflex-preloader", {
                opacity: 0,
                duration: 1,
                ease: "power2.inOut",
                onComplete: () => {
                    document.getElementById("klflex-preloader").style.display = "none";
                    document.body.style.overflow = ""; // Restore scroll
                    
                    // ── Entrance Animations ─────────────────────────────
                    gsap.fromTo(".hero-nav",
                        { y: -20, opacity: 0 },
                        { y: 0, opacity: 1, duration: 1.2, ease: "power3.out" }
                    );
                    gsap.fromTo(".step-intro",
                        { y: 30, opacity: 0 },
                        { y: 0, opacity: 1, duration: 1.5, ease: "power3.out", delay: 0.3 }
                    );
                }
            });
        }
    }

    // ── Canvas Setup ────────────────────────────────────
    const canvas = document.getElementById("hero-canvas");
    const ctx = canvas.getContext("2d");

    const frameCount = 241;
    const preloaderTargetFrames = 30; // Number of frames required before unlocking the site
    const framePath = (i) =>
        `assets/frames-webp/frame_${String(i + 1).padStart(4, "0")}.webp`;

    const images = new Array(frameCount);
    let loadedCount = 0;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function render(rawIndex) {
        const idx = Math.min(Math.max(Math.round(rawIndex), 0), frameCount - 1);
        const img = images[idx];
        if (!img || !img.complete || img.naturalWidth === 0) return;

        const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
        const x = (canvas.width - img.width * scale) / 2;
        const y = (canvas.height - img.height * scale) / 2;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, img.width, img.height, x, y, img.width * scale, img.height * scale);
    }

    // Size canvas immediately
    resizeCanvas();

    // Preload all frames
    for (let i = 0; i < frameCount; i++) {
        const img = new Image();
        
        const handleLoad = () => {
            loadedCount++;
            
            // Update Preloader Bar based on the target of 30 frames
            if (loadedCount <= preloaderTargetFrames) {
                const pct = Math.floor((loadedCount / preloaderTargetFrames) * 100);
                document.getElementById("pl-bar-fill").style.width = Math.min(pct, 100) + "%";
                document.getElementById("pl-percentage").innerText = Math.min(pct, 100) + "%";
            }

            // Render frame 0 as soon as it arrives
            if (i === 0) render(0);

            if (loadedCount === preloaderTargetFrames && !framesAllLoaded) {
                framesAllLoaded = true;
                checkPreloaderEnd();
            }
        };

        img.onload = handleLoad;
        img.onerror = handleLoad; // Count errors as loaded so it doesn't hang

        img.src = framePath(i);
        images[i] = img;
    }

    window.addEventListener("resize", () => {
        resizeCanvas();
        render(seq.frame);
    });

    // ── Scroll-Driven Frame Sequence ────────────────────
    const seq = { frame: 0 };

    const master = gsap.timeline({
        scrollTrigger: {
            trigger: "#hero-sequence",
            start: "top top",
            end: "bottom bottom",
            scrub: 0.5,               // 0.5 = smooth dampening lag for 60fps feel
            invalidateOnRefresh: true,
        },
    });

    // Frame animation: 0 → 241 over the full timeline
    master.to(seq, {
        frame: frameCount - 1,
        snap: "frame",
        ease: "none",
        duration: 10,
        onUpdate: () => render(seq.frame),
    }, 0);

    // ── Text Panel Sequencing ───────────────────────────
    const panels = gsap.utils.toArray(".step-panel");
    const total = panels.length;       // 9 (intro + 8 benefits)
    const slot = 10 / total;           // each panel's duration share

    panels.forEach((panel, i) => {
        const t = i * slot;

        if (i === 0) {
            // Intro fades out in its second half
            master.to(panel, {
                autoAlpha: 0,
                y: -50,
                duration: slot * 0.45,
                ease: "power2.in",
            }, t + slot * 0.55);
        } else {
            // Fade in
            master.fromTo(panel,
                { autoAlpha: 0, y: 50 },
                { autoAlpha: 1, y: 0, duration: slot * 0.3, ease: "power2.out" },
                t + slot * 0.05
            );
            // Fade out (except last panel)
            if (i < total - 1) {
                master.to(panel, {
                    autoAlpha: 0,
                    y: -50,
                    duration: slot * 0.3,
                    ease: "power2.in",
                }, t + slot * 0.7);
            }
        }
    });

    // ── Scroll Indicator Fade ───────────────────────────
    gsap.to(".hero-scroll-indicator", {
        opacity: 0,
        y: 20,
        ease: "power2.inOut",
        scrollTrigger: {
            trigger: "#hero-sequence",
            start: "top top",
            end: "+=400",
            scrub: 1,
        },
    });

    // ══════════════════════════════════════════════════════
    //  SECTION 2 — CHESTERFIELD 2.5D PARALLAX ENGINE
    // ══════════════════════════════════════════════════════

    const viewport = document.querySelector(".chester-viewport");

    if (viewport) {
        const layers = viewport.querySelectorAll(".chester-layer");
        const glow   = viewport.querySelector(".chester-glow");

        // ── Mouse Parallax ──────────────────────────────
        let mouseX = 0, mouseY = 0;
        let currentX = 0, currentY = 0;
        let rafId = null;

        function lerp(a, b, t) {
            return a + (b - a) * t;
        }

        function updateParallax() {
            // Smoothly interpolate towards the target
            currentX = lerp(currentX, mouseX, 0.08);
            currentY = lerp(currentY, mouseY, 0.08);

            layers.forEach(layer => {
                const depth = parseFloat(layer.dataset.depth) || 0;
                const moveX = currentX * depth * 50;
                const moveY = currentY * depth * 30;
                layer.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
            });

            // Gold glow follows mouse (inverted, slower)
            if (glow) {
                const glowX = currentX * 25;
                const glowY = currentY * 20;
                glow.style.transform = `translate(calc(-50% + ${glowX}px), calc(-50% + ${glowY}px))`;
            }

            rafId = requestAnimationFrame(updateParallax);
        }

        viewport.addEventListener("mousemove", (e) => {
            const rect = viewport.getBoundingClientRect();
            // Normalize to -1 … +1
            mouseX = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
            mouseY = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;
        });

        viewport.addEventListener("mouseleave", () => {
            // Ease back to center
            mouseX = 0;
            mouseY = 0;
        });

        // Start the animation loop
        rafId = requestAnimationFrame(updateParallax);

        // ── Scroll-Triggered Entrance ───────────────────
        // Pin the section briefly while furniture enters
        const chesterTL = gsap.timeline({
            scrollTrigger: {
                trigger: "#chesterfield-showcase",
                start: "top 80%",
                end: "top 20%",
                scrub: false,
                once: true,
            },
        });

        // Text elements stagger in
        chesterTL
            .to(".chester-text-badge", {
                opacity: 1, y: 0, duration: 0.8, ease: "power3.out",
            })
            .to(".chester-title", {
                opacity: 1, y: 0, duration: 1, ease: "power3.out",
            }, "-=0.5")
            .to(".chester-subtitle", {
                opacity: 1, y: 0, duration: 0.8, ease: "power3.out",
            }, "-=0.6")
            .to(".chester-cta", {
                opacity: 1, y: 0, duration: 0.8, ease: "power3.out",
            }, "-=0.5")
            .to(".chester-hint", {
                opacity: 1, y: 0, duration: 0.6, ease: "power3.out",
            }, "-=0.4");

        // Furniture entrance (scale up from slightly smaller)
        gsap.fromTo(".chester-layer-sofa", 
            { opacity: 0, scale: 0.9, y: 60 },
            {
                opacity: 1, scale: 1, y: 0,
                duration: 1.4,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: "#chesterfield-showcase",
                    start: "top 75%",
                    once: true,
                },
            }
        );

        gsap.fromTo(".chester-layer-poltrona",
            { opacity: 0, scale: 0.85, y: 80, x: -40 },
            {
                opacity: 1, scale: 1, y: 0, x: 0,
                duration: 1.6,
                ease: "power3.out",
                delay: 0.3,
                scrollTrigger: {
                    trigger: "#chesterfield-showcase",
                    start: "top 75%",
                    once: true,
                },
            }
        );

        // Gold glow entrance
        gsap.fromTo(".chester-glow",
            { opacity: 0, scale: 0.5 },
            {
                opacity: 1, scale: 1,
                duration: 2,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: "#chesterfield-showcase",
                    start: "top 70%",
                    once: true,
                },
            }
        );

        // Hotspots fade in after furniture
        gsap.fromTo(".hotspot-wrapper",
            { opacity: 0, scale: 0 },
            {
                opacity: 1, scale: 1,
                duration: 0.6,
                stagger: 0.15,
                ease: "back.out(2)",
                delay: 1.2,
                scrollTrigger: {
                    trigger: "#chesterfield-showcase",
                    start: "top 75%",
                    once: true,
                },
            }
        );
    }

    // ══════════════════════════════════════════════════════
    //  SECTION 3 — POLTRONA RECLINÁVEL SCROLL SHOWCASE
    // ══════════════════════════════════════════════════════

    const poltronaSection = document.getElementById("poltrona-showcase");

    if (poltronaSection) {

        // ── Section Header Entrance ─────────────────────
        const headerElements = poltronaSection.querySelectorAll(
            ".poltrona-section-header h2, .poltrona-section-header p, .poltrona-section-header .inline-flex"
        );

        gsap.to(headerElements, {
            opacity: 1,
            y: 0,
            duration: 1,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: {
                trigger: ".poltrona-section-header",
                start: "top 80%",
                once: true,
            },
        });

        // ── References ──────────────────────────────────
        const imageStage  = poltronaSection.querySelector(".poltrona-image-stage");
        const img1        = poltronaSection.querySelector(".poltrona-img-1");
        const img2        = poltronaSection.querySelector(".poltrona-img-2");
        const img3        = poltronaSection.querySelector(".poltrona-img-3");
        const text1       = poltronaSection.querySelector(".poltrona-text-1");
        const text2       = poltronaSection.querySelector(".poltrona-text-2");
        const text3       = poltronaSection.querySelector(".poltrona-text-3");
        const reflection  = poltronaSection.querySelector(".poltrona-reflection");
        const ambientGlow = poltronaSection.querySelector(".poltrona-ambient-glow");
        const progress    = poltronaSection.querySelector(".poltrona-progress");
        const dot1        = poltronaSection.querySelector(".poltrona-dot-1");
        const dot2        = poltronaSection.querySelector(".poltrona-dot-2");
        const dot3        = poltronaSection.querySelector(".poltrona-dot-3");
        const progressLabel = poltronaSection.querySelector(".poltrona-progress-label");

        // ── Initial Entrance (Stage 1) - Non-Scrubbed ──
        // Aparece naturalmente ao chegar na seção, com efeito premium
        const stage1Entrance = ScrollTrigger.create({
            trigger: ".poltrona-scroll-container",
            start: "top 75%",
            once: true,
            onEnter: () => {
                // Animação cinematográfica para a imagem
                gsap.fromTo(img1, 
                    { scale: 0.85, opacity: 0, filter: "blur(15px)" }, 
                    { scale: 1, opacity: 1, filter: "blur(0px)", duration: 2, ease: "expo.out" }
                );
                // Animação fluida para o texto vindo da direita
                gsap.fromTo(text1, 
                    { opacity: 0, x: 50, y: "-50%" }, 
                    { opacity: 1, x: 0, y: "-50%", duration: 1.8, ease: "expo.out", delay: 0.3 }
                );
                // Detalhes extras de UI
                gsap.to([ambientGlow, progress], { 
                    opacity: 1, duration: 1.5, ease: "power2.out", delay: 0.6 
                });
                gsap.to(reflection, { 
                    opacity: 0.4, duration: 1.5, ease: "power2.out", delay: 0.6 
                });
            }
        });

        // ── Master Timeline (Scrubbed) ──────────────────
        const poltronaTL = gsap.timeline({
            scrollTrigger: {
                trigger: ".poltrona-scroll-container",
                start: "top top",
                end: "bottom bottom",
                scrub: 0.8,
                invalidateOnRefresh: true,
            },
        });

        // Total duration units: 10
        // Stage 1: 0 → 3.33  |  Stage 2: 3.33 → 6.66  |  Stage 3: 6.66 → 10
        const D = 10;
        const S = D / 3; // ~3.33 per stage

        // O usuário tem o período de 0 a t1Start apenas para ler o texto 1, sem animações amarradas ao scroll.

        // ── TRANSITION 1→2 ──────────────────────────────
        // Text 1 fades out + Image moves to RIGHT + Crossfade img1→img2 + Text 2 fades in (LEFT side)
        const t1Start = S * 0.65; // Transition begins at ~65% of stage 1

        poltronaTL
            // Text 1 OUT
            .to(text1, {
                opacity: 0, x: -40, duration: S * 0.3, ease: "power2.in",
            }, t1Start)
            // Image 1 crossfade OUT (blur + fade)
            .to(img1, {
                opacity: 0, scale: 0.95, duration: S * 0.4, ease: "power2.inOut",
            }, t1Start + S * 0.1)
            // Image stage MOVES RIGHT (Z-pattern)
            .to(imageStage, {
                left: "52%", duration: S * 0.5, ease: "power2.inOut",
            }, t1Start + S * 0.1)
            // Image 2 crossfade IN
            .fromTo(img2,
                { opacity: 0, scale: 1.05 },
                { opacity: 1, scale: 1, duration: S * 0.4, ease: "power2.inOut" },
                t1Start + S * 0.25
            )
            // Text 2 IN from left
            .fromTo(text2,
                { opacity: 0, x: -60, y: "-50%" },
                { opacity: 1, x: 0, y: "-50%", duration: S * 0.4, ease: "power3.out" },
                t1Start + S * 0.35
            )
            // Progress dot update: dot1 shrinks, dot2 grows
            .to(dot1, {
                scale: 1, backgroundColor: "#d6d3d1", duration: S * 0.2,
            }, t1Start + S * 0.2)
            .to(dot2, {
                scale: 1.3, backgroundColor: "#C88B1D", duration: S * 0.2,
            }, t1Start + S * 0.2);

        // Update label via onUpdate
        // We'll handle this in a simpler way: labels update via a tween

        // ── STAGE 2 HOLD ────────────────────────────────
        // (Everything stays for a moment between t1End and t2Start)

        // ── TRANSITION 2→3 ──────────────────────────────
        const t2Start = S + S * 0.65; // ~65% into stage 2

        poltronaTL
            // Text 2 OUT
            .to(text2, {
                opacity: 0, x: 40, duration: S * 0.3, ease: "power2.in",
            }, t2Start)
            // Image 2 crossfade OUT
            .to(img2, {
                opacity: 0, scale: 0.95, duration: S * 0.4, ease: "power2.inOut",
            }, t2Start + S * 0.1)
            // Image stage MOVES BACK LEFT (Z-pattern return)
            .to(imageStage, {
                left: "8%", duration: S * 0.5, ease: "power2.inOut",
            }, t2Start + S * 0.1)
            // Image 3 crossfade IN
            .fromTo(img3,
                { opacity: 0, scale: 1.05 },
                { opacity: 1, scale: 1, duration: S * 0.4, ease: "power2.inOut" },
                t2Start + S * 0.25
            )
            // Text 3 IN from right
            .fromTo(text3,
                { opacity: 0, x: 60, y: "-50%" },
                { opacity: 1, x: 0, y: "-50%", duration: S * 0.4, ease: "power3.out" },
                t2Start + S * 0.35
            )
            // Progress dot update: dot2 shrinks, dot3 grows
            .to(dot2, {
                scale: 1, backgroundColor: "#d6d3d1", duration: S * 0.2,
            }, t2Start + S * 0.2)
            .to(dot3, {
                scale: 1.3, backgroundColor: "#C88B1D", duration: S * 0.2,
            }, t2Start + S * 0.2);

        // ── Progress Label Update via ScrollTrigger ──────
        ScrollTrigger.create({
            trigger: ".poltrona-scroll-container",
            start: "top top",
            end: "bottom bottom",
            scrub: true,
            onUpdate: (self) => {
                const p = self.progress;
                if (progressLabel) {
                    if (p < 0.33)      progressLabel.textContent = "01 / 03";
                    else if (p < 0.66) progressLabel.textContent = "02 / 03";
                    else               progressLabel.textContent = "03 / 03";
                }
            },
        });
    }

    // ══════════════════════════════════════════════════════
    //  SECTION 4 — POLTRONA DE CINEMA STICKY SPLIT-SCREEN
    // ══════════════════════════════════════════════════════

    const cinemaSection = document.getElementById("cinema-showcase");

    if (cinemaSection) {

        // ── Section Header Entrance ─────────────────────
        const cinemaHeaderEls = cinemaSection.querySelectorAll(".cinema-header-el");

        gsap.to(cinemaHeaderEls, {
            opacity: 1,
            y: 0,
            duration: 1,
            stagger: 0.2,
            ease: "power3.out",
            scrollTrigger: {
                trigger: ".cinema-section-header",
                start: "top 80%",
                once: true,
            },
        });

        // ── References ──────────────────────────────────
        const cinemaBlocks   = cinemaSection.querySelectorAll(".cinema-block");
        const cinemaFrontal  = cinemaSection.querySelector(".cinema-img-frontal");
        const cinema45       = cinemaSection.querySelector(".cinema-img-45");
        const cinemaGlow     = cinemaSection.querySelector(".cinema-glow");
        const cinemaViewLabel = cinemaSection.querySelector(".cinema-view-label");
        const cinemaViewDot1 = cinemaSection.querySelector(".cinema-view-dot-1");
        const cinemaViewDot2 = cinemaSection.querySelector(".cinema-view-dot-2");
        const cinemaViewText = cinemaSection.querySelector(".cinema-view-text");

        // ── Block Entrance Animations ───────────────────
        // Each block fades in when it enters the viewport
        cinemaBlocks.forEach((block) => {
            ScrollTrigger.create({
                trigger: block,
                start: "top 85%",
                once: true,
                onEnter: () => {
                    block.classList.add("is-visible");
                },
            });
        });

        // Show view label once first block enters
        ScrollTrigger.create({
            trigger: cinemaBlocks[0],
            start: "top 80%",
            once: true,
            onEnter: () => {
                if (cinemaViewLabel) cinemaViewLabel.classList.add("is-visible");
            },
        });

        // ── Image Crossfade via IntersectionObserver ────
        // We observe each block. When a block with data-cinema-view="45"
        // enters the center of the viewport, we crossfade to the 45° image.
        // When a "frontal" block is centered, we switch back.

        let currentView = "frontal";

        function setCinemaView(view) {
            if (view === currentView) return;
            currentView = view;

            if (view === "45") {
                // Crossfade: frontal → 45°
                gsap.to(cinemaFrontal, {
                    opacity: 0,
                    scale: 0.97,
                    duration: 0.8,
                    ease: "power2.inOut",
                });
                gsap.to(cinema45, {
                    opacity: 1,
                    scale: 1,
                    duration: 0.8,
                    ease: "power2.inOut",
                });

                // Glow pulse
                if (cinemaGlow) cinemaGlow.classList.add("is-active");
                setTimeout(() => {
                    if (cinemaGlow) cinemaGlow.classList.remove("is-active");
                }, 1200);

                // View indicator
                if (cinemaViewDot1) {
                    cinemaViewDot1.style.transform = "scale(1)";
                    cinemaViewDot1.style.backgroundColor = "#d6d3d1";
                }
                if (cinemaViewDot2) {
                    cinemaViewDot2.style.transform = "scale(1.3)";
                    cinemaViewDot2.style.backgroundColor = "#C88B1D";
                }
                if (cinemaViewText) cinemaViewText.textContent = "45°";

            } else {
                // Crossfade: 45° → frontal
                gsap.to(cinema45, {
                    opacity: 0,
                    scale: 0.97,
                    duration: 0.8,
                    ease: "power2.inOut",
                });
                gsap.to(cinemaFrontal, {
                    opacity: 1,
                    scale: 1,
                    duration: 0.8,
                    ease: "power2.inOut",
                });

                // Glow pulse
                if (cinemaGlow) cinemaGlow.classList.add("is-active");
                setTimeout(() => {
                    if (cinemaGlow) cinemaGlow.classList.remove("is-active");
                }, 1200);

                // View indicator
                if (cinemaViewDot1) {
                    cinemaViewDot1.style.transform = "scale(1.3)";
                    cinemaViewDot1.style.backgroundColor = "#C88B1D";
                }
                if (cinemaViewDot2) {
                    cinemaViewDot2.style.transform = "scale(1)";
                    cinemaViewDot2.style.backgroundColor = "#d6d3d1";
                }
                if (cinemaViewText) cinemaViewText.textContent = "Frontal";
            }
        }

        // Active block tracking (gold left border)
        let currentActiveBlock = null;

        function setActiveBlock(block) {
            if (block === currentActiveBlock) return;
            if (currentActiveBlock) currentActiveBlock.classList.remove("is-active");
            block.classList.add("is-active");
            currentActiveBlock = block;
        }

        // IntersectionObserver: watches when blocks cross the center of the viewport
        const cinemaObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const view = entry.target.dataset.cinemaView;
                        if (view) setCinemaView(view);
                        setActiveBlock(entry.target);
                    }
                });
            },
            {
                // rootMargin: Only trigger when the block's top edge is within
                // the middle 20% of the viewport (40% from top, 40% from bottom)
                rootMargin: "-40% 0px -40% 0px",
                threshold: 0,
            }
        );

        cinemaBlocks.forEach((block) => cinemaObserver.observe(block));
    }

    // ══════════════════════════════════════════════════════
    //  SECTION 5 — BENTO GRID "LINHA RESIDENCIAL"
    // ══════════════════════════════════════════════════════

    const bentoSection = document.getElementById("bento-residencial");

    if (bentoSection) {

        // ── Section Header Entrance ─────────────────────
        const bentoHeaderEls = bentoSection.querySelectorAll(".bento-header-el");

        gsap.to(bentoHeaderEls, {
            opacity: 1,
            y: 0,
            duration: 1,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: {
                trigger: ".bento-section-header",
                start: "top 80%",
                once: true,
            },
        });

        // ── Card Staggered Entrance ─────────────────────
        const bentoCards = bentoSection.querySelectorAll(".bento-card");

        bentoCards.forEach((card, index) => {
            gsap.to(card, {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.8,
                delay: index * 0.08,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: card,
                    start: "top 90%",
                    once: true,
                    onEnter: () => {
                        card.classList.add("is-visible");
                    },
                },
            });
        });

        // ── CTA Entrance ────────────────────────────────
        const bentoCta = bentoSection.querySelector(".bento-cta");

        if (bentoCta) {
            ScrollTrigger.create({
                trigger: bentoCta,
                start: "top 90%",
                once: true,
                onEnter: () => {
                    gsap.to(bentoCta, {
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                        ease: "power3.out",
                        onComplete: () => bentoCta.classList.add("is-visible"),
                    });
                },
            });
        }
    }

})();

