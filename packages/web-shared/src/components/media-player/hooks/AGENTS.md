# Media Player Hooks Guide

This directory contains hooks private to the Media Player compound family.
Each hook owns one stateful concern, such as playback-engine lifecycle, control
interactions, countdown timers, or player-screen coordination. Do not export
these hooks from the family public barrel unless they are intentionally a
consumer-facing API.
