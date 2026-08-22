# 08 — Sentiment Scoring of Phrase Corpus
**Date:** 2026-08-22
**Phrases scored:** 1106
**Method:** Lexicon intensity (high-distress + medium-distress terms) + able-agency signals + SA geo flag.
**Note:** Operator research scoring, not clinical diagnosis.

## Polarity distribution
- **distress**: 376
- **constructive_pain**: 307
- **neutral_info**: 226
- **agency**: 193
- **high_distress**: 4

## Highest intensity phrases (distress signal)
| Intensity | Able signals | Phrase |
|----------:|-------------:|--------|
| 6.0 | 0 | I explode over small things and hate myself after |
| 6.0 | 0 | snap at everyone then regret it |
| 6.0 | 0 | why emotional numbness won't go away |
| 6.0 | 0 | I provide for everyone and I'm running on empty |
| 4.5 | 1 | I know I'm overreacting but I can't stop in the moment |
| 4.5 | 1 | can't stop overthinking |
| 4.5 | 1 | I can't stop overreacting |
| 4.5 | 0 | mental exhaustion that won't go away |
| 4.5 | 0 | I overreact then spend the night regretting it |
| 4.5 | 0 | I'm exhausted by the emotional load at home |
| 4.5 | 0 | why do I feel numb after stress |
| 4.5 | 0 | shutdown after overload |
| 4.5 | 0 | why do I feel foggy and flat |
| 4.5 | 0 | is numbness a sign of burnout |
| 4.5 | 0 | stress has destroyed my patience |
| 4.5 | 0 | trapped in stressful job for money |
| 4.5 | 0 | load shedding stress and work pressure |
| 4.5 | 0 | I feel trapped between burnout and financial responsibility |
| 4.5 | 0 | Gauteng professional trapped stress |
| 4.5 | 0 | why burnout won't go away |
| 4.5 | 0 | why exhaustion won't go away |
| 4.5 | 0 | why overreacting won't go away |
| 4.5 | 0 | why emotional triggers won't go away |
| 4.5 | 0 | why overthinking won't go away |
| 4.5 | 0 | why rumination won't go away |
| 4.5 | 0 | why self sabotage won't go away |
| 4.5 | 0 | why stress reactions won't go away |
| 4.5 | 0 | load shedding stress and burnout |
| 4.5 | 0 | load shedding stress mental exhaustion |
| 4.5 | 0 | I overreact to small things at home and then feel ashamed for hours |
| 4.5 | 0 | I feel trapped between burnout and financial responsibility in SA |

## Best able-person + pain intersection (priority ranking targets)
| Intensity | Able | Phrase |
|----------:|-----:|--------|
| 3.0 | 2 | how to stop snapping at people |
| 3.0 | 2 | how to stop snapping Durban |
| 3.0 | 2 | how to stop regretting what I say in arguments |
| 3.0 | 2 | how to recover from emotional shutdown |
| 3.0 | 2 | how to recover from emotional numbness |

## Scoring legend
- **high_distress**: multiple strong negative markers
- **constructive_pain**: distress + agency language — **best for ranking pages**
- **agency**: recovery/tool language without heavy distress
- **neutral_info**: informational / mechanism
