import type { LegalDoc, LegalId } from "@/lib/legal/types";

// English version of the legal texts. A solid base for an events app operating in Spain,
// but it should be reviewed by a lawyer before launch.

export const legalEn: Record<LegalId, LegalDoc> = {
  terms: {
    title: "Terms and conditions",
    intro:
      "These terms govern the use of ParyUp, the app and website you use to discover events, buy tickets, talk to your crew and relive every night. Please read them carefully: by creating an account or using the service you accept what is set out here.",
    sections: [
      {
        h: "Who we are and what ParyUp is",
        blocks: [
          {
            p: "ParyUp is a platform that brings together nightlife events and plans. It lets you discover events, buy tickets, get in with a QR code, chat with other people, match with people you meet at an event and keep the memory of each party on a profile.",
          },
          { company: true },
          {
            p: "ParyUp does not organise the events: they are organised by clubs, venues and promoters (“organisers”) who use the platform to publish them and sell their tickets.",
          },
        ],
      },
      {
        h: "Acceptance and changes",
        blocks: [
          {
            p: "Using ParyUp means accepting these terms, the Privacy Policy, the Cookie Policy and the Community Guidelines. If you disagree with any of them, do not use the service.",
          },
          {
            p: "We may update these terms to reflect changes to the service or the law. If a change is significant we will let you know in the app or by email with reasonable notice. Continuing to use ParyUp after the effective date means accepting the new version.",
          },
        ],
      },
      {
        h: "Your account",
        blocks: [
          {
            ul: [
              "You must be at least 18 years old to create an account and use ParyUp.",
              "Sign-up is done in the app. The website lets you log in to an existing account, but not create new ones.",
              "You must provide truthful information and keep it up to date. You may not impersonate another person.",
              "You are responsible for your password and for what is done with your account. If you think someone accessed it without permission, tell us as soon as possible.",
              "You can delete your account at any time from the app. Your data is then deleted or anonymised as described in the Privacy Policy.",
            ],
          },
        ],
      },
      {
        h: "Tickets and payments",
        blocks: [
          {
            p: "Tickets are bought in the app. For that purchase, the contract for access to the event is between you and the organiser; ParyUp acts as the platform that facilitates the sale and the payment. The organiser is responsible for the event, its content, its capacity and the access conditions.",
          },
          {
            ul: [
              "The price and conditions of each ticket are shown before you pay. Payments are processed by an external payment provider (Stripe); ParyUp does not store your full card details.",
              "Each ticket has a personal QR code. It is valid only for the event, date and ticket type shown, and only while the event is in progress. Once scanned, it is marked as used.",
              "You may not resell tickets for profit or share your QR with third parties. A duplicated or fraudulent ticket may be cancelled without a refund.",
              "If an event is cancelled, you are entitled to a refund of the ticket price within the timeframes set by the organiser and the payment provider. If it is postponed, the ticket stays valid for the new date unless the organiser offers another solution.",
              "Tickets for leisure events on a specific date or period have no right of withdrawal, in line with consumer law. Apart from cancellation or substantial change, refunds depend on the organiser's policy.",
              "Booking fees, if any, are shown separately before you confirm payment.",
            ],
          },
        ],
      },
      {
        h: "Content you post",
        blocks: [
          {
            p: "You can upload photos, write messages and share other content on ParyUp. You remain the owner of what you post, but you grant us a free, non-exclusive, limited licence to host, display and distribute it within the service, and only as long as needed to provide it (for example, to show your profile or an event recap).",
          },
          {
            p: "You are responsible for what you post. Do not upload content that is not yours, that infringes other people's rights or that breaks the Community Guidelines. We may remove content that breaches these rules or the law.",
          },
        ],
      },
      {
        h: "Acceptable use",
        blocks: [
          {
            p: "You agree to use ParyUp lawfully and respectfully. In particular, you may not:",
          },
          {
            ul: [
              "Harass, threaten, discriminate against or incite hatred towards other people.",
              "Post illegal, violent or non-consensual sexually explicit content, or content that puts minors at risk.",
              "Use the platform for spam, scams, illegal ticket sales or impersonation.",
              "Try to access systems, accounts or data without permission, or disrupt or overload the service.",
              "Use bots, scraping or other automated means without written authorisation.",
            ],
          },
        ],
      },
      {
        h: "Intellectual property",
        blocks: [
          {
            p: "ParyUp, its design, software, trademarks and own content belong to ParyUp or its licensors and are protected by law. We grant you a personal, limited and revocable right to use the app and website; you may not copy, modify or distribute them without permission.",
          },
          {
            p: "Event names, images and data belong to the organisers or their owners.",
          },
        ],
      },
      {
        h: "Availability of the service",
        blocks: [
          {
            p: "We work to keep ParyUp reliable, but we do not guarantee that it will always be available or error-free. We may carry out maintenance, change features or interrupt the service temporarily. We will do what is reasonable to give notice when possible.",
          },
        ],
      },
      {
        h: "Liability",
        blocks: [
          {
            p: "ParyUp is not responsible for the holding, quality or safety of events organised by third parties, or for what happens during them, except where the law provides otherwise. Nor are we responsible for content posted by other users.",
          },
          {
            p: "Nothing here limits the rights that the law gives to consumers or excludes liability that cannot be excluded by law.",
          },
        ],
      },
      {
        h: "Suspension and closing of accounts",
        blocks: [
          {
            p: "We may suspend or close an account, and remove content, if you breach these terms or the Community Guidelines, if necessary to protect other people or if the law requires it. Whenever possible we will explain the reason and you can reply by writing to our contact email.",
          },
        ],
      },
      {
        h: "Governing law and dispute resolution",
        blocks: [
          {
            p: "These terms are governed by Spanish law. If you are a consumer, you may go to the courts of your place of residence and use the dispute resolution systems recognised by law, including the European online dispute resolution platform (https://ec.europa.eu/consumers/odr).",
          },
        ],
      },
      {
        h: "Contact",
        blocks: [
          {
            p: "If you have any questions about these terms, you can write to the contact email shown above.",
          },
        ],
      },
    ],
  },

  privacy: {
    title: "Privacy policy",
    intro:
      "We take care of your data. Here we explain what information we process when you use ParyUp, what we use it for, who we share it with and what rights you have. We comply with the General Data Protection Regulation (GDPR) and Spanish Organic Law 3/2018 (LOPDGDD).",
    sections: [
      {
        h: "Who is the controller",
        blocks: [{ company: true }],
      },
      {
        h: "What data we process",
        blocks: [
          {
            ul: [
              "Account and profile: name, username, email, photo, banner, bio, social links, city, date of birth and gender if you choose to provide them.",
              "Sign-in: if you log in with Google, we receive your name, email and photo from your Google account. We do not receive your Google password.",
              "Tickets and payments: the events you go to, tickets bought, lists you join, amounts and payment status. Your card details are processed by Stripe; we do not store them.",
              "Content and communications: messages, photos, albums, recaps, voice messages and reactions you share in the app.",
              "Relationships: people you follow, who follow you, friendships, matches, blocks and mutes.",
              "Location: if you allow it, your approximate location to show nearby events and, if you turn it on, to share it live with your friends.",
              "Contacts: only if you allow it, to find people who already use ParyUp. We use them for that check and not for other purposes.",
              "Camera, photos and microphone: only when you use them (for example, to upload a photo or send an audio message).",
              "Notifications: a device identifier to send you push alerts, if you turn them on.",
              "Technical data: IP address, device and system type, app version and error and security logs.",
            ],
          },
        ],
      },
      {
        h: "What we use it for and the legal basis",
        blocks: [
          {
            ul: [
              "Providing the service (creating your account, showing events, selling tickets, chat, profile, matches and recap): performance of the contract.",
              "Processing payments, preventing fraud and handling refunds: performance of the contract and legitimate interest.",
              "Sending you notices about your account, tickets and events: performance of the contract.",
              "Push notifications and features based on location or contacts: your consent, which you can withdraw at any time from your device settings.",
              "Security, moderation and enforcement of the Community Guidelines: legitimate interest and legal obligation.",
              "Improving and maintaining the service: legitimate interest.",
              "Complying with legal obligations (for example tax or requests from authorities): legal obligation.",
            ],
          },
        ],
      },
      {
        h: "Who we share your data with",
        blocks: [
          {
            p: "We do not sell your data. We share it only when necessary:",
          },
          {
            ul: [
              "Event organisers: when you buy a ticket, the organiser receives the data needed to manage access (for example, your name and the status of your ticket).",
              "Other users: your profile, posts and attendances are visible according to the privacy you choose in the app.",
              "Providers that process data on our behalf (processors): payments (Stripe), sign-in (Google), maps (Mapbox), hosting and file storage (Cloudflare and infrastructure providers), push notifications (Expo and Apple and Google services) and email delivery.",
              "Authorities and courts, when a law or valid order requires it.",
            ],
          },
        ],
      },
      {
        h: "International transfers",
        blocks: [
          {
            p: "Some providers may process data outside the European Economic Area. In those cases we require appropriate safeguards, such as the European Commission's standard contractual clauses or other valid mechanisms.",
          },
        ],
      },
      {
        h: "How long we keep data",
        blocks: [
          {
            p: "We keep your data while you have an account. If you delete it, we delete or anonymise your data, except what we must keep by law (for example invoices and payments, for the tax and commercial periods) or to handle claims, which is blocked and deleted when the legal period ends.",
          },
        ],
      },
      {
        h: "Your rights",
        blocks: [
          {
            p: "You can exercise at any time your rights of access, rectification, erasure, objection, restriction of processing and portability, and withdraw any consent you have given. You can do many of these yourself from the app: edit your profile, adjust your privacy, download your data or delete your account.",
          },
          {
            p: "For any other request, write to the contact email shown above. If you think we have not handled your data properly, you can complain to the Spanish Data Protection Agency (www.aepd.es).",
          },
        ],
      },
      {
        h: "Minors",
        blocks: [
          {
            p: "ParyUp is intended for people over 18. We do not knowingly collect data from minors. If we detect an account belonging to a minor, we will delete it.",
          },
        ],
      },
      {
        h: "Security",
        blocks: [
          {
            p: "We apply technical and organisational measures to protect your data: encrypted connections, access control, protected passwords and backups. No system is infallible; if a breach affecting your rights occurs, we will tell you as required by law.",
          },
        ],
      },
      {
        h: "Changes to this policy",
        blocks: [
          {
            p: "We may update this policy. We show the date of the latest revision above and, if the change is significant, we will let you know in the app or by email.",
          },
        ],
      },
    ],
  },

  legal: {
    title: "Legal notice",
    intro:
      "General information about the owner of this website, in compliance with Spanish Law 34/2002 on Information Society Services and Electronic Commerce (LSSI-CE).",
    sections: [
      {
        h: "Website owner",
        blocks: [{ company: true }],
      },
      {
        h: "Purpose",
        blocks: [
          {
            p: "This website provides information about ParyUp and lets you browse public events, log in with an existing account and see your tickets and profile. Account sign-up and ticket purchases are done in the mobile app.",
          },
        ],
      },
      {
        h: "Conditions of use",
        blocks: [
          {
            p: "Access to the site is free. By using it you agree to do so in accordance with the law, good faith and this notice, and not to use it for unlawful activities or to harm the site or third parties. Use of the full service is governed by the Terms and conditions.",
          },
        ],
      },
      {
        h: "Intellectual and industrial property",
        blocks: [
          {
            p: "The contents of the site (texts, design, logos, trademarks, images and code) belong to ParyUp or to third parties who have authorised their use, and are protected by intellectual and industrial property law. Reproduction or commercial use without express authorisation is prohibited.",
          },
          {
            p: "Event images and data belong to the corresponding organisers.",
          },
        ],
      },
      {
        h: "Links",
        blocks: [
          {
            p: "The site may include links to third-party pages (for example, a profile's social networks or the app stores). ParyUp does not control those sites and is not responsible for their content or policies.",
          },
        ],
      },
      {
        h: "Disclaimer and liability",
        blocks: [
          {
            p: "We try to keep the information correct and up to date, but we do not guarantee that there are no errors or that the site is always available. To the extent the law allows, ParyUp is not responsible for damage arising from interruptions, technical failures or misuse of the site.",
          },
        ],
      },
      {
        h: "Applicable law",
        blocks: [
          {
            p: "This notice is governed by Spanish law. For any dispute, and if you are a consumer, the courts of your place of residence have jurisdiction.",
          },
        ],
      },
    ],
  },

  cookies: {
    title: "Cookie policy",
    intro:
      "A cookie is a small file that a website saves in your browser. Here we explain which ones this website uses and what they are for.",
    sections: [
      {
        h: "Which cookies we use",
        blocks: [
          {
            p: "This website only uses technical cookies, necessary for what you ask for to work. We do not use analytics, advertising or tracking cookies.",
          },
          {
            ul: [
              "paryup_session: keeps you logged in. It is our own, secure (httpOnly) cookie and expires after 7 days or when you log out.",
              "paryup_lang: remembers the language you chose (Spanish or English). It is our own and lasts 1 year.",
            ],
          },
        ],
      },
      {
        h: "Sign in with Google",
        blocks: [
          {
            p: "If you choose to log in with Google, the page loads a Google component that may use its own cookies or similar technologies according to its policy (policies.google.com). It is only loaded on the login screen.",
          },
        ],
      },
      {
        h: "Why we do not ask for consent",
        blocks: [
          {
            p: "Cookies that are strictly necessary to provide the service you request, such as keeping you logged in or remembering your language, are exempt from consent under the rules. If in the future we add cookies that are not, we will ask for your permission before turning them on.",
          },
        ],
      },
      {
        h: "How to manage them",
        blocks: [
          {
            p: "You can block or delete cookies from your browser settings. If you delete paryup_session you will have to log in again, and if you delete paryup_lang the website will go back to your browser's language.",
          },
        ],
      },
      {
        h: "Changes",
        blocks: [
          {
            p: "We will update this policy if the cookies we use change. The date of the latest revision appears at the top.",
          },
        ],
      },
    ],
  },

  "community-guidelines": {
    title: "Community guidelines",
    intro:
      "ParyUp exists to make going out easier and safer. These guidelines apply to everything you do on the platform: your profile, your messages, your photos and your matches.",
    sections: [
      {
        h: "Respect other people",
        blocks: [
          {
            ul: [
              "Treat everyone with respect. Harassment, threats and bullying are not tolerated.",
              "Do not discriminate or incite hatred because of origin, race, religion, gender, sexual orientation, disability or any other condition.",
              "No means no. If someone does not want to talk to you, do not insist: you may be blocked.",
            ],
          },
        ],
      },
      {
        h: "Content that is not allowed",
        blocks: [
          {
            ul: [
              "Sexually explicit content, or content posted without the consent of the people in it.",
              "Violence, threats, self-harm or content that glorifies harm.",
              "Any content that sexualises or puts minors at risk.",
              "Sale or promotion of illegal drugs, weapons or other prohibited products.",
              "Other people's private information (phone, address, documents) without their permission.",
              "Content that infringes copyright, image rights or trademarks.",
            ],
          },
        ],
      },
      {
        h: "Be yourself",
        blocks: [
          {
            ul: [
              "Do not pretend to be another person, club or brand.",
              "Use real photos and details on your profile.",
              "One person, one account. Do not create accounts to evade a block or a sanction.",
            ],
          },
        ],
      },
      {
        h: "Tickets and events",
        blocks: [
          {
            ul: [
              "Do not resell tickets for profit or share them: each QR is personal.",
              "Do not forge tickets or try to get in with a ticket that is not yours.",
              "Respect the rules of the venue and the organiser, and their staff.",
            ],
          },
        ],
      },
      {
        h: "Chats, matches and location",
        blocks: [
          {
            ul: [
              "Matches and chats are based on the consent of both sides.",
              "Do not share screenshots or private conversations to embarrass or expose someone.",
              "Do not use another person's live location to find or follow them against their will.",
              "Do not use ParyUp for spam, scams, pyramid schemes or unsolicited promotions.",
            ],
          },
        ],
      },
      {
        h: "How to report",
        blocks: [
          {
            p: "If you see something that breaks these guidelines, you can report it from the app (on a profile, a message or an event) or write to the contact email. You can also block or mute anyone at any time. If there is an immediate risk to you or someone else, call the emergency services (112).",
          },
        ],
      },
      {
        h: "What happens if they are not followed",
        blocks: [
          {
            p: "We review reports and, depending on how serious they are, we may remove content, warn, limit features, suspend or close the account and, in serious cases, inform the authorities. If you think we have made a mistake, write to us and we will review it.",
          },
        ],
      },
    ],
  },
};
