# SOURCES.md — Sample Complaint Photos

Dummy attachments for manually testing the complaint-submission photo upload flow
(`POST /api/upload/complaint-attachment`, max 5MB, `image/jpeg|png|webp` only). All
sourced from Wikimedia Commons, openly licensed, real photographs — not staged or
AI-generated. Attribution below satisfies CC BY / CC BY-SA license requirements.

| File | Maps to seed category | Source | License | Author |
|---|---|---|---|---|
| `street-light-not-working.jpg` | Street Light Not Working (Roads & Infrastructure) | [File:LED streetlight.JPG](https://commons.wikimedia.org/wiki/File:LED_streetlight.JPG) | CC0 (public domain) | — |
| `pothole-road-damage.jpg` | Pothole / Road Damage (Roads & Infrastructure) | [File:Potholes - at the junction of Philip Lane N15 and Mount Pleasant Road N17.jpg](https://commons.wikimedia.org/wiki/File:Potholes_-_at_the_junction_of_Philip_Lane_N15_and_Mount_Pleasant_Road_N17.jpg) | CC BY-SA 2.0 | Alan Stanton |
| `sewerage-line-leakage.jpg` | *(bonus — no exact seed category; closest: Leaking Pipe)* | [File:Sewer overflow RI EPA.jpg](https://commons.wikimedia.org/wiki/File:Sewer_overflow_RI_EPA.jpg) | Public domain | U.S. Environmental Protection Agency |
| `water-pipe-leakage.jpg` | Leaking Pipe (Water & Sanitation) | [File:Burst pipe from freezing.jpg](https://commons.wikimedia.org/wiki/File:Burst_pipe_from_freezing.jpg) | CC BY-SA 3.0 | Tomwsulcer |
| `power-outage.jpg` | Power Outage (Electricity & Power) | [File:Calle Larga at night during power cut.jpg](https://commons.wikimedia.org/wiki/File:Calle_Larga_at_night_during_power_cut.jpg) | CC BY-SA 3.0 | Jen |
| `broken-manhole-cover.jpg` | *(bonus — not a seed category; safety-hazard complaint)* | [File:Open Manhole and Cover Mid-City New Orleans.jpg](https://commons.wikimedia.org/wiki/File:Open_Manhole_and_Cover_Mid-City_New_Orleans.jpg) | CC BY 2.0 | Bart Everson |
| `illegal-dumping-garbage.jpg` | *(bonus — not a seed category; sanitation complaint)* | [File:Scales Road, London N17 -mattress mountain-9Aug2006.jpg](https://commons.wikimedia.org/wiki/File:Scales_Road,_London_N17_-mattress_mountain-9Aug2006.jpg) | CC BY-SA 2.0 | Alan Stanton |

## Notes

- All files are well under the 5MB upload limit (largest is ~4.0MB — `broken-manhole-cover.jpg`).
- Not committed to git history by default here — add to `.gitignore` if you don't want
  ~8.5MB of test images in the repo, or commit them if you want teammates to have the
  same fixtures. Your call.
- Wanted an 8th image for "urban flooding / waterlogging" too, but Wikimedia's servers
  started rate-limiting direct full-resolution downloads mid-session ("Too many
  requests") after several in a row — the other 7 categories below already cover
  everything asked for plus a few extras. Can fetch that one separately later if wanted.
- CC BY / CC BY-SA files must keep this attribution if redistributed; CC0 / Public
  Domain files don't legally require it, but source links are kept for traceability.
