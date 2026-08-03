# Jingjing: Underground Anthem
### A Game Design Document

*In-world epithet: "The Genomic Danceweaver" — the title Jingjing earns once she's leveled up enough to be legendary in the scene.*

---

## 1. High Concept

A rhythm roguelite about a secretive bedroom producer who has to sneak her music career past every adult in her life, one loot cabinet and one beat-matched combo at a time — all the way to a stage next to Taylor Swift.

By day, Jingjing is boring and unremarkable. By night, she raids the city's underground music scene: busking spots, basement clubs, warehouse parties. She wins beat battles, loots vinyl and spicy snacks from cabinets, and dodges the nosy adults who'd shut it all down if they caught her. Her flying corgi Donut is always overhead. Her cat Coconut is usually asleep on the mixing desk.

- **Genre:** Rhythm Roguelite + Career Sim (hub-and-run structure, à la *Hades* crossed with a step-sequencer rhythm game)
- **Platform:** Mobile-first (portrait touch), also playable on PC
- **Tone:** Wholesome, funny, a little sneaky — low stakes, high heart

---

## 2. Characters

### Jingjing (Player Character)
Pixel-art bedroom producer/DJ, hoodie, dark hair, gold mic in hand. Quiet and unbothered on the surface, obsessive about music underneath. Levels up from anonymous demo-maker to "The Genomic Danceweaver" — a title she has to earn, not one she starts with.

**Barks:**
- Idle: *"Meh meh meh..."*
- Low energy: *"Where's my breakfast?"*
- Good pickup: *"Ooh, mint condition!"*
- Caught mid-jam: *"Uh — yeah, just... doing homework. Meh."*
- Level-up: *"MEH MEH MEH!"* (loud, triumphant)

### Donut — Flying Corgi Companion
Corgi with little wings and a tail that does not stop wagging. Genuinely, unstoppably happy — this is a good boy having the best night of his life every single night. Always airborne just behind Jingjing's shoulder.

**Gameplay role:** Auto-collects loot within a small radius; his tail-wag speed visibly ramps up as he gets closer to hidden cabinets, functioning as a soft radar. Feed him a Spicy Tofu Snack to trigger **Donut Dash** — he zooms ahead for a few seconds and reveals patrol routes of nearby adults, which is the main counterplay to getting caught.

### Coconut — Snowshoe Cat
Found and adopted during Chapter 1. Big fluffy paws, blue eyes, perpetually half-asleep. Does not come out on runs — she has decided this is not her problem — and instead lives permanently on the hub desk, curled up next to the sequencer pads.

**Gameplay role:** A hub-only passive companion. Petting her (short animation, does nothing punishing if skipped) slightly boosts vinyl drop rate for the next run — she's asleep, but apparently it still counts. Occasionally she opens one eye for a bonus line of dialogue.

### The Adults (rotating "villains")
Jingjing isn't unsure about a villain because the game doesn't need one big bad — see Section 6 for the recommended structure: a rotating cast of low-stakes authority figures early, resolving into one real antagonist late.

---

## 3. Core Loop

**Hub (the Bedroom / later, the Tour Van)**
- Spend Vinyl Records (permanent currency) on upgrades: new instrument tracks, cosmetic outfits, Donut ability tiers, higher energy cap.
- Pet Coconut, check breakfast status, pick tonight's setlist (loadout).

**Run ("A Night Out")**
- Explore a short procedurally-arranged sequence of rooms — busking corners, basement clubs, warehouse floors — drawn in the same torch-lit, stone-corridor style as the reference art, re-skinned as backstage halls and venue basements.
- **Cabinets:** the loot containers from the art's dialogue line ("Meh Meh Meh... Is The Cabinet Open?"). Contain Vinyl Records, Spicy Tofu Snacks, or cosmetic gear.
- **Jam Battles:** rhythm minigame encounters against rival buskers (Section 4).
- **Patrols:** adults whose sightline, if it catches Jingjing performing, triggers the stealth minigame (Section 5).
- **Chapter Boss:** a bigger performance-off that unlocks the next career-map node.

**Return to Hub → repeat, career map advances.**

---

## 4. Core Minigame: The Sequencer Battle

Directly built from the reference art's cyan-framed step-sequencer grid (purple/cyan/orange pads).

