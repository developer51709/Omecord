// src/calls/control/HelpMenu/HelpTopics.js

export const HelpTopics = {
    AUDIO: {
        label: "Audio Issues",
        description: "No sound, low volume, or one-way audio.",
        content: [
            "- Check your input/output device in Discord settings.",
            "- Make sure your microphone is not muted.",
            "- Ensure server mute/deafen is not enabled.",
            "- Try leaving and rejoining the voice channel."
        ].join("\n")
    },
    VIDEO: {
        label: "Video Issues",
        description: "Camera not showing or frozen video.",
        content: [
            "- Check camera permissions in your OS and browser.",
            "- Close other apps using the camera.",
            "- Disable and re-enable video in Discord.",
            "- Try switching to a different device."
        ].join("\n")
    },
    CONNECTION: {
        label: "Connection Issues",
        description: "Lag, disconnects, or high ping.",
        content: [
            "- Check your internet connection stability.",
            "- Avoid heavy downloads/streams while in a call.",
            "- Try switching networks if possible.",
            "- If issues persist, try again later."
        ].join("\n")
    },
    SAFETY: {
        label: "Safety & Reporting",
        description: "Staying safe and reporting abuse.",
        content: [
            "- Do not share personal information.",
            "- Use the Report button to flag bad behavior.",
            "- Block and report users who violate rules.",
            "- Contact server staff for serious issues."
        ].join("\n")
    }
};