import React from 'react';

export default function Rules() {
  return (
    <>
      
    <section>

      <div className="section-header">

        <div className="badge-hud">
          SAGE 1.0 // EVENT PROTOCOL
        </div>

        <h2>RULES & REGULATIONS</h2>

        <p>
          Please read all rules and guidelines carefully before
          participating in SAGE 1.0.
        </p>

      </div>

      <div
        style={{"maxWidth":"950px","margin":"0 auto","display":"flex","flexDirection":"column","gap":"1.25rem"}}
      >

        ${renderRule(
          "GENERAL RULES",
          [
            "All participants must complete registration before participating.",
            "Participants must carry their valid college ID card during the event.",
            "Participants must report before the scheduled reporting time.",
            "Participants must follow instructions given by coordinators and judges.",
            "Cheating, plagiarism, or unfair practices may lead to disqualification.",
            "The decision of the judges and organizing committee will be final."
          ],
          1
        )}

        ${renderRule(
          "TEAM EVENT RULES",
          [
            "Team events consist of 3 members per team.",
            "All team members must be registered participants.",
            "Only registered team members can participate in the respective event.",
            "Team members must work together during the assigned rounds.",
            "Any change in team members requires approval from the organizing committee."
          ],
          2
        )}

        ${renderRule(
          "STARK BLUEPRINT",
          [
            "The event will be conducted through the announced challenge rounds.",
            "Participants must complete the assigned task within the given time.",
            "Evaluation may consider accuracy, creativity, technical understanding, and completion.",
            "Copying another team's work is strictly prohibited.",
            "Participants must submit their work before the specified deadline.",
            "The judges' decision will be final."
          ],
          3
        )}

        ${renderRule(
          "ARC FORGE",
          [
            "Participants must follow all instructions provided by the organizers.",
            "All tools, equipment, and materials must be used responsibly.",
            "Required safety precautions must be followed at all times.",
            "The assigned challenge must be completed within the allotted time.",
            "Unsafe handling of equipment may result in disqualification.",
            "Innovation, functionality, execution, and teamwork may be considered during evaluation."
          ],
          4
        )}

        ${renderRule(
          "NEXT GEN PROTOCOL",
          [
            "The Ideathon is a team event with 3 members.",
            "The Ideathon consists of 3 rounds.",
            "Teams must develop their idea according to each round.",
            "Ideas will be evaluated on innovation, problem understanding, feasibility, and presentation.",
            "Each round must be completed within the allotted time.",
            "The judges' decision will be final."
          ],
          5
        )}

        ${renderRule(
          "MISSION: HIRE",
          [
            "The Placement Drive is an individual participation event.",
            "Participants must carry their valid college ID and required documents.",
            "Participants must follow the instructions of the placement coordinators.",
            "The process may include aptitude, group discussion, technical interaction, and HR interaction.",
            "Participants must maintain professional behaviour throughout the process.",
            "Candidates must report according to the assigned schedule."
          ],
          6
        )}

        ${renderRule(
          "REGISTRATION & PAYMENT",
          [
            "Tiered registration pricing applies dynamically based on the number of selected events (1 Event: ₹40, 2 Events: ₹70, 3 Events: ₹100, 4 Events: ₹125, 5 Events: ₹150, All 7 Events: ₹180).",
            "Online payment participants must enter the Transaction ID / UTR.",
            "Valid payment proof must be submitted when required.",
            "Registration details must be entered correctly.",
            "Registration fees are non-refundable after successful registration."
          ],
          7
        )}

        ${renderRule(
          "DISCIPLINE & SAFETY",
          [
            "Participants must maintain proper discipline throughout the event.",
            "Misbehaviour with judges, coordinators, volunteers, or participants is prohibited.",
            "Damage to college property or event equipment is prohibited.",
            "Participants must follow all safety instructions.",
            "Activities creating a safety risk may result in immediate removal."
          ],
          8
        )}

        ${renderRule(
          "DISQUALIFICATION",
          [
            "Use of unfair means or unauthorized assistance may result in disqualification.",
            "Plagiarism, cheating, or deliberate rule violations may result in immediate disqualification.",
            "Misconduct with judges, coordinators, volunteers, or participants is prohibited.",
            "Damage to college property or equipment may result in disqualification.",
            "Failure to follow safety instructions may result in immediate removal.",
            "The organizing committee reserves the right to disqualify participants who violate the rules."
          ],
          9
        )}

      </div>

      <div
        className="glass-card"
        style={{"maxWidth":"950px","margin":"2rem auto","textAlign":"center","borderColor":"var(--cyan-primary)"}}
      >

        <div className="badge-hud">
          FINAL PROTOCOL
        </div>

        <h3 style={{"color":"#fff","margin":"1rem 0"}}>
          PARTICIPATE • INNOVATE • COMPETE
        </h3>

        <p style={{"color":"#91a1bd","lineHeight":"1.7"}}>
          By registering for SAGE 1.0, participants agree to follow
          the event rules, safety instructions, schedule, and decisions
          of the organizing committee.
        </p>

      </div>

      <div
        style={{"textAlign":"center","paddingBottom":"2rem"}}
      >

        <p
          style={{"color":"var(--cyan-primary)","fontSize":"0.8rem","letterSpacing":"0.08em","textTransform":"uppercase"}}
        >
          Organized by
        </p>

        <h3 style={{"color":"#fff"}}>
          IE(I) Mechanical & Production Students' Chapter, BVM
        </h3>

        <p style={{"color":"#71819d"}}>
          Department of Mechanical & Production Engineering
        </p>

        <p style={{"color":"#71819d"}}>
          Birla Vishvakarma Mahavidyalaya
        </p>

      </div>

    </section>
  
    </>
  );
}
