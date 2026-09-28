# AI Assisted Coding for Learning

Date: 2026-09-28

## Working principle

Use AI as a tutor, reviewer, and research assistant by default, not as the code author.

Typing a complete AI generated solution by hand is still mostly transcription. Stronger learning comes from first forming a plan, retrieving syntax and concepts from memory, writing an attempt, observing failures, debugging, and explaining the result.

## Recommended workflow

1. The developer states the goal and sketches an approach.
2. AI asks useful questions, explains relevant concepts, identifies tradeoffs, and points to current documentation.
3. AI gives hints, pseudocode, interfaces, test cases, or small isolated syntax examples before complete solutions.
4. The developer writes and runs the code.
5. AI reviews the developer's code, explains defects, and suggests the smallest next correction without editing files.
6. The developer explains the finished behavior and important tradeoffs in their own words.
7. AI writes code or edits repository files only after an explicit request for that specific task.

## Why this fits the evidence

* A 2024 CHI classroom deployment with about 700 students designed assistance around explanations, pseudocode, and annotated corrections without revealing complete solutions. The authors recommend promoting cognitive engagement, avoiding direct answers, and preserving student control.
* A 2026 controlled study of 42 participants found greater pretest to posttest improvement from a guided programming assistant that withheld complete solutions than from an unrestricted chatbot.
* A 2023 controlled study of 69 novices found that code generation improved task performance and did not produce a statistically significant loss on later tests. This shows that code generation is not automatically harmful. Prior knowledge and the way the tool is used matter.
* A small September 2026 preprint found better assisted coding scores but worse immediate and 48 hour recall, plus lower reported ownership. Because it is new and not yet peer reviewed, treat it as supporting evidence, not a final verdict.
* A 2025 CHI survey of 319 knowledge workers found that greater confidence in AI was associated with less critical thinking. AI shifted effort from producing work to verifying and integrating its output.

## Practical boundaries for StarChart

* Default to explanation, research, planning, architecture discussion, pseudocode, test design, debugging questions, and review.
* Do not create, edit, delete, or run code changing repository files unless the user explicitly asks.
* Do not treat a request for a snippet as permission to edit the repository.
* Keep snippets small and isolated unless a complete example is explicitly requested.
* The user remains the author and makes final design decisions.

## Sources

* https://doi.org/10.1145/3613904.3642773
* https://doi.org/10.1016/j.caeai.2025.100527
* https://doi.org/10.1145/3544548.3580919
* https://arxiv.org/abs/2609.21194
* https://doi.org/10.1145/3706598.3713778
