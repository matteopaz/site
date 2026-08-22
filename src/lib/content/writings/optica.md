---
title: Getting Hard
date: 2026-08-16
hero: optica/laser.mov
---

#

**I've done most of my work behind a computer.** Turns out you can do [a lot there!](w/varwise) I think the reason behind this for me is **accessibility**. To a reasonable extent, software is a level playing field. If you own a modern laptop, you're already playing with god-level equipment relative to some experts. 

![Torvalds](optica/torvalds.png)

So, the only thing between you and real impact is clever insight and good implementation. For me, this was in astronomy-- an intrinsically hands-off field.

Software is fun. But I wouldn't say it's what I'm made for. Really, I just want to make cool, real things. That mean

So when I got the call from [**Optica**](https://optica.industries) to work for the summer, I took the chance to switch things up.

### The engineering problem

Optica is a metals recycling company. *I won't go into details on tech or strategy here for obvious reasons*, but the core engineering task is to take pieces of shredded scrap aluminum, use (LIBS)[libs link] to ascertain its composition, and sort it into buckets.

This involves a physical system to feed the pieces in a regular fashion onto a conveyor belt, perception to detect and reason about piece geometry, high-speed control to target and strike the moving piece with a high-powered laser, and a mechanical sortation system.

# Lessons from Going (from) Soft(ware) to Hard(ware)

Although I indulge here, I find the common declaration of being a hardware "person" or "company" comical and useless (link to short writing).

In any case, working in "hardware" is a very different flavor of engineering. One of my goals this summer was to get clarity on this, and so I've put together this little accounting of the big points. 

## Things can just *not work*

    Let's say your program has some sort of bug or issue. The path to a fix is essentially always:

    ( Identify the issue ) --> ( Find the responsible source code ) --> ( collect data, reason about the fix, ) --> ( Change text in a file )

    Now, the actual process may be easy, or very difficult. But you have a beautiful guarantee -- computers are perfect, and code is an observable and deterministic thing. All that's between you and success is your ability to express the proper logic. *It's all very clean.*

    In hardware, this is very much not the case. Take our pneumatics system for example; we needed to upgrade our airtank to feed our new sorter-- in principle a very simple thing! Just a tank that stores pressurized air -- I was able to get one off McMaster for next-day delivery in under 10 minutes.

    The next morning, the 8 foot tall, 700lb beast comes off the truck. Problem- *the trucker's pallet jack can't raise it high enough onto our factory floor from the street*. Trucker leaves, and I'm left with an expensive, immovable piece of metal on the sidewalk in front of our building. 

    The path to a solution then looks something more like this:

    ( Realize the issue ) --> ( Try moving it with the whole company )(a) --> ( That fails ) --> ( decide we need a forklift )(b) ( --> ( ask people to move their cars to accomodate the forklift ) --> ( get the tank on the lift ) --> ( shuffle the tank into position )(c) --> [ airtank upgraded! ]
    
                                
                               (a) > ( The pallet breaks ) --> ( go grab the drill and screws ) --> ( pallet fixed )
                                (b) > (recall from my commute that there's a crane company a few blocks down ) --> (convince them to bring a forklift and foreman out same-day) 
                                (c) > (feeding system is in the way) --> ( temporary disassembly ) 


    ![Forklift lifting tank](optica/tankforklift.jpeg)

## Design Inertia
    It is HARD to MAKE things.
 -- singulation overhaul

## The Cool Factor

 -- pieces flinging

 -- Laser engraving

    *even Famous Rapper Baby Keem thinks it's cool*.

## invisibility
    the design of a system is in many ways less obvious.
    -- look at the wirenest

    in software everything must be text in a directory. ultimately perfectly visible
    in hardware, there is no guarantee: I got a resistor wrong once, here is the difference

    image of system w resistor
    image of system w new resistor (comically similar)

## The hardware / software bridge
    hardware needs software and software needs hardware. hardware dont care about software. software needs info about hardware to exist, and that info can often be difficult to give.

    -- Calibration!!

# unknown title

goes without saying that software is becoming less human involved. 

the same will soon happen with hardware, and that will be insane when it does.

the most important thing to work on right now is getting to a similar inflection point for things in real life.

<!-- Up until now, most of my work consisted of software - doing research, writing code, inspecting assets, debugging, producing valuable *information*.  -->

### Miscellaneous Gallery

Things which I'm proud of that don't fit in the narrative:

1. Full pneumatic system and specs
3. The optical chain
4. Control equations for our optical system
5. This nasty bacskspin
5. lighting cig with laser
6. meeting baby keem


### asset list (specific)

    General
        -- Pic of whole optical system (g) DONE
        -- Video of best demo
        -- Pic(s) of whole belt (g) DONE
        -- Learning how to weld timelapse DONE
        -- Cool pic of me from Ahi DONE
        -- Grinding pic of Jackson DONE

    Picture of tank ordeal
        -- bay doors pic (g) DONE
        -- tank on forklift DONE


    Laser gating stuff
        -- Tarca Slack Diagrams DONE
        -- IRL pic of oscilloscope  DONE

    Singulation
        -- CAD screenshots (probably only of after exists) ASK
        -- Before ASK 
        -- During (cant)
        -- After (g) DONE

    Laser Engraving
        -- Baby Keem DONE
        -- Video of engraving Optica (g) DONE
    
    Pieces Flinging
        -- Blowing an optimal piece on MAX tilt (g) DONE


    Control Unit
        -- Picture of whole assembly, extra wires hanging around (g) DONE
        -- Slightly more focused image on one resistor (g) DONE
        -- Same as above, except with different resistor (g) (cant)

    Calibration
        -- Render of the whole system and its calculated DOFs (g references)
    
        -- Cone Method 
            -- Pitch method paneled image (cant)
            -- cool 3d render of slicing cone 
        
        -- Beamcam
            -- DIY beamcam in assembly cone (g) DONE
            -- DIY beamcam capture with overlay and shit DONE

        -- Optics
            -- Paneled diagram of model, sweep, etc DONE