// Foundation U10 — 3 sessions/week: Monday · Wednesday · Friday
// Session 1 (Mon): Fitness & Batting
// Session 2 (Wed): Bowling & Fielding
// Session 3 (Fri): Skills Review & Mini Match
import type { AgeGroupData } from "./types";

export const foundation: AgeGroupData = {
  id: "foundation",
  label: "Foundation",
  tag: "U10",
  ageRange: "Ages 6–10",
  accentColor: "emerald",
  desc: "Fun first. Skills next. Confidence always.",
  trainingDays: ["Monday", "Wednesday", "Friday"],
  sessionsPerWeek: 3,
  sessionLength: "60–75 min",
  months: [
    // ── PHASE 1 ────────────────────────────────────────────────────────────────
    {
      month: "Sep 2026", shortMonth: "Sep",
      phase: "Phase 1 — Welcome", phaseColor: "emerald",
      monthGoal: "Make every child feel safe, welcome, and excited about cricket",
      sessions: [
        {
          number: 1, day: "Monday", label: "Welcome & Movement", duration: "60 min",
          warmUp: ["Name game while running laps", "Balloon tap — keep it in the air", "Follow-the-leader movement circuit"],
          mainWork: [
            "Cricket field tour — explain boundary, crease, stumps",
            "Hold a bat correctly — V-grip demonstration by coach, all try",
            "Soft-ball toss and catch in pairs — 10 catches each",
            "Stand in batting stance — check feet, shoulders, head position",
          ],
          gamePlay: "Scatter cricket — everyone bats and fields simultaneously, no elimination",
          coachFocus: "Every child should leave knowing the correct grip. Praise effort, not outcome.",
        },
        {
          number: 2, day: "Wednesday", label: "Ball Skills & Safety", duration: "60 min",
          warmUp: ["Cricket-specific stretch routine — shoulder, wrist, ankle", "Skipping rope warm-up 3 min", "Two-line passing drill with soft ball"],
          mainWork: [
            "Safety rules — no swinging bat unless it's your turn, safe zones",
            "Underarm bowling — step, swing, release at stumps 5m away",
            "Two-hand ground fielding — get down behind the ball",
            "Overarm throw to a target cone at 8m — dominant hand",
          ],
          gamePlay: "Bowling at giant stumps — each player gets 6 attempts, count hits",
          coachFocus: "Safety and listening. Establish session routine: stretch → drill → game → clap-out.",
        },
        {
          number: 3, day: "Friday", label: "First Mini Match", duration: "60 min",
          warmUp: ["Team warm-up jog together", "High-knees, side-shuffles, backward run", "Partner stretch"],
          mainWork: [
            "Recall Monday grip + Wednesday bowling — 5 min each review",
            "Running between wickets: 'YES', 'NO', 'WAIT' — call and run in pairs",
            "Catching circle — 6 players, 1 ball, clap before catching",
            "Coach bowls underarm, students bat 3 balls each in rotation",
          ],
          gamePlay: "Kwik cricket 3v3 — everyone bats, everyone bowls, score runs",
          coachFocus: "Focus on participation. Celebrate every boundary and every wicket equally.",
        },
      ],
      assessment: "Can each child hold the bat correctly? Do they enjoy the sessions? Attendance check.",
      globalStandard: "ICC LTAD Stage 1 — Learn to Play. No elimination, positive first experiences. CA Cricket Blast model.",
    },
    {
      month: "Oct 2026", shortMonth: "Oct",
      phase: "Phase 1 — Welcome", phaseColor: "emerald",
      monthGoal: "Build motor skills, coordination and team familiarity",
      sessions: [
        {
          number: 1, day: "Monday", label: "Fitness & Coordination", duration: "65 min",
          warmUp: ["Agility ladder — two feet in each rung", "Cone weave sprint × 3", "Ball juggling — throw, clap, catch"],
          mainWork: [
            "Batting stance + shadow batting — 3 shots × 10 reps (no ball)",
            "Balance beam walk holding bat in batting grip",
            "Toss and hit — coach tosses gently, player drives straight",
            "Sprint between cones 20m — cricket running technique",
          ],
          gamePlay: "Relay race with batting — run to cone, tap with bat, return",
          coachFocus: "Footwork: transfer weight to front foot on drive. Use mirror or video if possible.",
        },
        {
          number: 2, day: "Wednesday", label: "Bowling & Fielding", duration: "65 min",
          warmUp: ["Shoulder circles, wrist rolls, ankle rotations", "Bowling action mime × 10 — no ball", "Throwing against wall 10m — 10 reps each arm"],
          mainWork: [
            "Bowling action: side-on stance, load up, step and bowl at 8m",
            "Bowl at target zone marked on pitch — 6 balls each",
            "Forehand pickup and throw — roll ball, run to it, pick up, throw to stumps",
            "Catching: coach lobs ball, 2 hands under chin, soft hands",
          ],
          gamePlay: "Fielding challenge — fielding team scores points for direct hits and catches",
          coachFocus: "Bowling arm should be straight. Check that wrist is behind the ball at release.",
        },
        {
          number: 3, day: "Friday", label: "Match Play", duration: "65 min",
          warmUp: ["Group jog + skip", "Stretching led by a student captain", "Warm-up catch — 10 per player"],
          mainWork: [
            "Batting: drive off underarm feed — 6 balls each, coach comments on 1 thing",
            "Bowling: 3 balls each over stumps, count hits",
            "Fielding: stop the ball rolling through a gate (2 cones, 2m gap)",
            "Calling: paired batting — call 'yes' or 'no' for every run",
          ],
          gamePlay: "Pairs cricket — 6-over match, each pair bats together, score cumulatively",
          coachFocus: "Team atmosphere. Teach players to cheer teammates. No negative reactions to dropped catches.",
        },
      ],
      assessment: "Motor skills visible improvement vs Sep. Can they bowl at a target consistently? Catching success rate.",
      globalStandard: "ECB Physical Literacy — FUNdamentals movement stage. CA — physical competence before cricket specialisation.",
    },

    // ── PHASE 2 ────────────────────────────────────────────────────────────────
    {
      month: "Nov 2026", shortMonth: "Nov",
      phase: "Phase 2 — Batting", phaseColor: "blue",
      monthGoal: "Establish correct batting technique — grip, stance, forward defense, straight drive",
      sessions: [
        {
          number: 1, day: "Monday", label: "Batting Technique", duration: "70 min",
          warmUp: ["Shadow batting warm-up — 3 min", "Footwork — step forward, step back, repeat × 15 each", "Grip check in pairs — partner spots fault"],
          mainWork: [
            "Forward defense: head over ball, soft hands, bat close to pad",
            "Coach bounces ball, player defends — 8 balls each",
            "Straight drive: full ball, high elbow, follow through to sky",
            "Batting off tee or cone — check head position, pick-up of bat",
            "Shadow batting in pairs with coaching — fix 1 thing each player",
          ],
          gamePlay: "Defense game — batsman scores point for each ball defended correctly, bowler for each edge",
          coachFocus: "Head position over front knee on forward defense. Non-dominant shoulder pointing at bowler.",
        },
        {
          number: 2, day: "Wednesday", label: "Bowling & Catching", duration: "70 min",
          warmUp: ["Wrist / shoulder warm-up circuit", "20m sprint × 3 — acceleration focus", "Catch and go: run while catching moving ball"],
          mainWork: [
            "Bowling at full length: full run-up (5 steps), bowl at good length mark",
            "Seam awareness: hold ball with seam upright, show to partner",
            "High catch: coach throws high, players catch with fingers pointing up",
            "Ground stop: ball rolled, player dives to stop, 1-hand barrier stop",
          ],
          gamePlay: "Wicket-blaster: teams take turns — bowl at stumps, fielding team catches rebounds",
          coachFocus: "In catching: eyes on ball until it hits hands. Common fault: looking away early.",
        },
        {
          number: 3, day: "Friday", label: "Applied Match Skills", duration: "70 min",
          warmUp: ["Full team stretch led by coach", "Partner ball toss — 20 quick catches in 60 sec", "Running between wickets — call and run drill 5 min"],
          mainWork: [
            "Batting: review forward defense + straight drive with live underarm",
            "Bowling: 3 over spell per bowler — count good length deliveries",
            "Fielding: circle fielding — 4 fielders, batsman hits, they chase and return",
            "Coach feedback circle: each player says 1 thing they improved this week",
          ],
          gamePlay: "6-over match with scoring — coach awards bonus points for good technique (not just runs)",
          coachFocus: "Reinforce that good technique = long-term run scoring. Don't let students only care about score.",
        },
      ],
      assessment: "Can each player defend the ball with correct grip? Drive a full ball straight? Bowling at good length?",
      globalStandard: "BCCI NCA Foundation Stage — technique-first batting. ECB Batting Shot Pathway Level 1 completion target.",
    },
    {
      month: "Dec 2026", shortMonth: "Dec",
      phase: "Phase 2 — Bowling", phaseColor: "blue",
      monthGoal: "Develop bowling action, fielding habits, and overarm throwing",
      sessions: [
        {
          number: 1, day: "Monday", label: "Batting Review + New Shots", duration: "70 min",
          warmUp: ["Shadow batting × 5 shots", "Cone footwork drill — step to off-side", "Mirror batting in pairs"],
          mainWork: [
            "Cover drive intro: step toward pitch, open face slightly, swing to cover",
            "Batting off side feed: coach throws to off-stump line, player drives",
            "Leg-side flick: ball on hips, roll wrists, play to mid-wicket direction",
            "Running between wickets: emphasise calling early, backing up",
          ],
          gamePlay: "Zone hitting game: score in different zones (straight/off/leg) for different points",
          coachFocus: "Off-side: weight on front foot. Leg-side flick: don't cross bat across body.",
        },
        {
          number: 2, day: "Wednesday", label: "Bowling Action", duration: "70 min",
          warmUp: ["Shoulder stability — band or body-weight exercise", "Run-up practice — 5-step run-up without ball", "Wall throw 8m × 10 reps — check action"],
          mainWork: [
            "Bowling action breakdown: side-on, load, leap, arm over, follow through",
            "Slow-motion bowling into a net — coach checks arm and body position",
            "Full run-up bowl: 3 spells × 4 balls with rest — good length target",
            "Spin grip intro: off-spin grip (2 fingers on seam), toss and turn",
          ],
          gamePlay: "Bowling competition: 12 balls each, score for good length + wickets",
          coachFocus: "Common fault at U10: bending elbow at delivery. Check arm is straight throughout swing.",
        },
        {
          number: 3, day: "Friday", label: "Fielding & Mini Match", duration: "70 min",
          warmUp: ["Jumping jacks, high knees, sprint", "Fielding warm-up: throw-catch in triangle", "Catching: 10 per player from coach lobs"],
          mainWork: [
            "Throwing mechanics: step, load, throw, follow through — 10 reps at 12m",
            "Boundary fielding: run to the ball, stop with long barrier, return to keeper",
            "Slip catching: coach hits off edge, catcher reacts — soft hands",
            "Wicket-keeping basics: crouch behind stumps, gloves up, move to ball",
          ],
          gamePlay: "End-of-month celebration match: 8v8, all skills applied, parents can watch",
          coachFocus: "Throwing: step toward target. U10 common fault: throwing across body without stepping.",
        },
      ],
      assessment: "Bowling action correct? Throwing to target at 10m? Cover drive shape correct?",
      globalStandard: "ICC LTAD — no overload. Max 2 overs per session per child. BCCI NCA — dual-skill development.",
    },

    // ── PHASE 3 ────────────────────────────────────────────────────────────────
    {
      month: "Jan 2027", shortMonth: "Jan",
      phase: "Phase 3 — Game Skills", phaseColor: "purple",
      monthGoal: "Combine batting and bowling into real game scenarios",
      sessions: [
        {
          number: 1, day: "Monday", label: "Batting Expansion", duration: "75 min",
          warmUp: ["Shadow batting all 5 shots learnt", "Footwork ladder drill", "Partner grip check"],
          mainWork: [
            "Pull shot intro: short ball (waist height), pivot, pull to leg",
            "Lofted drive: same as straight drive but finish high — clearing infield",
            "Shot selection: coach calls 'short' or 'full' — player picks shot",
            "Running between wickets: 3-cone relay, call and run with partner",
          ],
          gamePlay: "Shot selection game — coloured ball for shot required, batsman picks correctly to score",
          coachFocus: "Pull shot: get inside the line of the ball, not outside. Head still.",
        },
        {
          number: 2, day: "Wednesday", label: "Bowling & Fielding", duration: "75 min",
          warmUp: ["Bowling action mime × 10", "Sprint 20m × 3", "Circle catch warm-up"],
          mainWork: [
            "Spin bowling: off-spin — toss up, land on off-stump line, turn away",
            "Fielding positions: learn 5 positions by name (mid-on, mid-off, cover, fine leg, slip)",
            "Move to positions on call: coach calls 'cover!', everyone runs to cover position",
            "Relay throw: outfield catches, throws to mid-off, mid-off to keeper",
          ],
          gamePlay: "Fielding challenge: batting team hits, fielding team must get in positions before ball arrives",
          coachFocus: "Fielding: get body behind ball always. Never field one-handed unless diving.",
        },
        {
          number: 3, day: "Friday", label: "Match Skills", duration: "75 min",
          warmUp: ["Full warm-up led by oldest student", "10 catches per player", "Batting shadow × 3 shots"],
          mainWork: [
            "Batting: face 6 balls live — use shots learnt this month",
            "Bowling: spell of 3 overs per bowler — rotate roles",
            "Captain for the day: one student sets field for each bowling over",
            "Pressure batting: need 10 runs off last 2 overs — bat in pairs",
          ],
          gamePlay: "Full mini match — 10 overs per side, 8v8, full roles, scoring kept",
          coachFocus: "Match awareness: which field position is empty? Where should I hit? These questions to the batter.",
        },
      ],
      assessment: "Can they identify gaps in field? Do they call when running? Spin bowling landing on target?",
      globalStandard: "ICC LTAD Stage 2 — Learn to Train. Game understanding introduced. BCCI NCA Foundation progression.",
    },
    {
      month: "Feb 2027", shortMonth: "Feb",
      phase: "Phase 3 — Game Skills", phaseColor: "purple",
      monthGoal: "Develop fielding excellence and game awareness",
      sessions: [
        {
          number: 1, day: "Monday", label: "Batting Consolidation", duration: "75 min",
          warmUp: ["Mirror batting partner drill", "Cone footwork: front foot, back foot alternating", "Grip strength squeeze × 20"],
          mainWork: [
            "All 6 shots: defense, drive, pull, flick, cut (intro), loft — shadow then live",
            "Cut shot: wide ball outside off, bat comes down at 45 degrees, punch",
            "Batting v spin: use feet — skip down pitch to drive or step back to cut",
            "Partnership batting: two players bat together, talk between overs",
          ],
          gamePlay: "Batting challenge: score 20 in 12 balls — plan which shots to use",
          coachFocus: "Cut shot: don't reach. Let ball come to you. Weight on back foot.",
        },
        {
          number: 2, day: "Wednesday", label: "Advanced Fielding", duration: "75 min",
          warmUp: ["Reaction ball drop: catch ball after 1 bounce", "Sideways shuffle 10m × 4", "Throw at stumps × 10 each"],
          mainWork: [
            "Diving stop: slide on one knee to stop boundary, return throw",
            "Catching relay: lob from coach → slip → fielder returns",
            "Wicket-keeping: 10 balls each (if rotation allows) — crouch, move, take",
            "Fielding game IQ: where to throw — run-out opportunities practice",
          ],
          gamePlay: "Run-out challenge: fielding team tries to run-out batters. 3 run-outs = fielding team wins",
          coachFocus: "Diving: dive forward and sideways, never backward. Land on hip not elbow.",
        },
        {
          number: 3, day: "Friday", label: "Match & Review", duration: "75 min",
          warmUp: ["Full team stretch routine", "Catching circles × 3 min", "Sprint and bat relay"],
          mainWork: [
            "Month review: coach questions — 'what is a cut shot? what is a fielding position?'",
            "Video clip review if available — spot the good technique",
            "Goal-setting: each player sets 1 batting and 1 fielding goal for March",
            "Bowling: each player bowls 1 over — coach tracks good length balls",
          ],
          gamePlay: "Tournament: 3-team round robin — 6 overs each, cumulative scoreboard on whiteboard",
          coachFocus: "End-of-phase check: compare to November baseline. Write brief notes on each player.",
        },
      ],
      assessment: "Cuts, pulls, drives visible in game? Fielding in correct position instinctively? Calling and running?",
      globalStandard: "ECB Batting Shot Pathway completion of Level 1. BCCI NCA — game IQ development for U10.",
    },

    // ── PHASE 4 ────────────────────────────────────────────────────────────────
    {
      month: "Mar 2027", shortMonth: "Mar",
      phase: "Phase 4 — Match Play", phaseColor: "yellow",
      monthGoal: "Apply all skills in consistent match play",
      sessions: [
        {
          number: 1, day: "Monday", label: "Batting Under Pressure", duration: "75 min",
          warmUp: ["High-intensity warm-up: sprint relay", "Batting shadow with eyes closed → open", "Partner grip, stance and pick-up check"],
          mainWork: [
            "Pressure batting: last 2 overs, need 15 runs — bat in pairs",
            "Rebuilding innings: 2 wickets in 2 balls — how to reset mentally",
            "Shot selection under pressure: coach shows field, player picks shot",
            "Power shot drill: drive over mid-off, pull over mid-wicket — clearing boundary",
          ],
          gamePlay: "Chase simulation: team chases 30 runs in 6 overs — pressure grows each over",
          coachFocus: "Mental reset: 'deep breath, start again' routine after each dismissal.",
        },
        {
          number: 2, day: "Wednesday", label: "Bowling Tactics", duration: "75 min",
          warmUp: ["Bowling action warm-up × 10 without ball", "Run-up acceleration drill", "Fielder sprint circuit"],
          mainWork: [
            "Bowling to a plan: coach says 'bowl outside off', bowler executes",
            "Change of pace: bowl 1 normal, 1 slower — same action",
            "Field-setting: captain sets 3 different fields, bowler adapts",
            "Pressure bowling: last over, 8 needed — bowl to plan, not panic",
          ],
          gamePlay: "Bowling challenge: each bowler has 1 over, keep total under 6. Fielding counts.",
          coachFocus: "Control over pace. U10 bowlers often try to bowl too fast. Accuracy first.",
        },
        {
          number: 3, day: "Friday", label: "Full Match Day", duration: "75 min",
          warmUp: ["Captain-led warm-up (rotating)", "Team huddle + game plan discussion", "Toss and field setting decision"],
          mainWork: [
            "Full 10-over match — real scoring, real field placements",
            "Coach observes silently — no intervention during match",
            "Between innings: team meeting — what worked, what to fix",
            "Post-match: coach highlights 1 excellent batting moment, 1 excellent fielding moment",
          ],
          gamePlay: "Match IS the session — full game, all roles, all rules",
          coachFocus: "Let students make decisions. Don't coach from the boundary. Observe and note.",
        },
      ],
      assessment: "Decision-making in match: right shot, right field position, correct calling. Confidence visible?",
      globalStandard: "ICC LTAD — competition in safe environment. CA — game-based learning at U10.",
    },
    {
      month: "Apr 2027", shortMonth: "Apr",
      phase: "Phase 4 — Match Play", phaseColor: "yellow",
      monthGoal: "Develop team tactics and individual match roles",
      sessions: [
        {
          number: 1, day: "Monday", label: "Batting Role Clarity", duration: "75 min",
          warmUp: ["Shadow batting all shots", "Footwork speed drill: 10 steps forward, 10 back", "Partner calling drill"],
          mainWork: [
            "Opening bat role: build innings, leave bad ball, rotate strike",
            "Middle-order bat: rebuild when wickets fall, or accelerate if set",
            "Tail-end bat: support the main batter, run hard between wickets",
            "Batting order simulation: each student bats in their assigned role",
          ],
          gamePlay: "Role-based batting: each player gets 8 balls in their designated role, must bat accordingly",
          coachFocus: "Teach that not every shot needs to be a boundary. Smart cricket = good cricket.",
        },
        {
          number: 2, day: "Wednesday", label: "Bowling & Fielding Roles", duration: "75 min",
          warmUp: ["Fielding agility circuit", "Catching drills × 15 per player", "Throw accuracy: 3/5 at stumps target"],
          mainWork: [
            "Opening bowler role: swing, seam, target early wickets",
            "First change role: contain, bowl to field, take 1 wicket per spell",
            "Spinner role: flight, turn, set up batsman for others",
            "Specialist fielder: cover point (fast), slip (reflexes), mid-off (command)",
          ],
          gamePlay: "Role assignment match: coach assigns each player a specific role, they must fulfil it",
          coachFocus: "All-rounder mindset: bat, bowl, field — be useful in all three. Praise three-way contributions.",
        },
        {
          number: 3, day: "Friday", label: "Inter-Batch Friendly", duration: "75 min",
          warmUp: ["Full warm-up — own team responsible", "Strategy meeting: discuss batting order, bowling plan", "Toss"],
          mainWork: [
            "Full inter-group friendly match vs another batch if available",
            "If single group: simulate two-team competition within batch",
            "Score kept: NRR tracked over April matches for motivational leaderboard",
            "Parents invited this Friday — showcase what has been learnt",
          ],
          gamePlay: "Full competitive friendly — umpires (coach), scoreboard, fielding team in positions",
          coachFocus: "Sportsmanship: shake hands before and after. Cheer the opposition's good shots.",
        },
      ],
      assessment: "Do they understand their role? Can they bat/bowl to a plan? Teamwork and communication visible?",
      globalStandard: "BCCI NCA — team cricket introduction. ICC — participation and team belonging at U10.",
    },

    // ── PHASE 5 ────────────────────────────────────────────────────────────────
    {
      month: "May 2027", shortMonth: "May",
      phase: "Phase 5 — Review", phaseColor: "orange",
      monthGoal: "Review progress, fix remaining technique issues, build confidence",
      sessions: [
        {
          number: 1, day: "Monday", label: "Batting Skills Review", duration: "75 min",
          warmUp: ["September baseline recall: ask students 'show me your grip'", "Shadow batting 6 shots review", "Footwork drill"],
          mainWork: [
            "Individual batting assessment: 6 balls each, coach video-records on phone",
            "Compare vs September: what improved? What still needs work?",
            "Fix 1 technical fault per player — targeted drill for 10 min",
            "Batting confidence drill: coach feeds easy balls, player hits freely",
          ],
          gamePlay: "Personal best challenge: can you score more in 6 balls than your October average?",
          coachFocus: "Written note on each player after Monday session. Share progress with parents Friday.",
        },
        {
          number: 2, day: "Wednesday", label: "Bowling & Fielding Review", duration: "75 min",
          warmUp: ["Bowling action mime — compare to September mime", "Throwing accuracy check: 3/5 at stumps = pass", "Catching: 8/10 = pass"],
          mainWork: [
            "Bowling assessment: 6 balls each, how many on target zone?",
            "Fielding assessment: 5 ground stops, 5 catches — record success rate",
            "Sprint test: 20m sprint — has speed improved vs September?",
            "Celebrate progress: coach points out visible improvements",
          ],
          gamePlay: "Skills carnival: 3 stations (batting, bowling, fielding) — rotate and score points",
          coachFocus: "Positive reinforcement. Students should leave today feeling proud of progress.",
        },
        {
          number: 3, day: "Friday", label: "Goal Setting & Fun Match", duration: "75 min",
          warmUp: ["Full team warm-up", "Group chat: what was your favourite session this year?"],
          mainWork: [
            "Personal goal setting: write 2 cricket goals for June–August on card",
            "Pair coaching: one student coaches the other for 5 min — what would you fix?",
            "Coach shares 1 positive observation about each player publicly",
            "Progress cards distributed to take home to parents",
          ],
          gamePlay: "Fun match: silly rules — bat with non-dominant hand, bowl with 5-step run only",
          coachFocus: "Celebration. Every student has improved. Make sure they feel that today.",
        },
      ],
      assessment: "Written assessment comparison: Sep vs May across batting, bowling, fielding, fitness.",
      globalStandard: "ECB Talent Pathway — mid-cycle review. BCCI NCA progress milestone check.",
    },
    {
      month: "Jun 2027", shortMonth: "Jun",
      phase: "Phase 5 — Review", phaseColor: "orange",
      monthGoal: "Build mental strength, team bonds, and self-belief",
      sessions: [
        {
          number: 1, day: "Monday", label: "Mental Skills & Batting", duration: "75 min",
          warmUp: ["Mindfulness minute: deep breath, focus, set today's intention", "Shadow batting with self-talk ('head still, watch the ball')", "High-energy sprint → immediate batting stance = activation"],
          mainWork: [
            "Pre-shot routine practice: each batter develops 3-step routine before facing a ball",
            "Mistake handling: coach deliberately creates a miss — batter resets and refocuses",
            "Pressure batting: 6 balls, 10 needed, 9 wickets down — focus drill",
            "Visualisation: close eyes, imagine hitting the perfect straight drive",
          ],
          gamePlay: "Reset game: when batter gets out, they must do reset routine before next innings",
          coachFocus: "Self-talk matters. Help each player develop 1 positive word to say to themselves.",
        },
        {
          number: 2, day: "Wednesday", label: "Team Culture & Fielding", duration: "75 min",
          warmUp: ["Team cheer design: students create group cheer for wicket", "High-energy fielding circuit", "Reaction catching drills"],
          mainWork: [
            "Leadership: rotate 'captain of the day' — they set field, motivate team",
            "Communication drill: fielders must call before moving ('MINE!' or 'YOURS!')",
            "Celebration protocol: high-five after every wicket and boundary",
            "Team challenge: 0 dropped catches in 10-minute catching drill",
          ],
          gamePlay: "Team vs team fielding challenge: 10 overs of fielding only, count drops vs saves",
          coachFocus: "Culture is built in small moments. A team that celebrates together performs better.",
        },
        {
          number: 3, day: "Friday", label: "Parent Showcase Match", duration: "75 min",
          warmUp: ["Student-led warm-up in front of parents", "Team introduction with roles announced", "Toss ceremony"],
          mainWork: [
            "Full match with parents watching — 12-over game",
            "Mid-match: coach briefly explains to parents what skill is being demonstrated",
            "Student interviews by coach post-match: 'what did you learn this year?'",
            "Parent-child cricket activity: 5-min catch-and-bowl with parents",
          ],
          gamePlay: "Full match — this IS the session",
          coachFocus: "Parents seeing progress reinforces the child's belief. Frame the match as a demonstration, not competition.",
        },
      ],
      assessment: "Mental resilience visible? Do they reset after mistakes? Team communication improved?",
      globalStandard: "ICC — enjoyment and belonging. ECB mental wellbeing guidelines for junior players.",
    },

    // ── PHASE 6 ────────────────────────────────────────────────────────────────
    {
      month: "Jul 2027", shortMonth: "Jul",
      phase: "Phase 6 — Tournament", phaseColor: "red",
      monthGoal: "Apply everything learnt in a tournament format — fun and achievement",
      sessions: [
        {
          number: 1, day: "Monday", label: "Tournament Preparation", duration: "75 min",
          warmUp: ["Match simulation warm-up", "Team strategy meeting", "Bowling & batting role confirmation"],
          mainWork: [
            "Tournament format briefing: how Kwik Cricket tournament works",
            "Batting order finalised: coach + players decide together",
            "Bowling rotation plan: who bowls which overs",
            "Fielding positions set: each player knows their 2 positions",
          ],
          gamePlay: "Practice tournament match — simulate real format with 10-min innings",
          coachFocus: "Tournament is about applying everything, not learning new things. Keep it simple.",
        },
        {
          number: 2, day: "Wednesday", label: "Match Day Readiness", duration: "75 min",
          warmUp: ["Full activation warm-up — same as pre-match routine", "5 catches + 5 throws each → feel sharp", "Batting shadow 5 min"],
          mainWork: [
            "Final technical reminders: 3 things — grip, head still, watch the ball",
            "Match scenarios: practice last-over chases and defenses",
            "Toss practice: captain answers — 'if you win toss what do you do and why?'",
            "Hydration, energy food, rest — life skills chat for tournament day",
          ],
          gamePlay: "Semi-final simulation: high pressure, close game, 2 wickets needed off last over",
          coachFocus: "Confidence over correction. This week is about belief, not technique fixes.",
        },
        {
          number: 3, day: "Friday", label: "Tournament Day / Celebration", duration: "90 min",
          warmUp: ["Full pre-match ceremony — team name, jersey, cheer"],
          mainWork: [
            "Kwik Cricket inter-batch tournament — full competitive format",
            "3 matches per team across the session",
            "Coach umpires, scorekeeper student-managed",
            "Parents invited for final match and trophy ceremony",
          ],
          gamePlay: "Tournament — this IS the session",
          coachFocus: "Trophy and medal for every participant. Announce awards: Most Runs, Most Wickets, Best Fielder, Most Improved.",
        },
      ],
      assessment: "Tournament performance. Enjoyment level. Sportsmanship observed.",
      globalStandard: "CA Cricket Blast — festival of cricket, participation over performance. ICC — every child a winner.",
    },
    {
      month: "Aug 2027", shortMonth: "Aug",
      phase: "Phase 6 — Tournament", phaseColor: "red",
      monthGoal: "Year-end assessment, certificates, pathway planning",
      sessions: [
        {
          number: 1, day: "Monday", label: "Final Skills Assessment", duration: "75 min",
          warmUp: ["Sep 2026 recall: 'show me what you knew in September'", "Compare — students amazed at their own improvement"],
          mainWork: [
            "Batting assessment: 6 balls at live bowling — coach records score + technique",
            "Bowling assessment: 6 balls at target — accuracy score",
            "Throwing: 5 throws at stumps from 10m — accuracy score",
            "Catching: 10 catches — success rate recorded",
          ],
          gamePlay: "Final fun match — all skills applied",
          coachFocus: "Celebrate measurable improvement. Every student should see they improved vs September.",
        },
        {
          number: 2, day: "Wednesday", label: "Reports & Pathway", duration: "75 min",
          warmUp: ["Relaxed session — fun warm-up games", "Student-led activity: they pick warm-up game"],
          mainWork: [
            "Individual progress report distributed — parent copy + student copy",
            "Pathway discussion: who is ready for Junior U14 batch?",
            "Students who stay in Foundation: what focus for next year?",
            "Guest talk (if available): older student sharing their cricket journey",
          ],
          gamePlay: "Free play — students pick their favourite game from the year",
          coachFocus: "Transition to Junior should feel like a graduation, not just a move.",
        },
        {
          number: 3, day: "Friday", label: "Year-End Ceremony", duration: "90 min",
          warmUp: ["Red-carpet arrival — students walk in to team cheer"],
          mainWork: [
            "Year highlights reel (photos/video on a phone shown to group)",
            "Coach personal speech — 1 positive thing about each student publicly",
            "Certificate distribution — all students receive Academy Certificate",
            "Awards: Most Improved, Best Batter, Best Bowler, Best Fielder, Captain's Award",
          ],
          gamePlay: "Parent-child cricket festival — 20 min match with parents playing too",
          coachFocus: "End the year so positively that every student wants to return. This session = next year's admissions.",
        },
      ],
      assessment: "Full year comparison report. Progression decisions documented. Parent feedback collected.",
      globalStandard: "BCCI NCA Foundation graduation criteria. ICC LTAD holistic multi-skill assessment.",
    },
  ],
};
