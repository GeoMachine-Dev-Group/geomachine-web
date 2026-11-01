---
title: "Private AI: when your data cannot leave the building"
description: "The three real options for using AI with sensitive data, what we run locally ourselves, and what it taught us about when a private model pays off."
pubDate: 2026-09-14
updatedDate: 2026-11-01
pillar: "IA"
relatedService: "IA-04"
draft: false
---

There is a specific moment where a public AI assistant stops being an option for a business: when the text you would paste into it is not yours to paste.

Client records. Medical or legal files. Salaries. A supplier contract with a confidentiality clause. In every one of those cases the question is not whether the model is good. It is whether you are allowed to send that text to a third party at all.

## The three real options

1. **Public assistant, free or personal plan.** Fine for what is already public or invented: drafting a generic email, brainstorming names, rewriting a paragraph. Not for anything that identifies a person or a client.
2. **Business plan or API with a data-processing agreement.** The provider commits contractually not to train on your data. This is legitimate and it is what most companies use. It still means your data leaves the building on every request.
3. **A model on your own machine.** The data never leaves. In exchange you buy the hardware and you own the maintenance.

Most businesses need option 2. This article is about when you need option 3, and what we learned running it.

## What we run ourselves

On a desktop with an AMD Radeon RX 7900 GRE (16 GB of graphics memory), we have run local AI since August 2026:

- **Questions over our own notes.** The working notes for every project, client and project details included, are indexed on that machine: about 1,640 chunks of text. A small model turns them into vectors to find the relevant ones, and a 14B Qwen3 model answers from them. Neither the notes nor the questions leave the machine. It is the same setup a company needs to ask questions of its contracts or its internal manual.
- **A chat in the browser.** To use it without a terminal we run Open WebUI, an interface similar to ChatGPT but connected to the local model.
- **It only answers the machine itself.** The model server and the chat only accept requests from the same computer, not from the network. A "private" AI that anyone on the office Wi-Fi can query is not that private.
- **Models bigger than the card.** A 30B Qwen3 model, of the "mixture of experts" kind, does not fit in 16 GB. It is split between the card and system memory and still writes at roughly 17 to 28 tokens per second (a token is about a syllable or a short word). Good enough for work that is not urgent.

For comparison, models that fit entirely on the card ran at 43 to 80 tokens per second in our measurements on 1 November 2026, while a 32B model that did not fit dropped to 7.5.

## What it taught us

**1. A local model is not as good as the big paid ones.** The open models that fit on a 16 GB card are behind the best commercial models, and anyone who says otherwise is selling you something. We saw it when we trained a smaller model to write business listings: it was fast, but it invented facts, so we kept a bigger one. What you gain from private AI is not quality. It is that the data stays put, the cost is fixed, and nothing stops working because a provider changed its pricing or its terms.

**2. Installing the model is the easy part.** Getting a model running takes an afternoon. The actual project is everything around it: indexing your documents so it answers about *your* business and not about the world in general, an interface the team will actually open, deciding who can see what, and not leaving it exposed to the network.

**3. One card, one loaded model.** If two tools use different models on the same card, every switch means unloading one and loading the other, which is seconds of waiting. If several people will use it at once, plan for that before you buy.

## Where it pays off and where it does not

**It pays off** in two cases:
- When **the data cannot leave**, by law or by contract: clinics, law firms, accountants, any company holding client data that does not want to depend on someone else's privacy policy.
- When **the same questions get asked of the same documents every day**: a team searching contracts, a support desk answering from a manual, anyone extracting data from invoices or forms. Volume is what makes owning the machine worth it.

**It does not pay off** with occasional use. Twenty questions a week through a business plan with a data agreement costs less than buying and maintaining a machine for it. Own the hardware when the alternative would cost more, or when the data genuinely cannot leave, not because owning a server feels safer.

## What it costs

- **Hardware.** Graphics memory decides everything, because the model has to fit in it. Our 16 GB card cost 650 to 680 € about two years ago. 16 GB runs 8B to 14B models well, which is enough for classification, summarising, extraction and internal search. Mid-sized models, where quality gets closer to a commercial assistant, need 24 GB or more. Buy the memory, not the benchmark score.
- **Setup.** That is the [private AI service](/en/services/#ia); the current price is on the services page. If you do not know what to buy yet, a [hardware audit](/en/services/#sys) tells you which card and which model fit before you spend anything.

## What does not change

It is still AI: it makes mistakes, important decisions need a person checking them, and quality depends on the model you install. Private AI changes where the data lives, not what the AI can do.

---

**Handling data that should not leave your company?** Tell me about your case and I will tell you which of the three options fits, even if the answer is that you do not need private AI at all. [See the service here](/en/services/#ia).
