# Roadmap

What the project intends to work on, in rough order. These are intentions, not commitments or dates: the project is maintained by one person, and a measured result can reorder everything below it. Completed work moves to the [changelog](CHANGELOG.md).

## Now: evidence for what exists

The method is argued, not measured. Closing that gap comes before adding to it.

- **A first model-evaluation run** on the current release, with and without the plugin, and its results published honestly, including the cases that fail ([testing](docs/development/testing.md#3-model-evaluations-paid-opt-in)).
- **A blind human comparison** of pages made by 0.1.0 and the current method for the same briefs, using the protocol in [testing](docs/development/testing.md#4-human-judgement).
- **A live-session test** of the plugin: the skill loading and running end to end in Claude Code, not only installing.
- **Testing the other surfaces:** a claude.ai upload and the Skills API with the release ZIP.

## Next: coverage

- **Eval cases for what is not covered:** a developer portfolio, an architecture studio, a large e-commerce catalogue, an immersive campaign with 3D, and a design system.
- **Windows:** run the free checks and the tools on Windows and fix what breaks.
- **Templates the scan cannot read** (Pug, Haml, Slim, Razor, JSP, HEEx, Go HTML): rules for the most common, so fewer projects end with incomplete coverage.
- **Headed rendering for WebGL:** an option for the rendered tools to use a headed browser, for experiences that stall headless.
- **Research upkeep:** a manual browser check of the Deep Beauty reference, and a periodic external link audit ([research gaps](research/RESEARCH_GAPS.md)).

## Later: considered, not started

- Publishing the documentation site on a schedule tied to releases.
- A submission to Anthropic's plugin directory, when the evidence above exists. That is the owner's decision.

## Not planned

- **A house style, theme or component library.** The skill has no look of its own, by design.
- **Native iOS and Android guidance.** The method is for the web.
- **Paid evaluations in CI**, or any check that needs a secret to run on a pull request.
- **Telemetry.** The tools send nothing anywhere.

Suggestions are welcome as [issues](https://github.com/erenthedeveloper0/form-and-force/issues). A suggestion that comes with evidence (a page the method handled badly, a measurement, a source) moves fastest.
