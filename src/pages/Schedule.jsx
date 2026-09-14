import React from 'react';

export default function Schedule() {
  return (
    <>
      
    <section>

      {/*  PAGE HEADER  */}
      <div className="section-header">
        <div className="badge-hud">MISSION TIMELINE</div>

        <h2>EVENT SCHEDULE</h2>

        <p>
          Two-day technical, innovation and career challenges
          organized by IE(I) Mechanical & Production Students' Chapter, BVM.
        </p>
      </div>


      {/*  ==================== DAY 01 ====================  */}

      <div className="glass-card" style={{"marginBottom":"2rem"}}>

        <div style={{"display":"flex","justifyContent":"space-between","alignItems":"center","gap":"1rem","flexWrap":"wrap","marginBottom":"1.5rem"}}>

          <div>
            <div className="badge-hud">DAY 01</div>

            <h2 style={{"color":"var(--cyan-primary)","margin":"0.75rem 0 0.35rem"}}>
              WEDNESDAY
            </h2>

            <p style={{"margin":"0"}}>
              TECHNICAL CHALLENGES
            </p>
          </div>

          <div style={{"textAlign":"right","padding":"0.75rem 1rem","border":"1px solid rgba(0,210,255,0.3)","borderRadius":"10px"}}>
            <strong style={{"color":"#fff"}}>
              10:00 AM – 6:00 PM
            </strong>

            <br />

            <span>
              Recess: 1:00 – 2:00 PM
            </span>
          </div>

        </div>


        {/*  STARK BLUEPRINT  */}

        <div style={{"marginBottom":"2rem"}}>

          <h3 style={{"color":"var(--cyan-primary)","marginBottom":"1rem"}}>
            STARK BLUEPRINT
          </h3>

          <p style={{"marginBottom":"1rem"}}>
            CAD Innovation Challenge
          </p>


          <div className="schedule-list">

            <div className="glass-card" style={{"marginBottom":"0.75rem"}}>
              <strong>10:00 – 10:15 AM</strong>
              <span>Opening & Briefing — Inauguration</span>
            </div>

            <div className="glass-card" style={{"marginBottom":"0.75rem"}}>
              <strong>10:15 – 11:00 AM</strong>
              <span>Round 1 — Complete the Design</span>
            </div>

            <div className="glass-card" style={{"marginBottom":"0.75rem"}}>
              <strong>11:00 AM – 12:00 PM</strong>
              <span>Round 2 — Replicate the Physical Product</span>
            </div>

            <div className="glass-card">
              <strong>12:00 – 1:00 PM</strong>
              <span>Round 3 — Innovation for Your Profession</span>
            </div>

          </div>

        </div>


        {/*  RECESS  */}

        <div style={{"padding":"1rem","margin":"1.5rem 0","textAlign":"center","border":"1px dashed var(--cyan-primary)","borderRadius":"12px","color":"var(--cyan-primary)"}}>
          <strong>1:00 – 2:00 PM</strong>
          <br />
          RECESS
        </div>


        {/*  ARC FORGE  */}

        <div>

          <h3 style={{"color":"var(--cyan-primary)","marginBottom":"1rem"}}>
            ARC FORGE
          </h3>

          <p style={{"marginBottom":"1rem"}}>
            Workshop & Innovation Challenge
          </p>


          <div className="schedule-list">

            <div className="glass-card" style={{"marginBottom":"0.75rem"}}>
              <strong>2:00 – 2:15 PM</strong>
              <span>Briefing & Safety Instructions</span>
            </div>

            <div className="glass-card" style={{"marginBottom":"0.75rem"}}>
              <strong>2:15 – 3:30 PM</strong>
              <span>Round 1 — Workshop Challenge</span>
            </div>

            <div className="glass-card" style={{"marginBottom":"0.75rem"}}>
              <strong>3:30 – 4:30 PM</strong>
              <span>Round 2 — Junk Innovation</span>
            </div>

            <div className="glass-card" style={{"marginBottom":"0.75rem"}}>
              <strong>4:30 – 5:45 PM</strong>
              <span>Round 3 — Treasure Hunt</span>
            </div>

            <div className="glass-card">
              <strong>5:45 – 6:00 PM</strong>
              <span>Day 1 Wrap-up</span>
            </div>

          </div>

        </div>

      </div>



      {/*  ==================== DAY 02 ====================  */}

      <div className="glass-card">

        <div style={{"display":"flex","justifyContent":"space-between","alignItems":"center","gap":"1rem","flexWrap":"wrap","marginBottom":"1.5rem"}}>

          <div>
            <div className="badge-hud">DAY 02</div>

            <h2 style={{"color":"var(--cyan-primary)","margin":"0.75rem 0 0.35rem"}}>
              SATURDAY
            </h2>

            <p style={{"margin":"0"}}>
              INNOVATION & CAREER CHALLENGES
            </p>
          </div>

          <div style={{"textAlign":"right","padding":"0.75rem 1rem","border":"1px solid rgba(0,210,255,0.3)","borderRadius":"10px"}}>
            <strong style={{"color":"#fff"}}>
              10:00 AM – 6:00 PM
            </strong>

            <br />

            <span>
              Recess: 1:00 – 2:00 PM
            </span>
          </div>

        </div>


        {/*  PARALLEL TRACKS  */}

        <div style={{"display":"grid","gridTemplateColumns":"repeat(auto-fit, minmax(min(100%, 280px), 1fr))","gap":"1.5rem"}}>


          {/*  TRACK A  */}

          <div className="glass-card" style={{"borderColor":"rgba(170,70,255,0.5)"}}>

            <div className="badge-hud">
              TRACK A
            </div>

            <h3 style={{"color":"#a855f7","margin":"0.75rem 0 0.25rem"}}>
              NEXT GEN PROTOCOL
            </h3>

            <p>
              IDEATHON
            </p>

            <p style={{"fontSize":"0.85rem"}}>
              Team of 3 | 1st & 2nd Year Students
            </p>


            <div style={{"marginTop":"1.5rem"}}>

              <div className="glass-card" style={{"marginBottom":"0.75rem"}}>
                <strong>10:00 – 10:15 AM</strong>
                <br />
                <span>Briefing</span>
              </div>

              <div className="glass-card" style={{"marginBottom":"0.75rem"}}>
                <strong>10:15 – 11:15 AM</strong>
                <br />
                <span>
                  Round 1 — TECH BLUEPRINT
                </span>
              </div>

              <div className="glass-card" style={{"marginBottom":"0.75rem"}}>
                <strong>11:15 AM – 12:15 PM</strong>
                <br />
                <span>
                  Round 2 — HOLO PITCH
                </span>
              </div>

              <div className="glass-card">
                <strong>12:15 – 1:00 PM</strong>
                <br />
                <span>
                  Round 3 — ARC INVESTMENT
                </span>
              </div>

            </div>


            <div style={{"margin":"1rem 0","padding":"0.8rem","textAlign":"center","border":"1px dashed #a855f7","borderRadius":"10px"}}>
              <strong>1:00 – 2:00 PM</strong>
              <br />
              RECESS
            </div>


            <div className="glass-card">
              <strong>2:00 – 6:00 PM</strong>
              <br />
              <span>
                Evaluation, Final Pitch & Results
              </span>
            </div>

          </div>



          {/*  TRACK B  */}

          <div className="glass-card" style={{"borderColor":"rgba(0,255,180,0.5)"}}>

            <div className="badge-hud">
              TRACK B
            </div>

            <h3 style={{"color":"var(--emerald-accent)","margin":"0.75rem 0 0.25rem"}}>
              MISSION: HIRE
            </h3>

            <p>
              PLACEMENT DRIVE
            </p>

            <p style={{"fontSize":"0.85rem"}}>
              Individual | 3rd & 4th Year Students
            </p>


            <div style={{"marginTop":"1.5rem"}}>

              <div className="glass-card" style={{"marginBottom":"0.75rem"}}>
                <strong>10:00 – 10:15 AM</strong>
                <br />
                <span>Briefing</span>
              </div>

              <div className="glass-card" style={{"marginBottom":"0.75rem"}}>
                <strong>10:15 – 11:15 AM</strong>
                <br />
                <span>
                  Round 1 — Offline Aptitude Test
                </span>
              </div>

              <div className="glass-card" style={{"marginBottom":"0.75rem"}}>
                <strong>11:15 AM – 12:15 PM</strong>
                <br />
                <span>
                  Round 2 — Group Discussion
                </span>
              </div>

              <div className="glass-card">
                <strong>12:15 – 1:00 PM</strong>
                <br />
                <span>
                  Round 3 — Technical Interview
                </span>
              </div>

            </div>


            <div style={{"margin":"1rem 0","padding":"0.8rem","textAlign":"center","border":"1px dashed var(--emerald-accent)","borderRadius":"10px"}}>
              <strong>1:00 – 2:00 PM</strong>
              <br />
              RECESS
            </div>


            <div className="glass-card">

              <strong>2:00 – 6:00 PM</strong>

              <br /><br />

              <span>
                Round 3 — Technical Interview
              </span>

              <br /><br />

              <span>
                Round 4 — HR Interview
              </span>

            </div>

          </div>

        </div>

      </div>



      {/*  PARTICIPATION INFORMATION  */}

      <div className="glass-card" style={{"marginTop":"2rem"}}>

        <div className="badge-hud">
          PARTICIPATION FRAMEWORK
        </div>

        <h3 style={{"color":"var(--cyan-primary)","margin":"1rem 0"}}>
          TEAM FORMAT
        </h3>

        <div style={{"display":"grid","gridTemplateColumns":"repeat(auto-fit, minmax(min(100%, 240px), 1fr))","gap":"1rem"}}>

          <div className="glass-card">
            <strong>STARK BLUEPRINT</strong>
            <br />
            Team of 3
            <br />
            Mechanical & Production Students
          </div>

          <div className="glass-card">
            <strong>ARC FORGE</strong>
            <br />
            Team of 3
            <br />
            Mechanical & Production Students
          </div>

          <div className="glass-card">
            <strong>NEXT GEN PROTOCOL</strong>
            <br />
            Team of 3
            <br />
            1st & 2nd Year Students
          </div>

          <div className="glass-card">
            <strong>MISSION: HIRE</strong>
            <br />
            Individual
            <br />
            3rd & 4th Year Students
          </div>

        </div>

      </div>


      {/*  FOOTER INFORMATION  */}

      <div style={{"textAlign":"center","marginTop":"2rem","padding":"1.5rem"}}>

        <p>
          <strong>Registration Fee:</strong>
          Starting from ₹40 (Tiered Discounts up to All 7 Events at ₹180)
        </p>

        <p>
          Organized by
          <strong>
            IE(I) Mechanical & Production Students' Chapter, BVM
          </strong>
        </p>

        <p>
          Department of Mechanical & Production Engineering |
          Birla Vishvakarma Mahavidyalaya
        </p>

      </div>

    </section>
  
    </>
  );
}
