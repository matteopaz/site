---
title: 'VarWISE: infrared variability from NEOWISE single exposures'
date: 2026-05-18
---

<script>
	import Ref from '$lib/Ref.svelte';
	import Figure from '$lib/Figure.svelte';
</script>

NEOWISE spent a decade imaging the entire sky at 3.4 and 4.6 μm. VarWISE is a
catalog of the infrared-variable objects hiding in that single-exposure data —
built by clustering apparitions spatially, then detecting and classifying
variability with machine learning rather than with hand-tuned cuts.

<Figure
	src="/img/placeholder.svg"
	alt=""
	caption="Lorem ipsum dolor sit amet, consectetur adipiscing elit — a placeholder for the figure that belongs here, with the caption set centred beneath it." />

Every object carries a predicted variable type, a best-fit period where the
variation is cyclical, and a set of parameters describing the character of the
variability. The Pure Catalog holds 457,080 objects of highest confidence, just
under half of them new discoveries; the Extended Catalog holds 1,918,082, of
which 82% are new.

The paper works through the caveats particular to each variable type, and picks
out a handful of new objects turned up by a first pass through the catalogs.

<Ref
	authors="M. Paz, J. D. Kirkpatrick, R. Uttamchandani, T. Raen, and R. M. Cutri"
	title="VarWISE: Infrared Variability via NEOWISE Single-exposure Photometry"
	venue="The Astrophysical Journal Supplement Series"
	detail="284, 41"
	year="2026"
	href="https://iopscience.iop.org/article/10.3847/1538-4365/ae562f"
	label="Read on IOPscience" />
