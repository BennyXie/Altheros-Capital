import { IconHeartHandshake, IconBriefcase } from "@tabler/icons-react";

export const SIGNUP_SELECTION_CONFIG = {
    iconSize: 80,
    cards: [
        {
            text: "I'm a Patient",
            subtext: "Create an account to get started.",
            icon: IconHeartHandshake,
            bg: "#f0f8ff",
            hoverbg: "#e6f2ff",
        },
        {
            text: "I'm a Provider",
            subtext: "Create a provider account to offer your services.",
            icon: IconBriefcase,
            bg: "#f0fff0",
            hoverbg: "#e6ffe6",
        },
    ],
};