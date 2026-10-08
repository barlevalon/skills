# tdd

Test-driven development with red-green-refactor loop. Use when user wants to build features or fix bugs using TDD, mentions "red-green-refactor", wants integration tests, or asks for test-first development.

## Compatibility in 2.0.0

The domain vocabulary reader now uses `GLOSSARY.md`, not `CONTEXT.md`. Migrate actual project glossaries and their instruction pointers before using the new reader; leave unrelated context files unchanged. The package does not rename project files automatically. ADR locations and the RED/GREEN/REFACTOR safeguards are unchanged.

## Credits

Local synthesis influenced by:

- [`mattpocock/skills`](https://github.com/mattpocock/skills/tree/main/skills/engineering/tdd) by Matt Pocock
- [`obra/superpowers`](https://github.com/obra/superpowers/tree/main/skills/test-driven-development) by Obra
