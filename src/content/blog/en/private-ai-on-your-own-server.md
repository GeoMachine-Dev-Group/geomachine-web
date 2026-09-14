---
title: "Private AI: when your data cannot leave the building"
description: "What running AI on your own server costs, what it takes in hardware, and when a public assistant like ChatGPT is the wrong answer for a business."
pubDate: 2026-09-14
keyword: "private ai on own server for business"
pillar: "IA"
relatedService: "IA-04"
draft: false
---

There is a specific moment where a public AI assistant stops being an option for a business: when the text you would paste into it is not yours to paste.

Client records. Medical or legal files. Salaries. A supplier contract with a confidentiality clause. An unreleased design. In every one of those cases the question is not whether the model is good. It is whether you are allowed to send that text to a third party at all.

## The three real options

**1. Public assistant, free plan.** Fine for what is already public or invented: drafting a generic email, brainstorming names, rewriting a paragraph. Not for anything that identifies a person or a client.

**2. Business API with a data-processing agreement.** The provider commits contractually not to train on your data. This is legitimate and is what most companies use. It costs per usage, it requires reading the contract, and it still means your data crosses a border on every request.

**3. A model on your own machine.** The data never leaves. No usage bill, no provider to trust, no change of terms of service to worry about. In exchange you buy hardware and you own the problem.

Most businesses need option 2. Some genuinely need option 3, and those are the ones people advise badly — either by pretending it is trivial or by treating it as science fiction.

## What option 3 actually costs

**Hardware.** The whole thing hinges on GPU memory, because the model has to fit in it. As of now:

- A consumer GPU with 16 GB of memory runs a small model well and is enough for classification, extraction, summarising and internal search. Around 600 to 900 € for the card.
- 24 GB opens up mid-sized models, which is where the quality starts to feel like a commercial assistant. Roughly 1,500 to 2,000 €.
- Beyond that you are into professional cards and the price stops being interesting for a small business.

Buy the memory, not the benchmark score. A slower card with more memory beats a faster card that cannot load the model at all.

**Setup.** Getting it from "the card is installed" to "the team uses it every day" is the actual project: the model, the serving layer, an interface people will open, your documents indexed so it answers about *your* business and not about the world in general, and access control so the wrong person does not read the wrong file. I charge 3,000 to 8,000 € for that depending on scope, and a hardware audit on its own is 350 to 600 € if you only want to know what to buy.

**Running it.** Electricity and someone who keeps it alive. A machine like this idles at a few watts and draws real power only while answering.

## Where it pays off and where it does not

**It pays off when** the same question gets asked of the same documents every day — a team searching contracts, a support desk answering from a manual, anyone extracting structured data from invoices or forms. Volume is what makes it worth owning the machine.

**It does not pay off when** usage is occasional. Twenty questions a week through a business API costs less than the electricity of a machine you bought to ask twenty questions a week. Own the hardware when the alternative bill would be bigger, or when the data genuinely cannot leave — not because owning a server feels safer.

## The part nobody mentions

A private model is not automatically a better model. The open models you can run on your own hardware are behind the biggest commercial ones, and pretending otherwise is how these projects lose credibility six weeks in.

What you gain is not quality. It is that the data stays put, the cost is fixed and known, and nothing you built stops working because a provider changed its pricing or its terms. For some businesses that is worth more than the last ten per cent of quality. For most, honestly, it is not — and I will tell you which one you are before you spend anything.

If you want to know where you stand, a process audit is 400 to 800 € and ends with a written answer: what is worth automating, what is not, and which of the three options above fits. Sometimes the answer is that you do not need this at all.
