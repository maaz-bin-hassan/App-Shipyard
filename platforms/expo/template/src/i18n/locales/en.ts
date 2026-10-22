export const en = {
  "permissions": {
    "actions": {
      "allow": "Allow",
      "notNow": "Not now",
      "openSettings": "Open Settings",
      "checking": "Checking permission…"
    },
    "camera": {
      "title": "Camera",
      "body": "The camera lets you take a photo in the app, for example a profile picture or a scan.",
      "deniedTitle": "Camera is off",
      "deniedBody": "The camera prompt will not appear again. Turn the camera on in Settings to take a photo."
    },
    "photos": {
      "title": "Photos",
      "body": "Photo access lets you choose a picture you already have and attach it.",
      "deniedTitle": "Photos are off",
      "deniedBody": "The photos prompt will not appear again. Turn photo access on in Settings to choose a picture."
    },
    "notifications": {
      "title": "Notifications",
      "body": "Notifications tell you when something you asked about is ready.",
      "deniedTitle": "Notifications are off",
      "deniedBody": "The notification prompt will not appear again. Turn notifications on in Settings to get those alerts."
    },
    "location": {
      "title": "Location",
      "body": "Location lets the app show nearby results and set your place on the map.",
      "deniedTitle": "Location is off",
      "deniedBody": "The location prompt will not appear again. Turn location on in Settings to see nearby results."
    },
    "microphone": {
      "title": "Microphone",
      "body": "The microphone lets you record a voice message in the app.",
      "deniedTitle": "Microphone is off",
      "deniedBody": "The microphone prompt will not appear again. Turn the microphone on in Settings to record."
    },
    "contacts": {
      "title": "Contacts",
      "body": "Contacts lets you pick a person to invite without typing their details.",
      "deniedTitle": "Contacts are off",
      "deniedBody": "The contacts prompt will not appear again. Turn contacts on in Settings to pick a person."
    },
    "calendar": {
      "title": "Calendar",
      "body": "Calendar access lets the app add an event you create to your calendar.",
      "deniedTitle": "Calendar is off",
      "deniedBody": "The calendar prompt will not appear again. Turn calendar access on in Settings to add the event."
    },
    "bluetooth": {
      "title": "Bluetooth",
      "body": "Bluetooth lets the app connect to a nearby device it works with.",
      "deniedTitle": "Bluetooth is off",
      "deniedBody": "The Bluetooth prompt will not appear again. Turn Bluetooth access on in Settings to connect."
    }
  },
  "settings": {
    "consent": {
      "title": "Analytics and crash reports",
      "body": "When this is on, the app sends product events to PostHog and crash reports to Sentry. When it is off, neither receives anything.",
      "on": "On",
      "off": "Off"
    }
  },
  "billing": {
    "premiumActive": "Premium is active on this account.",
    "loadingPlans": "Loading plans…",
    "plansFailed": "Plans could not be loaded.",
    "tryAgain": "Try again",
    "noPlans": "No plans are available right now.",
    "restore": "Restore purchases",
    "priceUnavailable": "Price unavailable",
    "purchaseFailed": "Purchase failed",
    "checking": "Checking your purchase…",
    "loadFailed": "Could not load purchases",
    "restoreFailed": "Could not restore purchases",
    "plansLoadFailed": "Could not load plans"
  },
  "shell": {
    "home": {
      "body": "The home screen is free. Premium tools unlock after a store purchase.",
      "backend": "AI calls go through the Supabase proxy. The provider key stays on the server."
    },
    "nav": {
      "home": "Home",
      "premium": "Premium",
      "plans": "Plans",
      "settings": "Settings"
    },
    "premium": {
      "needsKey": "Add the RevenueCat public SDK keys in .env to load plans."
    },
    "plans": {
      "needsKey": "Add the RevenueCat public SDK keys in .env. Plan prices come from the store."
    },
    "setup": {
      "title": "Still to fill in",
      "body": "Copy .env.example to .env and set the blank public keys. Replace assets/icon.png with your logo."
    }
  },
  "errors": {
    "permissionCheck": "Could not check this permission."
  }
} as const;
