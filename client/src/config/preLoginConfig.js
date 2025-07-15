import { IconUser, IconStethoscope } from "@tabler/icons-react";

export const LOGIN_SELECTION_CONFIG = {
    iconSize: 100,
    cards: [
        {
            text: "I'm a \tPatient",
            subtext: "Book appointments & manage care",
            icon: IconUser,
            bg: "var(--color-patient-cta)",
            hoverbg: "var(--color-patient-cta-hover)",
            href: "/login",
        },
        {
            text: "I'm a \tProvider",
            subtext: "Access provider portal & manage patients",
            icon: IconStethoscope,
            bg: "var(--color-provider-cta)",
            hoverbg: "var(--color-provider-cta-hover)",
            href: "/login",
        },
    ],
};
