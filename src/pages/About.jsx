import React from 'react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <>
      
    {/*  ═══════════════════════════════════════════════════════
         PAGE HEADER
    ═══════════════════════════════════════════════════════  */}

    <section className="about-hero reveal" style={{"marginBottom":"4rem"}}>
      <div className="section-header">
        <div className="badge-hud">
          SAGE 1.0 // SYSTEM ONLINE
        </div>

        <h2>
          ABOUT <span className="text-gradient">SAGE 1.0</span>
        </h2>

        <p>
          An Integrated Engineering Challenge powered by
          <span style={{"color":"var(--cyan)","fontWeight":"700"}}>
            SAGE 1.0
          </span>,
          organized by the IE(I) Mechanical &amp; Production Students'
          Chapter, BVM.
        </p>
      </div>
    </section>


    {/*  ═══════════════════════════════════════════════════════
         SAGE × SAGE INTRODUCTION
    ═══════════════════════════════════════════════════════  */}

    <section style={{"marginBottom":"4rem"}}>
      <div
        className="glass-card reveal"
        style={{"position":"relative","overflow":"hidden","borderColor":"var(--cyan-border)"}}
      >

        {/*  HUD accent  */}
        <div
          style={{"position":"absolute","top":"0","left":"0","right":"0","height":"2px","background":"linear-gradient(\n              90deg,\n              transparent,\n              var(--cyan),\n              transparent\n            )","boxShadow":"0 0 15px var(--cyan)"}}
        ></div>

        <div
          style={{"display":"grid","gridTemplateColumns":"repeat(auto-fit, minmax(min(100%, 280px), 1fr))","gap":"2.5rem","alignItems":"center"}}
        >

          {/*  MAIN CONTENT  */}
          <div>

            <div
              style={{"display":"flex","alignItems":"center","gap":".75rem","marginBottom":"1.25rem"}}
            >
              <div
                style={{"width":"32px","height":"1px","background":"var(--cyan)","boxShadow":"0 0 8px var(--cyan)"}}
              ></div>

              <span
                style={{"fontFamily":"var(--font-heading)","fontSize":".72rem","letterSpacing":".18em","color":"var(--cyan)","textTransform":"uppercase"}}
              >
                EVENT OVERVIEW
              </span>
            </div>


            <h3
              style={{"color":"#fff","fontSize":"1.45rem","marginBottom":"1.25rem","letterSpacing":".04em"}}
            >
              SAGE 1.0
              <span
                style={{"color":"var(--cyan)","fontSize":".85rem","letterSpacing":".12em"}}
              >
                // POWERED BY SAGE
              </span>
            </h3>


            <p
              style={{"lineHeight":"1.9","marginBottom":"1.25rem","fontSize":"1rem","color":"var(--text-main)"}}
            >
              SAGE 1.0 is an integrated engineering challenge designed
              to bring together students who think, design, build and
              innovate. It creates a platform where engineering knowledge
              moves beyond classrooms and into practical challenges,
              teamwork and problem-solving.
            </p>


            <p
              style={{"lineHeight":"1.9","fontSize":".95rem"}}
            >
              The experience combines multiple engineering disciplines
              through competitive challenges, encouraging participants to
              demonstrate creativity, technical understanding, practical
              ability and decision-making under real-world constraints.
            </p>

          </div>


          {/*  SAGE SYSTEM RADAR PANEL  */}
          <div
            style={{"position":"relative","minHeight":"260px","display":"flex","alignItems":"center","justifyContent":"center"}}
          >
            <div className="j1-radar" style={{"transform":"scale(0.8)","transformOrigin":"center center"}}>
              {/*  Concentric rings  */}
              <div className="j1-ring j1-ring-1"></div>
              <div className="j1-ring j1-ring-2"></div>
              <div className="j1-ring j1-ring-3"></div>

              {/*  Scan line  */}
              <div className="j1-scan-arm"></div>

              {/*  Core node  */}
              <div className="j1-radar-core">
                <span className="j1-core-label">S</span>
                <span className="j1-core-ver">1.0</span>
              </div>

              {/*  Orbit dots  */}
              <span className="j1-orbit-dot j1-od-1"></span>
              <span className="j1-orbit-dot j1-od-2"></span>
              <span className="j1-orbit-dot j1-od-3"></span>
              <span className="j1-orbit-dot j1-od-4"></span>

              {/*  Data labels around radar  */}
              <div className="j1-radar-label j1-rl-tl">
                <span className="j1-rl-title">SYS ONLINE</span>
                <span className="j1-rl-val">SAGE.01.CORE</span>
              </div>
              <div className="j1-radar-label j1-rl-tr">
                <span className="j1-rl-title">04 TRACKS</span>
                <span className="j1-rl-val">13 ROUNDS</span>
              </div>
              <div className="j1-radar-label j1-rl-bl">
                <span className="j1-rl-title">ENGINEERING</span>
                <span className="j1-rl-val">INTEGRATED</span>
              </div>
              <div className="j1-radar-label j1-rl-br">
                <span className="j1-rl-title">VERIFIED</span>
                <span className="j1-rl-val">IE(I) BVM</span>
              </div>

              {/*  Crosshair lines  */}
              <div className="j1-crosshair j1-ch-h"></div>
              <div className="j1-crosshair j1-ch-v"></div>
            </div>
          </div>

        </div>
      </div>
    </section>


    {/*  ═══════════════════════════════════════════════════════
         EVENT SCALE
    ═══════════════════════════════════════════════════════  */}

    <section style={{"marginBottom":"4rem"}}>

      <div
        style={{"display":"flex","alignItems":"center","gap":".75rem","marginBottom":"2rem"}}
        className="reveal"
      >
        <span
          style={{"fontFamily":"var(--font-heading)","fontSize":".72rem","letterSpacing":".18em","color":"var(--cyan)","textTransform":"uppercase"}}
        >
          SAGE SYSTEM
        </span>

        <div
          style={{"flex":"1","height":"1px","background":"linear-gradient(\n              to right,\n              var(--cyan-border),\n              transparent\n            )"}}
        ></div>
      </div>


      <div
        className="about-stats-grid"
        style={{"display":"grid","gridTemplateColumns":"repeat(auto-fit, minmax(min(100%, 160px), 1fr))","gap":"1rem"}}
      >

        <div className="about-stat-block reveal reveal-delay-1">
          <span className="about-stat-value">07</span>
          <span className="about-stat-label">
            ENGINEERING EVENTS
          </span>
        </div>


        <div className="about-stat-block reveal reveal-delay-2">
          <span className="about-stat-value">01</span>
          <span className="about-stat-label">
            UNIFIED PLATFORM
          </span>
        </div>


        <div className="about-stat-block reveal reveal-delay-3">
          <span className="about-stat-value">1.0</span>
          <span className="about-stat-label">
            SAGE SYSTEM
          </span>
        </div>

      </div>
    </section>


    {/*  ═══════════════════════════════════════════════════════
         CORE PILLARS
    ═══════════════════════════════════════════════════════  */}

    <section style={{"marginBottom":"4rem"}}>

      <div
        style={{"display":"flex","alignItems":"center","gap":".75rem","marginBottom":"2rem"}}
        className="reveal"
      >

        <span
          style={{"fontFamily":"var(--font-heading)","fontSize":".72rem","letterSpacing":".18em","color":"var(--cyan)","textTransform":"uppercase"}}
        >
          CORE PRINCIPLES
        </span>

        <div
          style={{"flex":"1","height":"1px","background":"linear-gradient(\n              to right,\n              var(--cyan-border),\n              transparent\n            )"}}
        ></div>

      </div>


      <div className="capability-grid">

        <div
          className="capability-module reveal reveal-delay-1"
          style={{"--module-accent":"var(--cyan)"}}
        >
          <div className="cm-number">01 // DESIGN</div>
          <div className="cm-icon">&#9998;</div>

          <div className="cm-title">
            DESIGN
          </div>

          <p className="cm-desc">
            Transform ideas into precise engineering concepts through
            creativity, technical thinking, digital design and structured
            problem-solving.
          </p>
        </div>


        <div
          className="capability-module reveal reveal-delay-2"
          style={{"--module-accent":"var(--orange)"}}
        >
          <div className="cm-number">02 // BUILD</div>
          <div className="cm-icon">&#9881;</div>

          <div className="cm-title">
            BUILD
          </div>

          <p className="cm-desc">
            Turn concepts into practical solutions by applying hands-on
            engineering skills, resourcefulness, fabrication and teamwork.
          </p>
        </div>


        <div
          className="capability-module reveal reveal-delay-3"
          style={{"--module-accent":"var(--violet)"}}
        >
          <div className="cm-number">03 // INNOVATE</div>
          <div className="cm-icon">&#9889;</div>

          <div className="cm-title">
            INNOVATE
          </div>

          <p className="cm-desc">
            Approach engineering problems with creative thinking,
            technology-driven ideas and solutions designed for real-world
            challenges.
          </p>
        </div>


        <div
          className="capability-module reveal reveal-delay-4"
          style={{"--module-accent":"var(--emerald)"}}
        >
          <div className="cm-number">04 // EXCEL</div>
          <div className="cm-icon">&#9733;</div>

          <div className="cm-title">
            EXCEL
          </div>

          <p className="cm-desc">
            Demonstrate technical capability, communication, teamwork,
            decision-making and the ability to perform under pressure.
          </p>
        </div>

      </div>
    </section>


    {/*  ═══════════════════════════════════════════════════════
         MISSION
    ═══════════════════════════════════════════════════════  */}

    <section style={{"marginBottom":"4rem"}}>

      <div
        style={{"display":"flex","alignItems":"center","gap":".75rem","marginBottom":"2rem"}}
        className="reveal"
      >

        <span
          style={{"fontFamily":"var(--font-heading)","fontSize":".72rem","letterSpacing":".18em","color":"var(--cyan)","textTransform":"uppercase"}}
        >
          MISSION CONTROL
        </span>

        <div
          style={{"flex":"1","height":"1px","background":"linear-gradient(\n              to right,\n              var(--cyan-border),\n              transparent\n            )"}}
        ></div>

      </div>


      <div
        style={{"display":"grid","gridTemplateColumns":"repeat(auto-fit, minmax(min(100%, 280px), 1fr))","gap":"1.25rem"}}
      >

        <div className="glass-card reveal reveal-delay-1">

          <div className="badge-hud">
            OUR MISSION
          </div>

          <h3
            style={{"color":"#fff","margin":"1rem 0 .75rem","fontSize":"1.05rem"}}
          >
            BRIDGE KNOWLEDGE WITH ACTION
          </h3>

          <p style={{"lineHeight":"1.8"}}>
            SAGE 1.0 aims to encourage engineering students to apply
            academic knowledge in practical situations while developing
            creativity, teamwork, technical confidence and problem-solving
            ability.
          </p>

        </div>


        <div className="glass-card reveal reveal-delay-2">

          <div className="badge-hud">
            PARTICIPATION
          </div>

          <h3
            style={{"color":"#fff","margin":"1rem 0 .75rem","fontSize":"1.05rem"}}
          >
            BUILT FOR ENGINEERS
          </h3>

          <p style={{"lineHeight":"1.8"}}>
            SAGE 1.0 welcomes eligible student participants who are ready
            to challenge themselves through engineering, innovation,
            teamwork and competitive problem-solving.
          </p>

        </div>

      </div>
    </section>


    {/*  ═══════════════════════════════════════════════════════
         WHAT PARTICIPANTS EXPERIENCE
    ═══════════════════════════════════════════════════════  */}

    <section style={{"marginBottom":"4rem"}}>

      <div
        style={{"display":"flex","alignItems":"center","gap":".75rem","marginBottom":"2rem"}}
        className="reveal"
      >

        <span
          style={{"fontFamily":"var(--font-heading)","fontSize":".72rem","letterSpacing":".18em","color":"var(--cyan)","textTransform":"uppercase"}}
        >
          WHAT SAGE ENABLES
        </span>

        <div
          style={{"flex":"1","height":"1px","background":"linear-gradient(\n              to right,\n              var(--cyan-border),\n              transparent\n            )"}}
        ></div>

      </div>


      <div
        className="card-grid reveal"
        style={{"gridTemplateColumns":"repeat(auto-fit,minmax(250px,1fr))"}}
      >

        <div className="glass-card about-exp-card">

          <div
            className="about-exp-icon"
            style={{"color":"var(--cyan)"}}
          >
            &#9670;
          </div>

          <h4
            style={{"color":"#fff","marginBottom":".5rem"}}
          >
            ENGINEERING DESIGN
          </h4>

          <p>
            Apply design thinking, technical knowledge and creativity
            to solve structured engineering challenges.
          </p>

        </div>


        <div className="glass-card about-exp-card">

          <div
            className="about-exp-icon"
            style={{"color":"var(--orange)"}}
          >
            &#9670;
          </div>

          <h4
            style={{"color":"#fff","marginBottom":".5rem"}}
          >
            PRACTICAL PROBLEM SOLVING
          </h4>

          <p>
            Work with constraints, resources and real-world engineering
            situations where practical decisions matter.
          </p>

        </div>


        <div className="glass-card about-exp-card">

          <div
            className="about-exp-icon"
            style={{"color":"var(--violet)"}}
          >
            &#9670;
          </div>

          <h4
            style={{"color":"#fff","marginBottom":".5rem"}}
          >
            INNOVATION
          </h4>

          <p>
            Develop creative ideas and communicate solutions through
            structured engineering thinking and teamwork.
          </p>

        </div>


        <div className="glass-card about-exp-card">

          <div
            className="about-exp-icon"
            style={{"color":"var(--emerald)"}}
          >
            &#9670;
          </div>

          <h4
            style={{"color":"#fff","marginBottom":".5rem"}}
          >
            TEAMWORK
          </h4>

          <p>
            Collaborate, communicate and perform as a team while
            competing against other engineering minds.
          </p>

        </div>

      </div>
    </section>


    {/*  ═══════════════════════════════════════════════════════
         ORGANIZED BY
    ═══════════════════════════════════════════════════════  */}

    <section style={{"marginBottom":"2rem"}}>

      <div
        className="glass-card reveal"
        style={{"textAlign":"center","borderColor":"var(--cyan-border)","position":"relative","overflow":"hidden"}}
      >

        <div
          style={{"position":"absolute","top":"0","left":"20%","right":"20%","height":"1px","background":"var(--cyan)","boxShadow":"0 0 10px var(--cyan)"}}
        ></div>

        <div
          className="badge-hud"
          style={{"margin":"0 auto 1.25rem"}}
        >
          ORGANIZED BY
        </div>

        <h3
          style={{"color":"#fff","marginBottom":".4rem","fontSize":"1.15rem"}}
        >
          IE(I) MECHANICAL &amp; PRODUCTION
          STUDENTS' CHAPTER
        </h3>

        <p
          style={{"color":"var(--text-muted)","marginBottom":".25rem"}}
        >
          Department of Mechanical &amp; Production Engineering
        </p>

        <p
          style={{"color":"var(--cyan)","fontFamily":"var(--font-heading)","fontSize":".82rem","letterSpacing":".1em"}}
        >
          BIRLA VISHVAKARMA MAHAVIDYALAYA
          <br />
          VALLABH VIDYANAGAR
        </p>

      </div>
    </section>


    {/*  ═══════════════════════════════════════════════════════
         FINAL CTA
    ═══════════════════════════════════════════════════════  */}

    <section
      className="reveal"
      style={{"textAlign":"center","padding":"2.5rem 0"}}
    >

      <div className="badge-hud" style={{"marginBottom":"1rem"}}>
        SYSTEM READY
      </div>

      <h3
        style={{"color":"#fff","fontSize":"1.5rem","marginBottom":".75rem"}}
      >
        READY TO ENTER THE CHALLENGE?
      </h3>

      <p
        style={{"color":"var(--text-muted)","maxWidth":"600px","margin":"0 auto 1.5rem"}}
      >
        Explore the seven SAGE 1.0 events and discover where your
        engineering skills can take you.
      </p>

      <div
        style={{"display":"flex","gap":"1rem","justifyContent":"center","flexWrap":"wrap"}}
      >

        <Link
          to="/events"
          className="btn btn-primary"
        >
          EXPLORE 07 EVENTS &rarr;
        </Link>

        <Link
          to="/registration"
          className="btn btn-secondary"
        >
          REGISTER NOW
        </Link>

      </div>

    </section>
  
    </>
  );
}
