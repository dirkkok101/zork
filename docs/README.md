# Zork 1 Text Adventure Game Documentation

This is a 100% authentic recreation of the original Zork 1 text adventure game.
We are using original game material as references and recreating the game using modern software development principles and technologies.
The main reference material for this project is https://github.com/bburns/Lantern
The aim is to reuse the original game scenes, monsters, items, scoring elements in a modern game architecture

# Technologies used

HTML
Typescript
SCSS

# UX

We are going for a green screen retro look and feel that can run in modern browsers
We want to use text under interface elements but with modern quality of life elements
We want the command parser to have command suggestions based on the current game context
But we don't want to spoil the game for the user

# Architecture

DataAccess layer to load data from the data files into memory using our type safe types
Services layer that operates on game data
Command layer that orchestrates between services to achieve game logic
Presentation layer to render the game state to the user and receive input from the user and marshal to commands

# Development approach

We are making use of typescript in strict mode
We always want to work with known types and be type safe
All code should be documented
We are using SOLID coding principles
All code must be unit testable and integration testable
We are aiming for 100% code coverage in commands, services and data access
The reference material is our gospel
If we have a conflict between a unit test and the code we are testing we go back to the reference material to confirm the behaviour
We use logging with different log levels from the LogLevel package so that we can support debug, info, critical and error log messages
