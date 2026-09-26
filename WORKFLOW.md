# AI Development Workflow Comparison

## Overview

This experiment compared two ways of using AI to build the same Profile Settings feature. Round 1 used a deliberately vague prompt: “Build a profile settings form for my project.” Round 2 used a precise specification containing repository inspection instructions, functional requirements, accessibility constraints, implementation constraints, testing requirements, and a verification step.

## Round 1: Vague Prompt

The vague prompt produced a working Profile Settings implementation quickly, but the workflow provided little direction about validation, accessibility, edge cases, or verification. The AI had to make more implementation decisions independently. This increased the amount of manual review needed to determine whether important requirements had been considered.

The Round 1 implementation established the basic UI and functionality, but the lack of an explicit specification made it harder to verify completeness against a defined acceptance criteria.

## Round 2: Precise Prompt

The precise prompt produced a more deliberate implementation. It explicitly required Full Name, Email, and Bio fields, validation rules, a 160-character limit, success behavior, accessible labels and error associations, keyboard navigation, visible focus states, tests, and a final verification report.

The resulting implementation included `aria-describedby`, `aria-invalid`, focus management, a live Bio character counter, and automated validation tests. The test suite contained 15 tests covering required fields, invalid and valid email formats, Bio length boundaries, simultaneous errors, submission behavior, value preservation, and helper functions.

## Correctness and Edge Cases

Round 2 provided clearer acceptance criteria, making correctness easier to evaluate. Boundary cases such as exactly 160 characters versus 161 characters were explicitly tested. The AI also identified limitations, including the absence of DOM/browser test tooling and the pragmatic nature of the email validation regex.

## Accessibility

The precise workflow explicitly required semantic HTML, associated labels, keyboard navigation, visible focus states, and accessible validation messages. These requirements resulted in accessibility considerations that were not guaranteed by the vague prompt.

## Review Effort

Round 1 required more manual reasoning about what the feature should contain and whether important cases were missing. Round 2 shifted more of that reasoning into the initial specification and automated tests. This reduced ambiguity and made the final review more structured.

## AI Mistake / Review Finding

One important review finding was the Round 2 decision to create the application under `my-capstone-app/` while starting from the setup-only `main` branch. The AI correctly explained that it used the Round 1 structure as a reference, but this architectural decision still requires human review because it affects project organization.

## Conclusion

The experiment showed that a precise prompt with repository context, explicit constraints, acceptance criteria, tests, and verification produces a more predictable and reviewable AI-assisted development workflow than a single vague instruction.
