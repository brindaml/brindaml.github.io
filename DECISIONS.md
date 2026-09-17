# Decision log

Your methods section. About one page total.

Answer these as you go, not the night before it is due.
Specifics beat polish - a short honest answer is worth more than a long vague one.

Delete these instructions when you are done, or leave them. It does not matter.

---

## 1. What did you set out to build, and what changed?

What you wanted at the start, and what is actually live now.
Name one thing you dropped or added along the way, and why.

Something I wanted to build was a vague site about who I am and what I enjoy. I didn't want to just dump a lot of information about me, like specifics about who I am because I am a pretty private person, but I did want it to be a lot of pictures and things I enjoy, so someone who knows me can visit it and think know a little more about it, but someone who doesn't know me wouldn't necessarily know it's my website. At first, it was all about Pokemon, but I was able to tailor it to my gaming experience and focus on me as a gamer. I did this to give the website a more personal touch and be able to speak to my gaming hobby, but not give out too much information about myself.




---

## 2. A fork in the road

Name one real choice where you could have gone two ways.
Plain HTML or a framework. One page or several. Your own CSS or someone's template.
What goes on the front page and what does not.

Say which you picked, what the alternative was, and what you gave up by not taking it.

"There was no alternative" is not an answer. Find the fork.

I wasn't sure if I should make the whole website a Pokemon Go calculator, or make it a subset of a broader website with multiple tabs about different things related to gaming. This was quite a dilemma for me because I wanted to make my website personal but I didn't want to scrap the Pokemon Go website. I ended up scrapping it to focus on my Steam experince in gaming, which I think was a great alternative. I gave up having integration of both the Pokemon Go calculator and my personal website, but I really like the end result.

---

## 3. Where you overruled the agent

One time Claude suggested, wrote, or claimed something and you did not take it.

What did it do? How did you notice? What did you do instead?

If it genuinely never happened, say so plainly, and then say what you would have had to
check in order to notice. Being honest here costs you far less than a story you cannot
defend when you record your video.

When I initially said I wanted bubbles that were relative to the playtime of my games, Claude misunderstood what I was saying and had completely changed the design. I had to put in an image of something similar I saw on a different platform and ask Claude to reevaluate. Claude was able to remake the bubbles according to what I wanted after that, and I was really happy with the final result once I finished. I think this was more a miscommunication barrier, and taught me that I need to ensure that the AI fully understands what my goal is, and if I can't articulate it via words, I need to find an image that helps it understand.


---

## 4. How you know it works

What check did you run, and what did it tell you?

Then the real question: **what would have made this check fail?**
A check that could not have failed is not a check.

Link to your `verification/` folder.

To check if the website was actually live, I opened the URL brindaml.github.io to ensure that it went to the website that Claude and I had designed, and all of the aspects of it were working. I checked to ensure my hours were accurate to my actual gaming experience as well. Additionally, when I fetched the URL with curl everything returned 200 meaning that all of the parts were loaded and everything was working well. 
If the Pages on GitHub were linked incorrectly, the URL would have gone to a 404 error and the verification would have failed. This information is all also in the verification folder in the p1-website repo.

---

## 5. What is still wrong

One thing on your own site that is not right, not finished, or that you do not
fully understand.

What would you do next, and how would you find out?

Something that isn't quite done is being able to integrate other games not from Steam. It's hard to get other games onto this website while making sure to obey copyright rules and make sure it looks good, so in the future, I would love to understand the rules of copyright and be able to integrate other games that I play that aren't on the platform. I would also love for it to dynamically update the hours played based on when I play them on Steam, rather than having to update them myself.