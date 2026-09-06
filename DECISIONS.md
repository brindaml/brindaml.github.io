# Decision log

Your methods section. About one page total.

Answer these as you go, not the night before it is due.
Specifics beat polish - a short honest answer is worth more than a long vague one.

Delete these instructions when you are done, or leave them. It does not matter.

---

## 1. What did you set out to build, and what changed?

What you wanted at the start, and what is actually live now.
Name one thing you dropped or added along the way, and why.

Something I wanted to build was a vague site about who I am and what I enjoy. I didn't want to just dump a lot of information about me, like specifics about who I am because I am a pretty private person, but I did want it to be a lot of pictures and things I enjoy, so someone who knows me can visit it and think know a little more about it, but someone who doesn't know me wouldn't necessarily know it's my website. 





---

## 2. A fork in the road

Name one real choice where you could have gone two ways.
Plain HTML or a framework. One page or several. Your own CSS or someone's template.
What goes on the front page and what does not.

Say which you picked, what the alternative was, and what you gave up by not taking it.

"There was no alternative" is not an answer. Find the fork.

I wasn't sure if I should make the whole website a Pokemon Go calculator, or make it a subset of a broader website with multiple tabs about different things related to Pokemon Go. This was quite a dilemma for me because I thought it could have been cool to do a broaded website, but the static limitations of GitHub along with the limitations of Niantic not publishing public API's for Pokemon Go made that challenging. 

---

## 3. Where you overruled the agent

One time Claude suggested, wrote, or claimed something and you did not take it.

What did it do? How did you notice? What did you do instead?

If it genuinely never happened, say so plainly, and then say what you would have had to
check in order to notice. Being honest here costs you far less than a story you cannot
defend when you record your video.

Claude originally thought when I meant simple, I meant that the website should just tell you the difference between purified and shadow Pokemon, and basically just have a small decision tree. I wanted to have someone input their Pokemon and IVs and then have the calculator tell you if it's actually the best idea to purify the Pokemon or not. Claude wasn't necessarily pushing back, but it definitely did not want me to create a list of the 151 Pokemon in the first generation and their IVs. When I had suggested this, Claude took the suggestion, so it wasn't necessarily a pivot, but I had to push Claude to this diretion, when at every step it kept asking if I was sure or if I wanted to do something easier. 
Had Claude pushed back properly, I would have ensured that the scope made sense for this project still (a static website) but was what I wanted to be able to show the class. Once understanding what the scope of the assignment was and if Claude didn't think those aligned, I would have altered my own ideas for the website, rather than blinding trusting the AI to figure it out. 

---

## 4. How you know it works

What check did you run, and what did it tell you?

Then the real question: **what would have made this check fail?**
A check that could not have failed is not a check.

Link to your `verification/` folder.

To check if the website was actually live, I opened the URL brindaml.github.io to ensure that it went to the website that Claude and I had designed, and all of the aspects of it were working. I checked with a live example of a shadow Pokemon I had in my collection to see if when I put in the stats, it correctly calculated what the new CP would be, and it worked! Additionally, when I fetched the URL with curl everything returned 200 meaning that all of the parts were loaded and everything was working well. 
If the Pages on GitHub were linked incorrectly, the URL would have gone to a 404 error and the verification would have failed. This information is all also in the verification folder in the p1-website repo.

---

## 5. What is still wrong

One thing on your own site that is not right, not finished, or that you do not
fully understand.

What would you do next, and how would you find out?

Something that isn't finished on the website is how I wanted to incorporate more Pokemon graphics and more generations. If given more time or understanding, I would have loved to link the actual sprites of the Pokemon to the website instead of a dropdown menu. I wasnt sure how to do that dynamically in a GitHub website, so moving forward, I would love to be able to use some Pokemon API to render the images. Also, Integrating the other Generations would be awesome, but would take a broader understanding of the mechanisms behind the calculations. I would find out via understandings of APIs and documentation about how to incorporate that onto a site, along with prompting Claude for more information on how to do it effectively. 