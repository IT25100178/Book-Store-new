// src/components/about/AboutSection.jsx
import React, { useRef } from 'react';
import { TimelineContent } from './TimelineContent';
import { VerticalCutReveal } from './VerticalCutReveal';
import { Link } from 'react-router-dom';
import './AboutSection.css';

const ArrowRight = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide-icon">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

export default function AboutSection() {
  const heroRef = useRef(null);

  const revealVariants = {
    visible: (i) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: { delay: i * 0.4, duration: 0.5 },
    }),
    hidden: { filter: "blur(10px)", y: -20, opacity: 0 },
  };

  const scaleVariants = {
    visible: (i) => ({
      opacity: 1,
      filter: "blur(0px)",
      transition: { delay: i * 0.4, duration: 0.5 },
    }),
    hidden: { filter: "blur(10px)", opacity: 0 },
  };

  return (
    <section className="about3-section" ref={heroRef}>
      <div className="about3-container">
        
        <div className="about3-hero-area">
          {/* Header */}
          <div className="about3-header">
            <div className="about3-badge">
              <span className="about3-asterisk">✱</span>
              <TimelineContent as="span" animationNum={0} timelineRef={heroRef} customVariants={revealVariants}>
                WHO WE ARE
              </TimelineContent>
            </div>
            
            <div className="about3-socials">
              <TimelineContent as="a" animationNum={0} timelineRef={heroRef} customVariants={revealVariants} href="#" target="_blank" className="about3-social-icon">
                <img src="https://pro-section.ui-layouts.com/facebook.svg" alt="fb" />
              </TimelineContent>
              <TimelineContent as="a" animationNum={1} timelineRef={heroRef} customVariants={revealVariants} href="#" target="_blank" className="about3-social-icon">
                <img src="https://pro-section.ui-layouts.com/instagram.svg" alt="insta" />
              </TimelineContent>
              <TimelineContent as="a" animationNum={2} timelineRef={heroRef} customVariants={revealVariants} href="#" target="_blank" className="about3-social-icon">
                <img src="https://pro-section.ui-layouts.com/linkedin.svg" alt="linkedin" />
              </TimelineContent>
              <TimelineContent as="a" animationNum={3} timelineRef={heroRef} customVariants={revealVariants} href="#" target="_blank" className="about3-social-icon">
                <img src="https://pro-section.ui-layouts.com/youtube.svg" alt="youtube" />
              </TimelineContent>
            </div>
          </div>

          <TimelineContent as="figure" animationNum={4} timelineRef={heroRef} customVariants={scaleVariants} className="about3-figure">
            <svg className="w-full" width="100%" height="100%" viewBox="0 0 100 40">
              <defs>
                <clipPath id="clip-inverted" clipPathUnits="objectBoundingBox">
                  <path
                    d="M0.0998072 1H0.422076H0.749756C0.767072 1 0.774207 0.961783 0.77561 0.942675V0.807325C0.777053 0.743631 0.791844 0.731953 0.799059 0.734076H0.969813C0.996268 0.730255 1.00088 0.693206 0.999875 0.675159V0.0700637C0.999875 0.0254777 0.985045 0.00477707 0.977629 0H0.902473C0.854975 0 0.890448 0.138535 0.850165 0.138535H0.0204424C0.00408849 0.142357 0 0.180467 0 0.199045V0.410828C0 0.449045 0.0136283 0.46603 0.0204424 0.469745H0.0523086C0.0696245 0.471019 0.0735527 0.497877 0.0733523 0.511146V0.915605C0.0723903 0.983121 0.090588 1 0.0998072 1Z"
                    fill="#D9D9D9"
                  />
                </clipPath>
              </defs>
              <image
                clipPath="url(#clip-inverted)"
                preserveAspectRatio="xMidYMid slice"
                width="100%"
                height="100%"
                xlinkHref="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1200&auto=format&fit=crop"
              ></image>
            </svg>
          </TimelineContent>

          {/* Stats */}
          <div className="about3-stats-wrapper">
            <TimelineContent as="div" animationNum={5} timelineRef={heroRef} customVariants={revealVariants} className="about3-stat-block">
              <span className="stat-num">100+</span>
              <span className="stat-text">years of history</span>
              <span className="stat-div">|</span>
              <span className="stat-num">3 million</span>
              <span className="stat-text">pages read</span>
            </TimelineContent>
            
            <div className="about3-stat-block right">
              <TimelineContent as="div" animationNum={6} timelineRef={heroRef} customVariants={revealVariants} className="stat-num-large">
                <span>100+</span>
                <span className="stat-text uppercase">collections</span>
              </TimelineContent>
              <TimelineContent as="div" animationNum={7} timelineRef={heroRef} customVariants={revealVariants} className="stat-percent">
                <span className="stat-num">100%</span>
                <span className="stat-text">authentic first editions</span>
              </TimelineContent>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="about3-content-grid">
          <div className="about3-text-column">
            <h1 className="about3-main-title">
              <VerticalCutReveal
                splitBy="words"
                staggerDuration={0.1}
                staggerFrom="first"
                reverse={true}
                transition={{ type: "spring", stiffness: 250, damping: 30, delay: 1 }}
              >
                Curating Books That Make a Difference.
              </VerticalCutReveal>
            </h1>

            <TimelineContent as="div" animationNum={9} timelineRef={heroRef} customVariants={revealVariants} className="about3-paragraphs">
              <TimelineContent as="div" animationNum={10} timelineRef={heroRef} customVariants={revealVariants}>
                <p>
                  Our journey began as a passionate pursuit of rare books and evolved into a luxury sanctuary for bibliophiles. We specialize in transforming private libraries into legendary collections.
                </p>
              </TimelineContent>
              <TimelineContent as="div" animationNum={11} timelineRef={heroRef} customVariants={revealVariants}>
                <p>
                  Every book has a story, and we specialize in finding the ones that resonate with you. By blending historical significance with aesthetic beauty, we curate literature that leaves an impact.
                </p>
              </TimelineContent>
            </TimelineContent>
          </div>

          <div className="about3-action-column">
            <TimelineContent as="div" animationNum={12} timelineRef={heroRef} customVariants={revealVariants} className="about3-brand-name">
              LUXURY BOOKS
            </TimelineContent>
            <TimelineContent as="div" animationNum={13} timelineRef={heroRef} customVariants={revealVariants} className="about3-brand-title">
              Curator | Collector
            </TimelineContent>

            <TimelineContent as="div" animationNum={14} timelineRef={heroRef} customVariants={revealVariants} className="about3-call-text">
              <p>Ready to transform your private collection with first editions?</p>
            </TimelineContent>

            <Link to="/contact" style={{ textDecoration: 'none' }}>
              <TimelineContent as="span" animationNum={15} timelineRef={heroRef} customVariants={revealVariants} className="about3-cta-btn">
                LET'S COLLABORATE <ArrowRight />
              </TimelineContent>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
