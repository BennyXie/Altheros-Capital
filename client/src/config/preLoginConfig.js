import { IconUser, IconStethoscope } from "@tabler/icons-react";

export const LOGIN_SELECTION_CONFIG = {
    iconSize: 100,
    cards: [
        {
            text: "I'm a Patient",
            subtext: "Book appointments & manage care",
            icon: IconUser,
            bg: "var(--color-patient-cta)",
            href: "/login",
        },
        {
            text: "I'm a Provider",
            subtext: "Access provider portal & manage patients",
            icon: IconStethoscope,
            bg: "var(--color-provider-cta)",
            href: "/login",
        },
    ],
};
