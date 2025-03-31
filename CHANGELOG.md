# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.1] - 2025-03-31

### Fixed
- Fixed a bug in `pocketBaseInsert` function where array assignment was incorrect. The function was incorrectly assigning the result of `splice()` back to the array, which returns the removed elements, not the modified array.

## [0.2.0] - Initial Release

### Added
- Initial release of pocketbase-store
- Support for Svelte stores for PocketBase collections and records
- Real-time data synchronization
- Caching mechanism
- Sorting utilities