- A 4×N grid of colored pads. The opponent's track plays a pattern; the player taps the matching pads on beat — Simon-Says crossed with a rhythm-guitar-hero hybrid.
- Combos build a **Hype meter**; misses drain **Energy**.
- Difficulty scales with chapter: more pads, faster tempo, syncopated patterns.
- **Spicy Tofu Snack** (temporary power-up): adds a wildcard pad that's always "correct" for a few beats, and speeds Jingjing's tap window. Stack too many at once and she overheats — a comedic hiccup/stumble animation that briefly shrinks the hit window. Risk/reward, not a pure buff.
- **Vinyl Records** (permanent currency): spent in the hub to unlock new pad colors tied to instruments (drum/bass/synth), each with a unique combo bonus.

---

## 5. Stealth Mechanic: "Caught"

When a patrolling adult's sightline reaches Jingjing mid-performance, the screen quick-cuts to her laptop: a fake homework doc / spreadsheet. A **Suspicion meter** fills; the player has a few seconds of a light QTE (tap the right keys as they flash) to look convincingly busy before it maxes out.

- **Success:** the adult wanders off; bonus Hype for the "Sneaky Save"; Jingjing mutters *"Meh meh meh"* under her breath.
- **Fail:** busted — the run ends early with reduced rewards, and the adult gets a line of comedic dialogue.
- **Counterplay:** Donut Dash (fed via Spicy Tofu Snack) reveals patrol paths in advance so a sharp player can avoid the check entirely rather than relying on the QTE.

This is the mechanic the user specifically asked for ("she has to work on her computer if she's caught by someone") — built as a forgiving comic-relief beat, not a fail-state punisher.

---

## 6. Villain Structure (recommendation)

The user wasn't sure about a villain. Rather than inventing one big antagonist, structure it in two layers:

1. **Early/mid game — episodic and low-stakes.** A rotating cast tied to each chapter: the retail-job manager, a landlord, a hall monitor, an older sibling. Each shows up as the "patrol" NPC for that chapter's stealth encounters. Funny, not threatening.
2. **Late game — one real antagonist.** An A&R rep / talent scout who *does* want to sign her, but only if she changes her sound to something more marketable. This becomes the actual dramatic stakes of the back half: staying true to her sound vs. chasing the deal. It resolves right before the finale, and pays off nicely if Taylor Swift's cameo is the one who tells her to stay true to herself rather than sell out.

This keeps the tone light for most of the game while still giving the ending some weight.

---

## 7. Progression Map

Bedroom Demos → School Talent Show → Busking Downtown → Battle of the Bands → Viral Clip Arc → Label Meeting (A&R arc begins) → Opening Act Tour → Headline Festival → **Meet Taylor Swift** (finale)

The finale is framed as a narrative reward moment (backstage meeting / surprise duet cameo) rather than a mechanical boss fight — the culmination of the Hype/Fame meta-stat built across the whole run history.

---

## 8. Resources Summary

| Resource | Type | Source | Effect |
|---|---|---|---|
| Vinyl Records | Permanent currency | Cabinets, run rewards | Hub upgrades, new sequencer tracks |
| Spicy Tofu Snacks | Temporary power-up | Cabinets, rare pickups | Sequencer wildcard pad + speed; risk of overheat if stacked |
| Hype | In-run score | Jam Battles, Sneaky Saves | Unlocks bosses, feeds Fame meta-stat |
| Energy / "Breakfast" | Drain-over-time meter | Hub meals, rare snack cabinets | At zero, timing windows shrink and Jingjing visibly droops |

---

## 9. Art Direction

Carried directly from the reference: 16/32-bit pixel art, portrait-oriented RPG-trading-card framing for character screens, torch-lit stone-corridor backgrounds re-themed as venue backstages, cyan-glow UI framing the sequencer grid, warm orange for headers/callouts, deep purple/indigo as the dominant ground color.

---

## 10. Scope Options

Three ways to build this depending on available time/resources:

1. **Minimal (hyper-casual arcade):** Just the sequencer minigame + a static hub screen with Donut and Coconut. Career "progress" is a single score/level counter. Fastest to prototype, good for validating whether the rhythm-battle feel is fun before investing further.
2. **Recommended (roguelite hub-and-run):** The full structure described above — hub, runs, cabinets, stealth encounters, chapter bosses, career map, Taylor Swift finale.
3. **Ambitious (branching career RPG):** Adds dialogue choices that shift the "authenticity vs. fame" arc, multiple endings, a full explorable world-tour map instead of a linear chapter list.

**Recommendation:** build the Minimal version first as a prototype to prove the sequencer battle is fun on its own, then expand into the Recommended scope once that's validated.
