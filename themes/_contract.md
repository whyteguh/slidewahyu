# Theme contract — slidewahyu

Every deck is **one file of content** plus **one theme file**. The theme only sets tokens;
it never touches layout. That way a deck can be re-skinned for a different audience by
changing one `<link>`.

## How a deck is assembled

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <title>Materi CRM era agentic</title>
  <link rel="stylesheet" href="../../themes/_base.css">
  <link rel="stylesheet" href="../../themes/incentric.css">
</head>
<body>
  <div class="deck-viewport">
    <div class="deck-stage">
      <section class="slide">…</section>
      <section class="slide">…</section>
    </div>
  </div>
  <script src="../../charts.js"></script>
  <script src="../../deck.js"></script>
</body>
</html>
```

`_base.css` carries structure (stage, ratios, type scale, slide archetypes, print).
`<brand>.css` carries identity (colours, fonts, radii) and nothing else.

## Tokens a theme MUST define

If any of these is missing the deck breaks — the base file has no fallbacks for identity.

| Token | Meaning |
|---|---|
| `--bg` | page / slide background |
| `--surface` | cards, panels, tinted blocks |
| `--ink` | primary text |
| `--ink-soft` | secondary text, labels |
| `--line` | hairlines and borders |
| `--accent` | the brand colour — one only |
| `--accent-2` | optional second colour for highlights |
| `--accent-ink` | text colour on top of `--accent` |
| `--font-sans` | body |
| `--font-display` | headlines |
| `--font-mono` | kickers, numbers, labels |
| `--radius` | 0 for sharp/editorial, 6–14 for soft |

Optional, for `slide.dark`: `--dark-bg` `--dark-ink` and, since dark slides now re-map the
whole token set, `--dark-soft` `--dark-line` `--dark-surface` `--dark-accent`. `_base.css` has
fallbacks, so a theme that only defines the first two still works — the rest inherit a neutral
dark scale instead of leaving `--ink-soft` too dark to read.

## Stage

Every deck is authored at **1920×1080** with plain pixels. `deck.js` scales the whole stage with
a transform to fit the window and centres it. Nothing reflows: what you author is what the
audience sees, on a projector, a laptop, or a phone held sideways.

This replaced an earlier `cqw` + container-query model. That model reflowed, which forced a
hand-written `[data-format="9:16"]` override block that every new component had to be added to.
Fixed pixels removed the whole class of bug.

For vertical content (Reels, TikTok) the 16:9 slide sits in the upper half of a 9:16 frame and
the lower half is left for the speaker on camera. Do not re-author the deck vertically.

## Palettes in use

Pulled from the live sites on 17 Nov 2026, not invented.

| Brand | File | bg | ink | accent | accent-2 | font |
|---|---|---|---|---|---|---|
| Personal / YouTube / Reels | `paper.css` | `#F3EEE3` | `#17130C` | `#E8430D` | `#E9A319` | Bricolage Grotesque |
| Pravide (also report style) | `pravide.css` | `#FAF7F2` | `#45413A` | `#0E7569` | `#1F1D1A` | Instrument Sans |
| Breaktime | `breaktime.css` | `#F5F7F0` | `#1A2E1A` | `#16A34A` | `#EAB308` | Inter |
| Incentric | `incentric.css` | `#F8FAFC` | `#0F172A` | `#014FCF` | `#FFBC00` | Helvetica Neue / Plus Jakarta Sans |
| Incentric (navy) | `incentric-navy.css` | `#FFFFFF` | `#0F172A` | `#0F172A` | `#FFBC00` | Plus Jakarta Sans |
| Scena | — | not decided yet | | | | |
| Editorial / catatan baca | `dossier.css` | `#F2EEE5` | `#15130E` | `#A93C12` | `#1F1D1A` | Fraunces + Inter Tight |

`dossier` is not a company brand — it is the editorial skin for essays and reading notes
(`decks/twelve-weeks`). Authored, not sampled, so it claims no palette from a live site.

## Rules

1. **A theme never sets layout, spacing, or font-size.** Only tokens.
2. **One accent per deck.** Two competing highlights read as a mistake, not a system.
3. **Contrast:** ink on bg at least 7:1. `--ink-soft` at least 4.5:1.
4. **Paper themes stay paper.** If the deck needs a dark cover, use `.slide.dark`, not a
   second theme.
5. Pravide's theme doubles as the **report template** — the `.s-report` archetype in
   `_base.css` is written so the same CSS can render a document page, not just a slide.
