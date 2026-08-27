---
title: Getting Hard
date: 2026-08-16
---

![](optica/laser.mov)

**I've done most of my work behind a computer.** Turns out you can do [a lot there!](/w/varwise) I think the reason behind this for me is **accessibility**. To a reasonable extent, software is a level playing field - A modern laptop is all you need, [if even that](peek:optica/torvalds.png).

The only thing between you and real impact is clever insight and good implementation. For me, this was in astronomy-- an intrinsically hands-off field.

Software is fun. But I wouldn't say it's what I'm made for. Really, I just want to make cool, real things.

So when I got the call from [**Optica**](https://optica.industries) to work for the summer, I took the chance to switch things up. This blogpost is two things; a mini proof-of-life for my work over the summer, and a hopefully useful accounting of what to expect when getting into hardware from the softwareman's perspective.

## The engineering problem

Optica is a metals recycling company. **I won't go into details on tech or strategy here for obvious reasons**, but the core engineering task is to take pieces of shredded scrap aluminum, use [LIBS](https://en.wikipedia.org/wiki/Laser-induced_breakdown_spectroscopy) to ascertain its composition, and sort it into buckets.

This involves a physical system to feed the pieces in a regular fashion onto a conveyor belt, perception to detect and reason about piece geometry, high-speed control to target and strike the moving piece with a high-powered pulsed laser, and a mechanical sortation system.

# Lessons from Going (from) Soft(ware) to Hard(ware)

Hardware is a very different flavor of engineering. One of my goals this summer was to get clarity on this, and so I've put together this little accounting of the big points. 

## Stupid Things Pile Up

    Let's say your program has some sort of bug or issue. The path to a fix is essentially always:

    ![](optica/software.svg?noframe)

    Software is convenient by design. Your results are perfectly determined by your code; code is perfectly accessible and editable. It's a rather clean process - you'll never worry if you can change a textfile.

    In hardware, this is not the case. You're very much liable to stupid blockers; things like stripping a screw, not having the right tool, manufacturer sending the wrong item, etc. The process has no guarantee of simplicity or convenience. 
    
    Take our pneumatics system for example; we needed to upgrade our airtank to feed our new sorter-- in principle a very simple thing! Just a tank that stores pressurized air -- I was able to get one off McMaster for next-day delivery in under 10 minutes. The next morning, the 8 foot tall, 700lb beast comes off the truck. Problem- *the trucker's pallet jack can't raise it high enough onto our factory floor from the street*. Trucker leaves, and I'm left with an expensive, immovable piece of metal on the sidewalk in front of our building. 

    The path to the solution then looks something more like this:

    ![](optica/hardware.svg?noframe)

    ![Forklift lifting tank](optica/tankforklift.jpeg)

    To put it simply, stupid things always come up, and they often turn out to be the hard part.


## Design Inertia

    Working in hard tech, there's this effect that I'd like to call *design inertia*, the tendency to stick to one design longer than it merits, and the way that choices stack upin a dependent way

    Going from zero-to-one in a physical system is hugely committal. 
    
    1. Parts cost money. Sometimes lots of money.
    2. Parts take time to arrive, sometimes weeks, sometimes even months.
    3. Fabrication and assembly takes TONS of full-effort man-hours.
    
    So when it *doesn't work*, the first instinct is to make a modification. Then another, and another, each iteration not quite working but suggesting a patch for the next. You end up stuck on a mediocre local descent. Often, the actual solution is on an entirely different design branch. **It's both literally and emotionally difficult** to make that leap. 

    Not only this, but in move-fast settings like a startup, you'll often have already built other things on top of these things. Any change at a lower level would cascade into exponentially more work downstream. The marginal cost of a design change is enormous, so it takes a great force to drive one.
    
    But sometimes there's a demo tommorrow, and the feeding system is just not working as well as it needs to.

    ![Pre-demo fab marathon. Redoing EVERYTHING.](optica/buildinprogress.jpeg)


## Things can just Not Work

    The blessing of software is in the infallibility of computers. You-- through your code-- are in full control of the result, which narrows your scope of responsiblity down to just your own logic. If you're right, it will Just Work™.

    When engineering in the real world, you're susceptible to vastly more niche faults throughout the entire hierarchy of your system. You can do everything right, and something obscure will find a way to break it all. Good luck finding it...

    ![Part of an old system. Juicy bits censored.](optica/system_censored.png)

    There was a distinct roadblock we had was within our controls system-- not a vastly complex system, but one that we had checked over and over again. All was OK, but the laser was not firing. It got to the point where we spent over a thousand dollars just to ship the laser back to the manufacturer and see if it was their issue.

    The culprit? One firmware-level value for the laser's internal Q-switch timing FPGA was misconfigured by a few microseconds...

    ![](optica/oscqswitch.jpeg)

## The real-to-code bridge

    A system is useless if its software doesn't have total knowledge of the physical setup and its properties. How does our belt software know how all of this is setup? Where its sensors are, where the laser is, how to control the laser, how the laser focusing responds to control voltages, etc. *This is something that initially seemed straightforward, but I was surprised by how interesting of a challenge it was.*

    ![Calibrations for the z-axis beam focuser using my makeshift laser profiler and optical system model.](optica/beamsweep.gif)

    A side remark: hardware makes you scrappy. You don't always have what you need on hand (or, you accidentally break a several thousand dollar instrument by blasting it with the laser.), so you get to adapt! Instead of buying (another) specialized laser beam profiler, I figured out that I could instead repurpose the CMOS sensor on [this astronomy cam](https://www.bhphotovideo.com/c/product/1824002-REG/zwo_asi432mm_usb3_0_mono_astronomy.html), put some optics on it, and mount it on my calibration assembly.

    ![Calibration assembly - A cone so that height profiler slices (hyperbolae) can be related to 3-axis planar orientation.](optica/calibcone.jpeg)
    

## The Cool Factor

    Of course, the most important part. 

    ![Air jet blowing a piece of scrap](optica/airjet.mov)

    In my humble opinion, making things happen right in front of you will always surpass any result on a computer screen. I value things you can really *experience*. 
    
    ![even Famous Rapper Baby Keem thinks this stuff is cool](optica/keem.jpeg)


# On (The & My) Future

It goes without saying that software is becoming less human involved. Within four years, models have gone from useless to essentially superhuman at software development. Indeed, coding is the perfect task; it is verifiable, fully digital, extremely fast to rollout, and strongly transferable. It makes total sense that this occured at the base of the exponential.

Hardware is at a different point. It is less verifiable, not digital, slow to rollout and difficult to transfer across subdomains. While models generally understand principles of design and specifics across many fields, they cant *do* anything with it. [Generative CAD](https://github.com/huggingface/cadgenbench) is not yet terribly useful, it obviously can't mount an extrusion for me, and I don't yet trust its spatial perception enough to create anything final.

It's clear to me that the bottleneck for useful artificial physical engineers are physical capabilities, and I'm extremely excited to work on fixing that.

# Miscellaneous Gallery

